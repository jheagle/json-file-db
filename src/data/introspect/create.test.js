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
    expect.assertions(2)
    const recordName = 'foo'
    const result = await create(recordName, [
      {
        name: '_id',
        type: 'string',
        optional: false,
        keys: [
          {
            type: 'primary',
            references: ['self'],
            autoGenerate: true
          }
        ]
      },
      {
        name: 'bar',
        type: 'string',
        optional: true,
        keys: []
      }
    ])
    expect(testHelpers.fileExists(`${result}.json`)).toBeTruthy()
    expect(testHelpers.fileExists(`${result}`)).toBeTruthy()
  })
})
