import { create } from '../create'
import { insertEntity } from '../../queries/insertEntity'
import { foreignKeyExists } from './foreignKeyExists'
import { testHelpers } from 'js-build-tools/testHelpers'

const databasePath = 'foreign-key-exists-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

const definition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'name', type: 'string', optional: true, autoGenerate: false }
]

const keys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
]

describe('foreignKeyExists', () => {
  test('returns true when a record has the given property set to the given value', async () => {
    await create('exercises', definition, keys)
    const inserted = await insertEntity('exercises', [{ name: 'Bench Press' }], {})
    const exists = await foreignKeyExists('exercises', '_id', inserted.exercises[0]._id)
    expect(exists).toBe(true)
  })

  test('returns false when no record matches', async () => {
    await create('exercises', definition, keys)
    await insertEntity('exercises', [{ name: 'Bench Press' }], {})
    const exists = await foreignKeyExists('exercises', '_id', 'does-not-exist')
    expect(exists).toBe(false)
  })

  test('returns false for an entity with no entries', async () => {
    await create('exercises', definition, keys)
    const exists = await foreignKeyExists('exercises', '_id', 'anything')
    expect(exists).toBe(false)
  })
})
