import { registerRecord } from './registerRecord'
import { deregisterRecord } from './deregisterRecord'
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from './config'

const databasePath = 'deregister-record-database/'
configure({ databasePath })
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
