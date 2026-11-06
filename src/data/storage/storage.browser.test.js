jest.mock('fs/promises', () => ({}))
jest.mock('fs', () => ({}))
jest.mock('browser-or-node', () => ({ isNode: false, isBrowser: true }))

import { configure } from '../utilities/config'
import { readJson, storagePath, withReadCache } from './index'
import { query } from '../queries/query'

describe('storage (browser)', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  test('storagePath also puts the relativePath in front', () => {
    configure({ databasePath: 'my-data/', relativePath: 'http://example.com/' })
    expect(storagePath('foo.json')).toBe('http://example.com/my-data/foo.json')
  })

  test('readJson uses fetch(), not fs', async () => {
    configure({ databasePath: 'my-data/', relativePath: 'http://example.com/' })
    const content = { path: 'foo', entries: [] }
    global.fetch = jest.fn().mockResolvedValue({ text: () => Promise.resolve(JSON.stringify(content)) })
    expect(await readJson('foo.json')).toEqual(content)
    expect(global.fetch).toHaveBeenCalledWith('http://example.com/my-data/foo.json')
  })
})

describe('read cache (browser)', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  /**
   * A fetch() that answers every file with `{ version }`, counting calls.
   */
  const versionedFetch = () => {
    const state = { version: 1, calls: 0 }
    global.fetch = jest.fn().mockImplementation(() => {
      state.calls++
      const text = JSON.stringify({ version: state.version })
      return Promise.resolve({ text: () => Promise.resolve(text) })
    })
    return state
  }

  test('a file is fetched once during a call', async () => {
    configure({ databasePath: 'my-data/', relativePath: 'http://example.com/' })
    const state = versionedFetch()
    await withReadCache(async () => {
      await readJson('foo.json')
      await readJson('foo.json')
    })
    expect(state.calls).toBe(1)
  })

  test('each call that starts empties the cache, even while another is still running', async () => {
    configure({ databasePath: 'my-data/', relativePath: 'http://example.com/' })
    const state = versionedFetch()
    let finishFirst
    const firstDone = new Promise(resolve => { finishFirst = resolve })
    const first = withReadCache(async () => {
      expect(await readJson('foo.json')).toEqual({ version: 1 })
      await firstDone
      return readJson('foo.json')
    })
    // The file changes on the server while the first call is still running
    await new Promise(resolve => setTimeout(resolve, 0))
    state.version = 2
    const second = await withReadCache(() => readJson('foo.json'))
    expect(second).toEqual({ version: 2 })
    finishFirst()
    expect(await first).toEqual({ version: 2 })
  })

  test('query() takes the cache in a browser too (through withDatabaseLock)', async () => {
    configure({ databasePath: 'my-data/', relativePath: 'http://example.com/' })
    const record = { path: 'foo', definition: [{ name: 'a', type: 'int', optional: false }], keys: [], entries: ['1.json', '2.json'] }
    const files = { 'foo.json': record, 'foo/1.json': { a: 1 }, 'foo/2.json': { a: 2 } }
    global.fetch = jest.fn().mockImplementation(url => {
      const text = JSON.stringify(files[url.replace('http://example.com/my-data/', '')])
      return Promise.resolve({ text: () => Promise.resolve(text) })
    })
    const [rows] = await query('read foo where a = 2')
    expect(rows).toEqual([{ a: 2 }])
    const fetched = global.fetch.mock.calls.map(([url]) => url)
    expect(new Set(fetched).size).toBe(fetched.length)
  })
})
