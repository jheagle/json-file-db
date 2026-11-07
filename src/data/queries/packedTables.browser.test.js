jest.mock('browser-or-node', () => ({
  isBrowser: true,
  isNode: false
}))

import { configure } from '../utilities/config'
import { query } from './query'
import fs from 'fs'
import os from 'os'
import path from 'path'

// A database written by hand (writes need Node), served over a fake fetch() that answers a missing file the way a
// static host does: a 404 page that isn't JSON
let folder
let requests

const rows = [
  { _id: 'a', day: 'mon', value: 1 },
  { _id: 'b', day: 'tue', value: 2 },
  { _id: 'c', day: 'mon', value: 3 }
]
const record = {
  path: 'items',
  definition: [
    { name: '_id', type: 'string', optional: false, autoGenerate: false },
    { name: 'day', type: 'string', optional: false, autoGenerate: false },
    { name: 'value', type: 'int', optional: false, autoGenerate: false }
  ],
  keys: [
    { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
    { type: 'index', fields: ['day'], lookup: 'index_day.json' }
  ],
  entries: ['a.json', 'b.json', 'c.json']
}
const indexes = {
  'pk__id.json': rows.map(row => ({ value: row._id, record: [`${row._id}.json`] })),
  'index_day.json': [{ value: 'mon', record: ['a.json', 'c.json'] }, { value: 'tue', record: ['b.json'] }]
}

const write = (file, content) => {
  fs.mkdirSync(path.dirname(path.join(folder, file)), { recursive: true })
  fs.writeFileSync(path.join(folder, file), JSON.stringify(content))
}

const writePack = content => write('__packed/items.json', content)

beforeEach(() => {
  folder = fs.mkdtempSync(path.join(os.tmpdir(), 'packed-browser-'))
  write('__RECORDS.json', { path: '', definition: [], keys: [], entries: ['items.json'] })
  write('items.json', record)
  rows.forEach(row => write(`items/${row._id}.json`, row))
  Object.entries(indexes).forEach(([lookup, index]) => write(`__indexes/items/${lookup}`, index))
  requests = []
  global.fetch = jest.fn(async url => {
    requests.push(url.replace('db/', ''))
    const file = path.join(folder, url.replace('db/', ''))
    const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '<!DOCTYPE html><title>404</title>'
    return { text: () => Promise.resolve(text) }
  })
  configure({ databasePath: 'db/', relativePath: '', packedReads: undefined })
})

afterEach(() => {
  fs.rmSync(folder, { recursive: true, force: true })
  delete global.fetch
})

describe('packed tables (browser)', () => {
  test('a full read requests the record file and its packed file, not one request per row', async () => {
    writePack({ entries: record.entries, rows, indexes })
    const [found] = await query('read items')
    expect(found).toEqual(rows)
    expect(requests).toEqual(['items.json', '__packed/items.json'])
  })

  test('an indexed where takes its index and rows from the packed file', async () => {
    writePack({ entries: record.entries, rows, indexes })
    const [found] = await query("read items where day = 'mon'")
    expect(found.map(row => row._id)).toEqual(['a', 'c'])
    expect(requests.filter(url => url.startsWith('items/') || url.startsWith('__indexes/'))).toEqual([])
  })

  test('without a packed file, reads request the entry files as before', async () => {
    const [found] = await query('read items')
    expect(found).toEqual(rows)
    expect(requests).toEqual(['items.json', '__packed/items.json', 'items/a.json', 'items/b.json', 'items/c.json'])
  })

  test('a packed file whose entries no longer match the record is not used', async () => {
    writePack({ entries: ['a.json', 'b.json'], rows: rows.slice(0, 2), indexes })
    const [found] = await query('read items')
    expect(found).toEqual(rows)
    expect(requests).toContain('items/c.json')
  })

  test('packedReads: false reads the entry files even when there is a packed file', async () => {
    writePack({ entries: record.entries, rows: rows.map(row => ({ ...row, fromPack: true })), indexes })
    configure({ packedReads: false })
    const [found] = await query('read items')
    expect(found).toEqual(rows)
    expect(requests).not.toContain('__packed/items.json')
  })
})
