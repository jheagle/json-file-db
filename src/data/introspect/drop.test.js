import { create } from './create'
import { drop } from './drop'
import { testHelpers } from 'js-build-tools/testHelpers'

const { writeFile, readFile } = require('fs/promises')

const databasePath = 'drop-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

describe('drop', () => {
  test('returns null for the reserved __RECORDS name, without touching anything', async () => {
    expect(await drop('__RECORDS')).toBeNull()
  })

  test('removes every entry file listed on the record', async () => {
    const recordName = 'foo'
    await create(recordName, [], [])
    // insertEntity is not implemented yet, so simulate a real entry directly: write the data file, and record it
    // on the record's own entries list, exactly as a working insertEntity would.
    const entryFile = 'entry1.json'
    await writeFile(`${databasePath}${recordName}/${entryFile}`, JSON.stringify({ _id: 1 }))
    const recordContent = JSON.parse(await readFile(`${databasePath}${recordName}.json`, 'utf8'))
    recordContent.entries = [entryFile]
    await writeFile(`${databasePath}${recordName}.json`, JSON.stringify(recordContent))

    expect(testHelpers.fileExists(`${databasePath}${recordName}/${entryFile}`)).toBeTruthy()
    await drop(recordName)
    expect(testHelpers.fileExists(`${databasePath}${recordName}/${entryFile}`)).toBeFalsy()
  })

  test('deregisters the record from __RECORDS', async () => {
    await create('foo', [], [])
    await create('bar', [], [])
    await drop('foo')
    const registry = JSON.parse(await readFile(`${databasePath}__RECORDS.json`, 'utf8'))
    expect(registry.entries).toEqual(['bar.json'])
  })
})
