import { query } from './query'
import { fileExists, setUp } from 'test-filesystem'
import { configure } from '../utilities/config'

const { readFile } = require('fs/promises')

const databasePath = 'schema-statements-database/'
configure({ databasePath })
setUp.setDefaults(databasePath)

beforeEach(setUp.beforeEach)

afterEach(() => {
  configure({ enforceForeignKeys: true })
  return setUp.afterEach()
})

const parents = 'create parents (_id string auto, name string, primary key (_id), index (name))'
const children = 'create children (_id string auto, parent_id string null, primary key (_id), foreign key (parent_id) references parents (_id))'

describe('show records', () => {
  test('an empty database has no records', async () => {
    expect(await query('show records')).toEqual([[]])
  })

  test('lists every record by name, in the order they were created', async () => {
    await query(`${parents}; ${children}; create other ()`)
    expect(await query('show records')).toEqual([['parents', 'children', 'other']])
  })
})

describe('describe', () => {
  test('gives the record\'s fields and keys', async () => {
    await query(parents)
    await query("insert parents values name = 'P'")
    const [description] = await query('describe parents')
    expect(description).toEqual({
      path: 'parents',
      definition: [
        { name: '_id', type: 'string', optional: false, autoGenerate: true },
        { name: 'name', type: 'string', optional: false, autoGenerate: false }
      ],
      keys: [
        { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
        { type: 'index', fields: ['name'], lookup: 'index_name.json' }
      ]
    })
    expect(description).not.toHaveProperty('entries')
  })

  test('a record that does not exist is an error', async () => {
    await expect(query('describe nope')).rejects.toThrow('Record "nope" doesn\'t exist')
  })
})

describe('drop', () => {
  test('removes the record, its entries and indexes, and resolves to the definition it had', async () => {
    const [created] = await query(parents)
    await query("insert parents values name = 'P'")
    const [dropped] = await query('drop parents')
    expect(dropped).toMatchObject({ path: 'parents', definition: created.definition, keys: created.keys })
    expect(dropped.entries).toHaveLength(1)
    expect(fileExists(`${databasePath}parents.json`)).toBeFalsy()
    expect(fileExists(`${databasePath}parents`)).toBeFalsy()
    expect(fileExists(`${databasePath}__indexes/parents`)).toBeFalsy()
    expect(await query('show records')).toEqual([[]])
  })

  test('the name can be created again afterwards', async () => {
    await query(`${parents}; drop parents`)
    const [created] = await query('create parents (a int)')
    expect(created.definition.map(field => field.name)).toEqual(['a'])
  })

  test('a record that does not exist is an error, or nothing with if exists', async () => {
    await expect(query('drop nope')).rejects.toThrow('Record "nope" doesn\'t exist')
    expect(await query('drop if exists nope')).toEqual([null])
  })

  describe('a record another record references', () => {
    test('is rejected, leaving both in place', async () => {
      await query(`${parents}; ${children}`)
      await expect(query('drop parents')).rejects.toThrow('Cannot drop "parents": children.parent_id references it')
      expect(fileExists(`${databasePath}parents.json`)).toBeTruthy()
      const registry = JSON.parse(await readFile(`${databasePath}__RECORDS.json`, 'utf8'))
      expect(registry.entries).toEqual(['parents.json', 'children.json'])
    })

    test('can be dropped once the referencing record is gone', async () => {
      await query(`${parents}; ${children}; drop children`)
      expect(await query('drop parents')).toHaveLength(1)
      expect(await query('show records')).toEqual([[]])
    })

    test('can be dropped anyway when enforceForeignKeys is turned off', async () => {
      configure({ enforceForeignKeys: false })
      await query(`${parents}; ${children}`)
      await query('drop parents')
      expect(await query('show records')).toEqual([['children']])
    })

    test('a record referencing only itself can be dropped', async () => {
      await query('create nodes (_id string auto, up string null, primary key (_id), foreign key (up) references nodes (_id))')
      await query('drop nodes')
      expect(fileExists(`${databasePath}nodes.json`)).toBeFalsy()
    })
  })
})
