import { create } from './create'
import { describe as describeRecord } from './describe'
import { testHelpers } from 'js-build-tools/testHelpers'

const databasePath = 'describe-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
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

describe('describe', () => {
  test('describes a record by returning its field definition', async () => {
    await create('foo', definition, keys)
    const result = await describeRecord('foo')
    expect(result).toEqual(definition)
  })

  test('describes __RECORDS by returning the list of known records', async () => {
    await create('foo', definition, keys)
    await create('bar', definition, keys)
    const result = await describeRecord()
    expect(result).toEqual(['foo.json', 'bar.json'])
  })
})
