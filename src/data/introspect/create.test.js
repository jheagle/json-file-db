import { create } from './create'
import { testHelpers } from 'js-build-tools/testHelpers'

const databasePath = 'create-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

describe('create', () => {
  test('create a new record', async () => {
    expect.assertions(3)
    const recordName = 'foo'
    const definition = [
      {
        name: '_id',
        type: 'string',
        optional: false,
        autoGenerate: true
      },
      {
        name: 'bar',
        type: 'string',
        optional: true,
        autoGenerate: false
      }
    ]
    const keys = [
      {
        type: 'primary',
        fields: [
          '_id'
        ],
        lookup: 'pk__id.json'
      }
    ]
    const result = await create(recordName, definition, keys)
    expect(result).toEqual({
      path: recordName,
      definition: definition,
      keys: keys,
      entries: []
    })
    expect(testHelpers.fileExists(`${databasePath}${recordName}.json`)).toBeTruthy()
    expect(testHelpers.fileExists(`${databasePath}${recordName}`)).toBeTruthy()
  })

  test('registers the new record in __RECORDS', async () => {
    await create('foo', [], [])
    const { readFile } = require('fs/promises')
    const registry = JSON.parse(await readFile(`${databasePath}__RECORDS.json`, 'utf8'))
    expect(registry.entries).toContain('foo.json')
  })
})
