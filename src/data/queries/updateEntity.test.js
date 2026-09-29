import { create } from '../introspect/create'
import { insertEntity } from './insertEntity'
import { updateEntity } from './updateEntity'
import { testHelpers } from 'js-build-tools/testHelpers'

const { readFile } = require('fs/promises')

const databasePath = 'update-entity-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

const definition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'bar', type: 'string', optional: true, autoGenerate: false },
  { name: 'note', type: 'string', optional: true, autoGenerate: false }
]

const keys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
]

describe('updateEntity', () => {
  test('does nothing when dataSet has no rows to update', async () => {
    await create('foo', definition, keys)
    const result = await updateEntity('foo', { bar: 'changed' }, { foo: [] })
    expect(result).toEqual({ foo: [] })
  })

  test('throws when the record has no single-field primary key', async () => {
    await create('foo', definition, [])
    await expect(updateEntity('foo', { bar: 'x' }, { foo: [{ _id: '1' }] }))
      .rejects.toThrow('Cannot update "foo" without a single-field primary key')
  })

  test('throws when no entry matches the row being updated', async () => {
    await create('foo', definition, keys)
    await expect(updateEntity('foo', { bar: 'x' }, { foo: [{ _id: 'missing' }] }))
      .rejects.toThrow('Could not find entry for foo where "_id" = missing')
  })

  test('merges the given values onto the existing entry file, leaving other fields intact', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one', note: 'keep me' }], {})
    const row = inserted.foo[0]

    const result = await updateEntity('foo', { bar: 'updated' }, { foo: [row] })

    expect(result.foo).toEqual([{ _id: row._id, bar: 'updated', note: 'keep me' }])
    const onDisk = JSON.parse(await readFile(`${databasePath}foo/${row._id}.json`, 'utf8'))
    expect(onDisk).toEqual({ _id: row._id, bar: 'updated', note: 'keep me' })
  })

  test('finds the right file to update even when a filename does not match the primary key', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one' }], {})
    const row = inserted.foo[0]
    const { rename, writeFile } = require('fs/promises')
    await rename(`${databasePath}foo/${row._id}.json`, `${databasePath}foo/custom-name.json`)
    const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    recordFile.entries = ['custom-name.json']
    await writeFile(`${databasePath}foo.json`, JSON.stringify(recordFile))

    const result = await updateEntity('foo', { bar: 'moved' }, { foo: [row] })
    expect(result.foo[0].bar).toBe('moved')
    const onDisk = JSON.parse(await readFile(`${databasePath}foo/custom-name.json`, 'utf8'))
    expect(onDisk.bar).toBe('moved')
  })

  test('throws when the update would remove a required field', async () => {
    const definitionRequiringBar = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'bar', type: 'string', optional: false, autoGenerate: false }
    ]
    await create('foo', definitionRequiringBar, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one' }], {})
    await expect(updateEntity('foo', { bar: undefined }, { foo: [inserted.foo[0]] }))
      .rejects.toThrow('Missing required field "bar" for foo')
  })

  test('moves a changed unique key value to a new index entry', async () => {
    const uniqueDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'email', type: 'string', optional: false, autoGenerate: false }
    ]
    const uniqueKeys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
      { type: 'unique', fields: ['email'], lookup: 'unique_email.json' }
    ]
    await create('foo', uniqueDefinition, uniqueKeys)
    const inserted = await insertEntity('foo', [{ email: 'old@example.com' }], {})
    const row = inserted.foo[0]

    await updateEntity('foo', { email: 'new@example.com' }, { foo: [row] })

    const emailIndex = JSON.parse(await readFile(`${databasePath}__indexes/foo/unique_email.json`, 'utf8'))
    expect(emailIndex).toEqual([{ value: 'new@example.com', record: [`${row._id}.json`] }])
  })

  test('rejects an update that collides with another record\'s unique value', async () => {
    const uniqueDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'email', type: 'string', optional: false, autoGenerate: false }
    ]
    const uniqueKeys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
      { type: 'unique', fields: ['email'], lookup: 'unique_email.json' }
    ]
    await create('foo', uniqueDefinition, uniqueKeys)
    const inserted = await insertEntity('foo', [{ email: 'first@example.com' }, { email: 'second@example.com' }], {})

    await expect(updateEntity('foo', { email: 'second@example.com' }, { foo: [inserted.foo[0]] }))
      .rejects.toThrow('Duplicate value for unique key "email" on foo')
  })

  test('re-updating a row to its own existing unique value does not falsely collide', async () => {
    const uniqueDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'email', type: 'string', optional: false, autoGenerate: false }
    ]
    const uniqueKeys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
      { type: 'unique', fields: ['email'], lookup: 'unique_email.json' }
    ]
    await create('foo', uniqueDefinition, uniqueKeys)
    const inserted = await insertEntity('foo', [{ email: 'same@example.com' }], {})
    const row = inserted.foo[0]

    const result = await updateEntity('foo', { email: 'same@example.com' }, { foo: [row] })
    expect(result.foo[0].email).toBe('same@example.com')
  })
})
