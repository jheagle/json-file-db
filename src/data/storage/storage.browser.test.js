jest.mock('fs/promises', () => ({}))
jest.mock('fs', () => ({}))
jest.mock('browser-or-node', () => ({ isNode: false, isBrowser: true }))

import { configure } from '../utilities/config'
import { readJson, storagePath } from './index'

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
    global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(content) })
    expect(await readJson('foo.json')).toEqual(content)
    expect(global.fetch).toHaveBeenCalledWith('http://example.com/my-data/foo.json')
  })
})
