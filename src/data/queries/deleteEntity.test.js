import { create } from '../introspect/create'
import { insertEntity } from './insertEntity'
import { deleteEntity } from './deleteEntity'
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from '../utilities/config'

const { readFile } = require('fs/promises')

const databasePath = 'delete-entity-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

const definition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'bar', type: 'string', optional: true, autoGenerate: false }
]

const keys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
]

describe('deleteEntity', () => {
  test('does nothing when dataSet has no rows to delete', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'keep' }], {})
    const result = await deleteEntity('foo', { foo: [] })
    expect(result).toEqual({ foo: [] })
    const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    expect(recordFile.entries).toEqual([`${inserted.foo[0]._id}.json`])
  })

  test('throws when the record has no primary key', async () => {
    await create('foo', definition, [])
    await expect(deleteEntity('foo', { foo: [{ _id: '1' }] }))
      .rejects.toThrow('Cannot delete from "foo" without a primary key')
  })

  test('removes the matching entry file, entries[] entry, and index entry', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one' }, { bar: 'two' }], {})
    const [keep, remove] = inserted.foo

    await deleteEntity('foo', { foo: [remove] })

    expect(testHelpers.fileExists(`${databasePath}foo/${remove._id}.json`)).toBeFalsy()
    expect(testHelpers.fileExists(`${databasePath}foo/${keep._id}.json`)).toBeTruthy()

    const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    expect(recordFile.entries).toEqual([`${keep._id}.json`])

    const indexFile = JSON.parse(await readFile(`${databasePath}__indexes/foo/pk__id.json`, 'utf8'))
    expect(indexFile).toEqual([{ value: keep._id, record: [`${keep._id}.json`] }])
  })

  test('finds the right file to delete even when a filename does not match the primary key', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one' }], {})
    const entryFile = `${inserted.foo[0]._id}.json`
    const { rename } = require('fs/promises')
    await rename(`${databasePath}foo/${entryFile}`, `${databasePath}foo/custom-name.json`)
    const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    recordFile.entries = ['custom-name.json']
    const { writeFile } = require('fs/promises')
    await writeFile(`${databasePath}foo.json`, JSON.stringify(recordFile))

    await deleteEntity('foo', { foo: [inserted.foo[0]] })

    expect(testHelpers.fileExists(`${databasePath}foo/custom-name.json`)).toBeFalsy()
    const finalRecordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    expect(finalRecordFile.entries).toEqual([])
  })

  test('deletes multiple rows from one call', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one' }, { bar: 'two' }, { bar: 'three' }], {})

    await deleteEntity('foo', { foo: [inserted.foo[0], inserted.foo[2]] })

    const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    expect(recordFile.entries).toEqual([`${inserted.foo[1]._id}.json`])
  })

  describe('multi-field primary key', () => {
    const multiDefinition = [
      { name: 'a', type: 'string', optional: false },
      { name: 'b', type: 'string', optional: false }
    ]
    const compositePrimaryKeys = [
      { type: 'primary', fields: ['a', 'b'], lookup: 'pk_a_b.json' }
    ]

    test('deletes only the row matching every field of the composite key', async () => {
      await create('foo', multiDefinition, compositePrimaryKeys)
      const inserted = await insertEntity('foo', [{ a: 'x', b: 'y' }, { a: 'x', b: 'z' }], {})

      await deleteEntity('foo', { foo: [{ a: 'x', b: 'y' }] })

      const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
      expect(recordFile.entries).toHaveLength(1)
      const remaining = JSON.parse(await readFile(`${databasePath}foo/${recordFile.entries[0]}`, 'utf8'))
      expect(remaining).toEqual(inserted.foo[1])
    })

    test('removes the composite index entry too', async () => {
      await create('foo', multiDefinition, compositePrimaryKeys)
      await insertEntity('foo', [{ a: 'x', b: 'y' }], {})

      await deleteEntity('foo', { foo: [{ a: 'x', b: 'y' }] })

      const indexFile = JSON.parse(await readFile(`${databasePath}__indexes/foo/pk_a_b.json`, 'utf8'))
      expect(indexFile).toEqual([])
    })
  })
})
