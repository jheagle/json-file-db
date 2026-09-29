import { updateIndex } from './updateIndex'
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from './config'

const databasePath = 'update-index-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

describe('updateIndex', () => {
  test('does nothing for a key with no lookup', async () => {
    const result = await updateIndex('foo', { type: 'multi', fields: ['a', 'b'], lookup: '' }, 'x', 'x.json')
    expect(result).toBeNull()
  })

  test('creates a new index file the first time a value is indexed', async () => {
    const key = { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
    const result = await updateIndex('foo', key, 1, '1.json')
    expect(result).toEqual([{ value: 1, record: ['1.json'] }])
    expect(testHelpers.fileExists(`${databasePath}__indexes/foo/pk__id.json`)).toBeTruthy()
  })

  test('appends a new value onto an existing index file', async () => {
    const key = { type: 'index', fields: ['date'], lookup: 'index_date.json' }
    await updateIndex('foo', key, '2024-06-02', '1.json')
    const result = await updateIndex('foo', key, '2024-06-05', '2.json')
    expect(result).toEqual([
      { value: '2024-06-02', record: ['1.json'] },
      { value: '2024-06-05', record: ['2.json'] }
    ])
  })

  test('adds a matching file onto an existing value instead of duplicating the value', async () => {
    const key = { type: 'index', fields: ['date'], lookup: 'index_date.json' }
    await updateIndex('foo', key, '2024-06-02', '1.json')
    const result = await updateIndex('foo', key, '2024-06-02', '2.json')
    expect(result).toEqual([
      { value: '2024-06-02', record: ['1.json', '2.json'] }
    ])
  })
})
