import { query } from './query'
import { create } from '../introspect/create'
import { fileExists, setUp } from 'test-filesystem'
import { configure } from '../utilities/config'

const { readFile } = require('fs/promises')

const databasePath = 'create-record-database/'
configure({ databasePath })
setUp.setDefaults(databasePath)

beforeEach(setUp.beforeEach)

afterEach(setUp.afterEach)

const parents = `create parents (
  _id string auto,
  name string,
  primary key (_id)
)`

describe('create statement', () => {
  test('creates the record and resolves to its definition, as create() does', async () => {
    const [result] = await query(parents)
    const expected = {
      path: 'parents',
      definition: [
        { name: '_id', type: 'string', optional: false, autoGenerate: true },
        { name: 'name', type: 'string', optional: false, autoGenerate: false }
      ],
      keys: [{ type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }],
      entries: []
    }
    expect(result).toEqual(expected)
    expect(JSON.parse(await readFile(`${databasePath}parents.json`, 'utf8'))).toEqual(expected)
    expect(fileExists(`${databasePath}parents`)).toBeTruthy()
    const registry = JSON.parse(await readFile(`${databasePath}__RECORDS.json`, 'utf8'))
    expect(registry.entries).toContain('parents.json')
  })

  test('the new record works with insert and read, keys and defaults included', async () => {
    await query(parents)
    await query(`create children (
      _id string auto,
      parent_id string null,
      code string optional,
      status string default 'new',
      primary key (_id),
      unique (code),
      foreign key (parent_id) references parents (_id)
    )`)
    const [[parent]] = await query("insert parents values name = 'P'")
    await query(`insert children values parent_id = '${parent._id}', code = 'a'`)
    await query('insert children values parent_id = null')
    await expect(query("insert children values parent_id = null, code = 'a'"))
      .rejects.toThrow('Duplicate value for unique key "code" on children')
    await expect(query("insert children values parent_id = 'nope'"))
      .rejects.toThrow('Foreign key "parent_id" on children references a nonexistent parents._id = nope')

    const [rows] = await query('read children sort code desc')
    expect(rows).toHaveLength(2)
    expect(rows.map(row => row.status)).toEqual(['new', 'new'])
    expect(rows.map(row => row.parent_id)).toEqual(expect.arrayContaining([parent._id, null]))
    const stored = JSON.parse(await readFile(`${databasePath}children.json`, 'utf8'))
    expect(stored.keys.map(key => key.lookup)).toEqual(['pk__id.json', 'unique_code.json', 'fk_parent_id.json'])
  })

  test('several statements in one query, each with its own result', async () => {
    const results = await query(`${parents}; create other (a string); insert other values a = 'x'`)
    expect(results).toHaveLength(3)
    expect(results[1].path).toBe('other')
    expect(results[2][0].a).toBe('x')
  })

  describe('a record that already exists', () => {
    test('is an error', async () => {
      await query(parents)
      await expect(query(parents)).rejects.toThrow('Record "parents" already exists')
    })

    test('is left alone with if not exists, resolving to null', async () => {
      await query(parents)
      const before = await readFile(`${databasePath}parents.json`, 'utf8')
      const [result] = await query('create if not exists parents (other int)')
      expect(result).toBeNull()
      expect(await readFile(`${databasePath}parents.json`, 'utf8')).toBe(before)
    })

    test('if not exists still creates a record that is missing', async () => {
      const [result] = await query('create if not exists fresh (a string)')
      expect(result.path).toBe('fresh')
    })

    test('a record made by create() counts too', async () => {
      await create('made', [], [])
      await expect(query('create made (a string)')).rejects.toThrow('Record "made" already exists')
    })
  })

  describe('foreign keys', () => {
    test('rejects a referenced record that does not exist, creating nothing', async () => {
      await expect(query('create children (p string, foreign key (p) references parents (_id))'))
        .rejects.toThrow('Foreign key "p" references "parents", which doesn\'t exist')
      expect(fileExists(`${databasePath}children.json`)).toBeFalsy()
    })

    test('rejects a referenced field that does not exist', async () => {
      await query(parents)
      await expect(query('create children (p string, foreign key (p) references parents (id))'))
        .rejects.toThrow('Foreign key "p" references "parents.id", which is not a field')
    })

    test('may reference the record being created, checked against its own fields', async () => {
      const [result] = await query('create nodes (_id string auto, up string null, primary key (_id), foreign key (up) references nodes (_id))')
      expect(result.keys[1].references).toEqual([{ fields: ['nodes._id'], lookup: 'nodes.json' }])
      await expect(query('create nodes2 (_id string, up string, foreign key (up) references nodes2 (id))'))
        .rejects.toThrow('Foreign key "up" references "nodes2.id", which is not a field')
    })
  })

  test('create() still checks the definition: a default that fails its type', async () => {
    await expect(query("create t (n int default 'abc')"))
      .rejects.toThrow('Invalid default for field "n" of t: Value "abc" is not a valid int')
  })

  test('create() still checks the definition: a nullable primary key field', async () => {
    await expect(query('create t (a string null, primary key (a))'))
      .rejects.toThrow('Primary key field "a" of t can\'t be nullable')
  })
})
