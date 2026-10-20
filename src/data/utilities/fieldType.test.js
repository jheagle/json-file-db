import { fieldType, keyValueType } from './fieldType'

const record = {
  path: 'workouts',
  definition: [
    { name: '_id', type: 'string', optional: false },
    { name: 'reps', type: 'int', optional: true }
  ],
  keys: [],
  entries: []
}

describe('fieldType', () => {
  test('returns a field\'s declared type', () => {
    expect(fieldType(record, '_id')).toBe('string')
    expect(fieldType(record, 'reps')).toBe('int')
  })

  test('returns undefined for an unknown field or record', () => {
    expect(fieldType(record, 'missing')).toBeUndefined()
    expect(fieldType(undefined, '_id')).toBeUndefined()
  })
})

describe('keyValueType', () => {
  test('a single-field key indexes its field\'s type', () => {
    expect(keyValueType(record, { type: 'primary', fields: ['_id'] })).toBe('string')
  })

  test('a multi-field key has no single type', () => {
    expect(keyValueType(record, { type: 'unique', fields: ['_id', 'reps'] })).toBeUndefined()
  })
})
