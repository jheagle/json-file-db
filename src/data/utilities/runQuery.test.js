import { create } from '../introspect/create'
import { insertEntity } from '../queries/insertEntity'
import { runQuery } from './runQuery'
import { testHelpers } from 'js-build-tools/testHelpers'

const databasePath = 'run-query-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

const definition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'bar', type: 'string', optional: false, autoGenerate: false }
]

const keys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
]

const baseParsed = (overrides) => Object.assign({
  entity: 'foo',
  joinEntity: undefined,
  conditions: [],
  joinClauses: [],
  mergeJoins: [],
  sortClauses: [],
  groupBy: undefined
}, overrides)

describe('runQuery', () => {
  describe('delete', () => {
    test('deletes only the rows matching a non-indexed condition', async () => {
      await create('foo', definition, keys)
      await insertEntity('foo', [{ bar: 'keep' }, { bar: 'remove' }, { bar: 'keep' }], {})

      const result = await runQuery(baseParsed({
        command: 'delete',
        conditions: [{ property: 'bar', comparator: '=', value: 'remove' }]
      }))

      expect(result.foo.map(row => row.bar)).toEqual(['remove'])
      const remaining = await runQuery(baseParsed({ command: 'read' }))
      expect(remaining.foo.map(row => row.bar).sort()).toEqual(['keep', 'keep'])
    })

    test('with no conditions, deletes every row', async () => {
      await create('foo', definition, keys)
      await insertEntity('foo', [{ bar: 'one' }, { bar: 'two' }], {})

      await runQuery(baseParsed({ command: 'delete' }))

      const remaining = await runQuery(baseParsed({ command: 'read' }))
      expect(remaining.foo).toEqual([])
    })
  })

  describe('update', () => {
    test('updates only the rows matching a non-indexed condition', async () => {
      await create('foo', definition, keys)
      await insertEntity('foo', [{ bar: 'change-me' }, { bar: 'leave-me' }], {})

      const result = await runQuery(baseParsed({
        command: 'update',
        conditions: [{ property: 'bar', comparator: '=', value: 'change-me' }],
        updateValues: { bar: 'changed' }
      }))

      expect(result.foo).toHaveLength(1)
      expect(result.foo[0].bar).toBe('changed')
      const remaining = await runQuery(baseParsed({ command: 'read' }))
      expect(remaining.foo.map(row => row.bar).sort()).toEqual(['changed', 'leave-me'])
    })

    test('with no conditions, updates every row', async () => {
      await create('foo', definition, keys)
      await insertEntity('foo', [{ bar: 'one' }, { bar: 'two' }], {})

      await runQuery(baseParsed({ command: 'update', updateValues: { bar: 'all-changed' } }))

      const remaining = await runQuery(baseParsed({ command: 'read' }))
      expect(remaining.foo.map(row => row.bar)).toEqual(['all-changed', 'all-changed'])
    })
  })
})
