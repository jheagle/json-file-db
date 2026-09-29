import { registerRecord } from './registerRecord'
import { deregisterRecord } from './deregisterRecord'
import { testHelpers } from 'js-build-tools/testHelpers'

const databasePath = 'deregister-record-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

describe('deregisterRecord', () => {
  test('does nothing when the registry does not exist yet', async () => {
    const result = await deregisterRecord('foo')
    expect(result).toBeNull()
  })

  test('removes a record from the registry, keeping other entries', async () => {
    await registerRecord('foo')
    await registerRecord('bar')
    const result = await deregisterRecord('foo')
    expect(result.entries).toEqual(['bar.json'])
  })
})
