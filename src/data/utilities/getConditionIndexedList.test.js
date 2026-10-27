import { query } from '../queries/query'
import { parser } from '../queries/parser'
import { getConditionIndexedList } from './getConditionIndexedList'
import { setUp } from 'test-filesystem'
import { configure } from './config'

const databasePath = 'condition-indexed-list-database/'
configure({ databasePath })
setUp.setDefaults(databasePath)

afterEach(setUp.afterEach)

// The same rows in two entities: `indexed` has an index on a, b, c and d, `plain` has none
const rows = [
  "name = 'r1', a = 1, b = 2, c = 3, d = 4",
  "name = 'r2', a = 1, b = 1, c = 1",
  "name = 'r3', a = 2, b = 2, c = 3",
  "name = 'r4', a = 2, b = 3, c = 3, d = 1",
  "name = 'r5', a = 1, b = null, c = 3, d = null",
  "name = 'r6', a = null, b = 2, c = null",
  "name = 'r7', b = 2, c = 3",
  "name = 'r8', a = 3, b = 2, c = 2, d = 2"
]
const fields = 'a int optional null, b int optional null, c int optional null, d int optional null'

beforeEach(async () => {
  await setUp.beforeEach()
  await query(`create indexed (_id string auto, name string, ${fields}, primary key (_id), index (a), index (b), index (c), index (d))`)
  await query(`create plain (_id string auto, name string, ${fields}, primary key (_id))`)
  for (const row of rows) {
    await query(`insert indexed values ${row}`)
    await query(`insert plain values ${row}`)
  }
})

const names = async (entity, clause) => (await query(`read ${entity} where ${clause}`))[0].map(row => row.name).sort()

/**
 * The rows getConditionIndexedList loads as candidates for a where clause, or undefined when it reads none (every
 * row is a candidate).
 * @param clause
 */
const candidates = async (clause) => {
  const [parsed] = parser(`read indexed where ${clause}`)
  const dataSet = { indexed: [] }
  const resolved = new Set()
  await getConditionIndexedList(parsed, {}, dataSet, resolved)
  return resolved.has('indexed') ? dataSet.indexed.map(row => row.name).sort() : undefined
}

describe('getConditionIndexedList', () => {
  // Every Grammar example in FEATURE_WORK.md, and more, with null and missing values among the rows
  describe('the same rows with and without indexes', () => {
    test.each([
      'a = 1 or b = 2 and c = 3',
      '(a = 1 or b = 2) and c = 3',
      'not a = 1 and b = 2',
      'not (a = 1 or b = 2)',
      'a = 1 and (b = 2 or (c = 3 and not d exists))',
      'a = 1 or b = 1',
      'a = 1 or name = \'r7\'',
      'a = 2 and b = 3',
      'a = 1 and not (b = 2)',
      '(a = 1 or a = 2) and (c = 3 or d is null)',
      'a is null or b is null',
      'd does not exist or d < 2',
      'not (a in [1, 2]) or c between [2, 3]',
      'a = 9 or b = 9',
      'a = 9 and name = \'r1\''
    ])('%s', async (clause) => {
      const expected = await names('plain', clause)
      expect(await names('indexed', clause)).toEqual(expected)
    })

    test('a few expected results, so the comparison can\'t pass on two wrong answers', async () => {
      expect(await names('indexed', 'a = 1 or b = 2 and c = 3')).toEqual(['r1', 'r2', 'r3', 'r5', 'r7'])
      expect(await names('indexed', 'not (a = 1 or b = 2)')).toEqual(['r4'])
      expect(await names('indexed', 'a = 1 and (b = 2 or (c = 3 and not d exists))')).toEqual(['r1'])
    })

    test('update and delete with an indexed or', async () => {
      await query("update indexed set name = 'changed' where a = 3 or b = 3")
      expect(await names('indexed', "name = 'changed'")).toEqual(['changed', 'changed'])
      // r4 (b = 3) was renamed above and stays; r8 (a = 3, c = 2) goes
      await query('delete indexed where a = 1 or c = 2')
      expect((await query('read indexed'))[0].map(row => row.name).sort()).toEqual(['changed', 'r3', 'r6', 'r7'])
    })
  })

  describe('the candidate rows read for each kind of node', () => {
    test('an indexed condition reads its matching rows; an unindexed one reads none (every row is a candidate)', async () => {
      expect(await candidates('a = 1')).toEqual(['r1', 'r2', 'r5'])
      expect(await candidates("name = 'r1'")).toBeUndefined()
    })

    test('and: the intersection of the children that narrow anything', async () => {
      expect(await candidates('a = 1 and b = 2')).toEqual(['r1'])
      expect(await candidates("a = 1 and name = 'r1'")).toEqual(['r1', 'r2', 'r5'])
      // nested under an and: the or's union narrows too
      expect(await candidates('c = 3 and (a = 2 or b = 1)')).toEqual(['r3', 'r4'])
    })

    test('or: the union when every branch is indexed, otherwise every row', async () => {
      expect(await candidates('a = 2 or b = 1')).toEqual(['r2', 'r3', 'r4'])
      expect(await candidates('a = 2 or (b = 1 and c = 1)')).toEqual(['r2', 'r3', 'r4'])
      expect(await candidates("a = 2 or name = 'r1'")).toBeUndefined()
    })

    test('not: every row', async () => {
      expect(await candidates('not a = 1')).toBeUndefined()
      expect(await candidates('not (a = 1 and b = 2)')).toBeUndefined()
      // an and still narrows by its other children
      expect(await candidates('a = 1 and not b = 2')).toEqual(['r1', 'r2', 'r5'])
    })

    test('nothing matching is still resolved: no rows are read, and none reloaded', async () => {
      expect(await candidates('a = 9 or b = 9')).toEqual([])
    })
  })
})
