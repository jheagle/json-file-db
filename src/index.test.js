import { query, create, drop, describe as describeRecord, configure } from './index'
import { testHelpers } from 'js-build-tools/testHelpers'

const databasePath = 'public-api-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

describe('the public package entry point', () => {
  test('create, insert, read, update, delete, and drop all work through the exported functions', async () => {
    const definition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'note', type: 'string', optional: true, autoGenerate: false }
    ]
    const keys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
    ]

    await create('foo', definition, keys)

    const inserted = await query("insert foo values note = 'hello'")
    expect(inserted[0]).toHaveLength(1)

    const read = await query('read foo')
    expect(read[0]).toHaveLength(1)
    expect(read[0][0].note).toBe('hello')

    const updated = await query("update foo set note = 'updated' where note = 'hello'")
    expect(updated[0][0].note).toBe('updated')

    const deleted = await query("delete foo where note = 'updated'")
    expect(deleted[0]).toHaveLength(1)

    const afterDelete = await query('read foo')
    expect(afterDelete[0]).toEqual([])

    await drop('foo')
  })

  test('describe reports a record\'s field definition', async () => {
    const definition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true }
    ]
    await create('bar', definition, [])
    const result = await describeRecord('bar')
    expect(result).toEqual(definition)
  })
})
