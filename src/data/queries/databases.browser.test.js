jest.mock('browser-or-node', () => ({
  isBrowser: true,
  isNode: false
}))

import { configure } from '../utilities/config'
import { query } from './query'

// A folder of databases served by a static host: a missing file comes back as a 404 page, which isn't JSON
const files = {
  'dbs/__DATABASES.json': ['real', 'copy'],
  'dbs/copy/notes.json': {
    path: 'notes',
    definition: [{ name: '_id', type: 'string', optional: false, autoGenerate: false }],
    keys: [],
    entries: ['n1.json']
  },
  'dbs/copy/notes/n1.json': { _id: 'n1' }
}

beforeEach(() => {
  configure({ databasePath: 'database/', relativePath: '', databasesPath: 'dbs/', database: 'real' })
  global.fetch = jest.fn(async url => ({
    ok: url in files,
    text: () => Promise.resolve(url in files ? JSON.stringify(files[url]) : '<!DOCTYPE html><title>404</title>')
  }))
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  configure({ databasesPath: undefined, database: undefined })
  delete global.fetch
  jest.restoreAllMocks()
})

describe('several databases (browser)', () => {
  test('show databases and use read the list over fetch(), and reads go to the database in use', async () => {
    const [listed, used, rows] = await query('show databases; use copy; read notes')
    expect(listed).toEqual(['real', 'copy'])
    expect(used).toBe('copy')
    expect(rows).toEqual([{ _id: 'n1' }])
  })

  test('use of a database not in the list says so, and creating or dropping one needs Node', async () => {
    await expect(query('use other')).rejects.toThrow('Database "other" doesn\'t exist (or isn\'t listed in __DATABASES.json)')
    await expect(query('create database other')).rejects.toThrow('only works in Node')
    await expect(query('drop database copy')).rejects.toThrow('only works in Node')
  })
})
