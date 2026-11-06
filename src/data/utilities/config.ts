export type RuntimeSettings = {
  databasePath: string
  relativePath: string
  enforceForeignKeys: boolean
  readConcurrency: number
  format: 'compact' | 'pretty'
}

const defaults: RuntimeSettings = {
  databasePath: 'database/',
  relativePath: '',
  enforceForeignKeys: true,
  readConcurrency: 16,
  format: 'compact'
}

let settings: RuntimeSettings = { ...defaults }

let activeCalls = 0

/**
 * The folder a databasePath points to, so that `database/`, `./database` and its absolute path count as one database.
 * Node only (only Node calls are counted, see trackDatabaseCall).
 * @param databasePath
 */
export const resolveDatabasePath = (databasePath: string): string => require('path').resolve(databasePath)

/**
 * Count a database call (taken by withDatabaseLock as soon as a call is queued) until the returned function is called.
 * While any call is counted, configure() refuses to point databasePath somewhere else: every step of a call reads
 * databasePath again, so a change halfway would write part of the call to one folder and the rest to another.
 */
export const trackDatabaseCall = (): (() => void) => {
  activeCalls++
  let ended = false
  return () => {
    if (!ended) {
      ended = true
      activeCalls--
    }
  }
}

/**
 * Set where this package's data lives: databasePath (a filesystem path, used in Node) and/or
 * relativePath (a URL prefix prepended to databasePath, used when reading over fetch() in a
 * browser). Call this once before using create()/drop()/query() - a fresh consumer has no other
 * way to point this package at their own data directory.
 *
 * enforceForeignKeys (default true) controls whether deleteEntity/updateEntity block an operation
 * that would leave another record's foreign key pointing at a value that no longer exists -
 * mirroring MySQL's own foreign_key_checks setting, which is also toggleable rather than always
 * on, since strict enforcement isn't always what every consumer wants.
 *
 * readConcurrency (default 16) is how many entry files a read has in flight at once (see retrieveFiles): in a browser,
 * how many requests run together.
 *
 * format (default 'compact') is how files are written: 'compact' (no whitespace: smaller files that parse faster) or
 * 'pretty' (indented by 2 spaces, for reading data in diffs). Either is read; formatDatabase rewrites a whole database
 * in one.
 *
 * Changing databasePath while calls are still running or queued throws (see trackDatabaseCall): await them first.
 * @param newSettings
 * @throws {Error} When databasePath would point to another folder while database calls are in progress.
 * @throws {Error} When format is neither 'compact' nor 'pretty'.
 */
export const configure = (newSettings: Partial<RuntimeSettings>): void => {
  if (typeof newSettings.format !== 'undefined' && newSettings.format !== 'compact' && newSettings.format !== 'pretty') {
    throw new Error(`Unknown format "${newSettings.format}": use 'compact' or 'pretty'`)
  }
  if (activeCalls > 0 && typeof newSettings.databasePath !== 'undefined' &&
    resolveDatabasePath(newSettings.databasePath) !== resolveDatabasePath(settings.databasePath)) {
    throw new Error(`Can't change databasePath while ${activeCalls} database call(s) are still running or queued: await them first`)
  }
  settings = { ...settings, ...newSettings }
}

/**
 * Read one runtime setting, falling back to the given default if it was never configured. This is
 * the package's own lightweight replacement for reading settings via js-build-tools/gulp.config -
 * that module is a dev-time build tool, not something a published package should require at
 * runtime, and it isn't available at all once a consumer installs this package on its own.
 * @param key
 * @param defaultValue
 */
export const getSetting = <K extends keyof RuntimeSettings>(key: K, defaultValue: RuntimeSettings[K]): RuntimeSettings[K] => {
  return typeof settings[key] !== 'undefined' ? settings[key] : defaultValue
}
