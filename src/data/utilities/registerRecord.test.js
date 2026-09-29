import { registerRecord } from './registerRecord'
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from './config'

const { readFile } = require('fs/promises')

const databasePath = 'register-record-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

describe('registerRecord', () => {
  test('creates a fresh registry the first time a record is registered', async () => {
    const result = await registerRecord('foo')
    expect(result).toEqual({
      path: '',
      definition: [
        { name: 'path', type: 'string', optional: false, autoGenerate: false },
        { name: 'definition', type: 'object', optional: false, autoGenerate: false },
        { name: 'keys', type: 'array', optional: false, autoGenerate: false },
        { name: 'entries', type: 'array', optional: false, autoGenerate: false }
      ],
      keys: [],
      entries: ['foo.json']
    })
    const onDisk = JSON.parse(await readFile(`${databasePath}__RECORDS.json`, 'utf8'))
    expect(onDisk).toEqual(result)
  })

  test('appends onto an existing registry without disturbing other entries', async () => {
    await registerRecord('foo')
    const result = await registerRecord('bar')
    expect(result.entries).toEqual(['foo.json', 'bar.json'])
  })

  test('registering the same record twice does not duplicate its entry', async () => {
    await registerRecord('foo')
    const result = await registerRecord('foo')
    expect(result.entries).toEqual(['foo.json'])
  })
})
