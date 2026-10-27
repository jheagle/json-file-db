import { where } from './where'

const dataSet = [
  {
    _id: 1,
    exercise_id: 1,
    weight_effort: '115lbs',
    reps: 10,
    sets: 3,
    note: '',
    date: '2024-06-02'
  },
  {
    _id: 2,
    exercise_id: 2,
    weight_effort: '155lbs',
    reps: 10,
    sets: 3,
    note: '',
    date: '2024-06-02'
  },
  {
    _id: 3,
    exercise_id: 3,
    weight_effort: '155lbs',
    reps: 10,
    sets: 3,
    note: '',
    date: '2024-06-02'
  }
]

describe('where', () => {
  test('will find with given data', () => {
    const result = where(dataSet, {
      property: 'date',
      comparator: '=',
      value: '2024-06-02'
    })
    expect(result).toEqual(dataSet)
  })

  test('will return no matches', () => {
    const result = where(dataSet, {
      property: 'date',
      comparator: '=',
      value: '2021-06-02'
    })
    expect(result).toEqual([])
  })

  test('only one match', () => {
    const result = where(dataSet, {
      property: 'exercise_id',
      comparator: '=',
      value: '2'
    })
    expect(result).toEqual([{
      _id: 2,
      exercise_id: 2,
      weight_effort: '155lbs',
      reps: 10,
      sets: 3,
      note: '',
      date: '2024-06-02'
    }])
  })

  test('!= excludes the matching record', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '!=', value: 2 })
    expect(result.map(r => r._id)).toEqual([1, 3])
  })

  test('<> excludes the matching record', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '<>', value: 2 })
    expect(result.map(r => r._id)).toEqual([1, 3])
  })

  test('> finds records above the value', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '>', value: 1 })
    expect(result.map(r => r._id)).toEqual([2, 3])
  })

  test('>= finds records at or above the value', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '>=', value: 2 })
    expect(result.map(r => r._id)).toEqual([2, 3])
  })

  test('< finds records below the value', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '<', value: 3 })
    expect(result.map(r => r._id)).toEqual([1, 2])
  })

  test('<= finds records at or below the value', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '<=', value: 2 })
    expect(result.map(r => r._id)).toEqual([1, 2])
  })

  test('in finds records whose value is in the given list', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: 'in', value: [1, 3] })
    expect(result.map(r => r._id)).toEqual([1, 3])
  })

  test('in returns no matches when value is not a list', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: 'in', value: 1 })
    expect(result).toEqual([])
  })

  test('between finds records within the inclusive range', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: 'between', value: [2, 3] })
    expect(result.map(r => r._id)).toEqual([2, 3])
  })

  test('like matches a % wildcard pattern', () => {
    const result = where(dataSet, { property: 'weight_effort', comparator: 'like', value: '15%' })
    expect(result.map(r => r._id)).toEqual([2, 3])
  })

  test('like matches a _ single-character wildcard', () => {
    const result = where(dataSet, { property: 'weight_effort', comparator: 'like', value: '1_5lbs' })
    expect(result.map(r => r._id)).toEqual([1, 2, 3])
  })

  test('like is case-insensitive and escapes regex-special characters', () => {
    const result = where(dataSet, { property: 'date', comparator: 'like', value: '2024-06-02' })
    expect(result).toEqual(dataSet)
  })

  test('= with a declared type matches a value stored with a different type', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '=', value: '2', type: 'string' })
    expect(result.map(row => row._id)).toEqual([2])
  })

  test('!= with a declared type excludes a value stored with a different type', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '!=', value: '2', type: 'string' })
    expect(result.map(row => row._id)).toEqual([1, 3])
  })

  test('in with a declared type matches values stored with a different type', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: 'in', value: ['1', '3'], type: 'string' })
    expect(result.map(row => row._id)).toEqual([1, 3])
  })

  test('in without a declared type still matches strictly', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: 'in', value: ['1', '3'] })
    expect(result).toEqual([])
  })

  test('ordering ignores the declared type and compares the stored values', () => {
    const result = where(dataSet, { property: 'exercise_id', comparator: '>', value: 1, type: 'string' })
    expect(result.map(row => row._id)).toEqual([2, 3])
  })

  describe('null and missing', () => {
    const rows = [
      { _id: 1, n: 5 },
      { _id: 2, n: 0 },
      { _id: 3, n: null },
      { _id: 4 }
    ]
    const ids = (comparator, value = null) => where(rows, { property: 'n', comparator, value, type: 'int' }).map(row => row._id)

    test.each([
      ['<', 6, [1, 2]],
      ['<=', 0, [2]],
      ['>', -1, [1, 2]],
      ['>=', 0, [1, 2]],
      ['=', 0, [2]],
      ['!=', 5, [2]],
      ['<>', 5, [2]],
      ['in', [0, 5], [1, 2]],
      ['between', [-1, 5], [1, 2]]
    ])('%s %j never matches a null or missing field (null used to act as 0)', (comparator, value, expected) => {
      expect(ids(comparator, value)).toEqual(expected)
    })

    test('a null never equals anything, not even a null', () => {
      expect(ids('=', null)).toEqual([])
      expect(ids('!=', null)).toEqual([])
      expect(ids('in', [null])).toEqual([])
    })

    test('is null: the field is there and holds null', () => {
      expect(ids('is null')).toEqual([3])
    })

    test('is not null: the field is there and holds a value', () => {
      expect(ids('is not null')).toEqual([1, 2])
    })

    test('exists / does not exist: the field is there (null counts) / is missing', () => {
      expect(ids('exists')).toEqual([1, 2, 3])
      expect(ids('does not exist')).toEqual([4])
    })

    test('between with a null bound matches nothing (null used to act as a 0 bound)', () => {
      expect(ids('between', [null, 5])).toEqual([])
      expect(ids('between', [-1, null])).toEqual([])
    })

    test('like never matches null', () => {
      expect(where([{ s: null }, { s: 'null' }], { property: 's', comparator: 'like', value: '%' })).toEqual([{ s: 'null' }])
    })
  })

  describe('ordering by the declared type', () => {
    const strings = [{ s: '9' }, { s: '10' }, { s: 2 }]
    const ints = [{ n: '9' }, { n: 10 }, { n: 2 }]
    const values = (dataSet, property, type, comparator, value) =>
      where(dataSet, { property, comparator, value, type }).map(row => row[property])

    test.each([2, '2'])('a string field compares as text, whether the literal is %j', (literal) => {
      expect(values(strings, 's', 'string', '>', literal)).toEqual(['9'])
      expect(values(strings, 's', 'string', '>=', literal)).toEqual(['9', 2])
      expect(values(strings, 's', 'string', '<', literal)).toEqual(['10'])
      expect(values(strings, 's', 'string', '<=', literal)).toEqual(['10', 2])
      expect(values(strings, 's', 'string', 'between', [1, literal])).toEqual(['10', 2])
    })

    test.each([5, '5'])('an int field compares as numbers, even a value stored as a numeric string (literal %j)', (literal) => {
      expect(values(ints, 'n', 'int', '>', literal)).toEqual(['9', 10])
      expect(values(ints, 'n', 'int', '<=', literal)).toEqual([2])
      expect(values(ints, 'n', 'int', 'between', [literal, '9'])).toEqual(['9'])
    })

    test('a field with no declared type, or one compareAs leaves alone, compares the raw values', () => {
      expect(values(strings, 's', undefined, '>', '2')).toEqual(['9'])
      expect(values(strings, 's', 'object', '>', '2')).toEqual(['9'])
    })

    test('null and missing still match no ordering, and a null bound still matches nothing', () => {
      const withNulls = [{ s: '9' }, { s: null }, {}]
      expect(values(withNulls, 's', 'string', '>', 1)).toEqual(['9'])
      expect(values(withNulls, 's', 'string', 'between', [null, 'z'])).toEqual([])
    })
  })
})
