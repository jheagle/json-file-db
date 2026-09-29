import { updateIndex } from './updateIndex'
import { removeFromIndex } from './removeFromIndex'
import { testHelpers } from 'js-build-tools/testHelpers'

const { readFile } = require('fs/promises')

const databasePath = 'remove-from-index-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

describe('removeFromIndex', () => {
  test('does nothing for a key with no lookup', async () => {
    const result = await removeFromIndex('foo', { type: 'multi', fields: ['a', 'b'], lookup: '' }, 'x', 'x.json')
    expect(result).toBeNull()
  })

  test('does nothing when the index file does not exist yet', async () => {
    const key = { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
    const result = await removeFromIndex('foo', key, 1, '1.json')
    expect(result).toBeNull()
  })

  test('removes a file from its value, keeping other files on that value', async () => {
    const key = { type: 'index', fields: ['date'], lookup: 'index_date.json' }
    await updateIndex('foo', key, '2024-06-02', '1.json')
    await updateIndex('foo', key, '2024-06-02', '2.json')
    const result = await removeFromIndex('foo', key, '2024-06-02', '1.json')
    expect(result).toEqual([{ value: '2024-06-02', record: ['2.json'] }])
  })

  test('drops the whole value once its last file is removed', async () => {
    const key = { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
    await updateIndex('foo', key, 1, '1.json')
    const result = await removeFromIndex('foo', key, 1, '1.json')
    expect(result).toEqual([])
    const onDisk = JSON.parse(await readFile(`${databasePath}__indexes/foo/pk__id.json`, 'utf8'))
    expect(onDisk).toEqual([])
  })
})
