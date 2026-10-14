import { registerRecord } from './registerRecord'
import { deregisterRecord } from './deregisterRecord'
import { setUp } from 'test-filesystem'
import { configure } from './config'

const databasePath = 'deregister-record-database/'
configure({ databasePath })
setUp.setDefaults(databasePath)

beforeEach(setUp.beforeEach)

afterEach(setUp.afterEach)

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
