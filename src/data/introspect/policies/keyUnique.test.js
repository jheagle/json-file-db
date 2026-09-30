import { create } from '../create'
import { insertEntity } from '../../queries/insertEntity'
import { keyUnique } from './keyUnique'
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from '../../utilities/config'

const databasePath = 'key-unique-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

const definition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'a', type: 'string', optional: true },
  { name: 'b', type: 'string', optional: true }
]

const keys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
]

describe('keyUnique', () => {
  test('returns false (not unique) for an empty references list', async () => {
    await create('foo', definition, keys)
    expect(await keyUnique('foo', [], [])).toBe(false)
  })

  test('returns false when references and checkKeys are different lengths', async () => {
    await create('foo', definition, keys)
    expect(await keyUnique('foo', ['a', 'b'], ['x'])).toBe(false)
  })

  test('single field: true when no existing record has that value', async () => {
    await create('foo', definition, keys)
    expect(await keyUnique('foo', ['a'], ['x'])).toBe(true)
  })

  test('single field: false when an existing record already has that value', async () => {
    await create('foo', definition, keys)
    await insertEntity('foo', [{ a: 'x' }], {})
    expect(await keyUnique('foo', ['a'], ['x'])).toBe(false)
  })

  test('multi-field: true unless every field matches an existing record', async () => {
    await create('foo', definition, keys)
    await insertEntity('foo', [{ a: 'x', b: 'y' }], {})
    expect(await keyUnique('foo', ['a', 'b'], ['x', 'z'])).toBe(true)
    expect(await keyUnique('foo', ['a', 'b'], ['z', 'y'])).toBe(true)
  })

  test('multi-field: false only when every field matches the same existing record', async () => {
    await create('foo', definition, keys)
    await insertEntity('foo', [{ a: 'x', b: 'y' }], {})
    expect(await keyUnique('foo', ['a', 'b'], ['x', 'y'])).toBe(false)
  })
})
