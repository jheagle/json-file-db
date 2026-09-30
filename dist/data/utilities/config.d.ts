export type RuntimeSettings = {
    databasePath: string;
    relativePath: string;
    enforceForeignKeys: boolean;
};
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
 * @param newSettings
 */
export declare const configure: (newSettings: Partial<RuntimeSettings>) => void;
/**
 * Read one runtime setting, falling back to the given default if it was never configured. This is
 * the package's own lightweight replacement for reading settings via js-build-tools/gulp.config -
 * that module is a dev-time build tool, not something a published package should require at
 * runtime, and it isn't available at all once a consumer installs this package on its own.
 * @param key
 * @param defaultValue
 */
export declare const getSetting: <K extends keyof RuntimeSettings>(key: K, defaultValue: RuntimeSettings[K]) => RuntimeSettings[K];
//# sourceMappingURL=config.d.ts.map