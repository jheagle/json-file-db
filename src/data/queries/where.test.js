import { treeTruth, where, whereTree } from './where'

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

  describe('whereTree', () => {
    const rows = [{ id: 1, n: 1, s: 'x' }, { id: 2, n: 2, s: 'x' }, { id: 3, n: 2, s: 'y' }]
    const n2 = { property: 'n', comparator: '=', value: 2 }
    const sx = { property: 's', comparator: '=', value: 'x' }

    test('no where clause keeps every row', () => {
      expect(whereTree(rows, undefined)).toEqual(rows)
    })

    test('one condition, and an and of several', () => {
      expect(whereTree(rows, n2).map(row => row.id)).toEqual([2, 3])
      expect(whereTree(rows, { and: [n2, sx] }).map(row => row.id)).toEqual([2])
    })

    test('a typed condition and a joinEntity condition work as they do in where()', () => {
      const typed = [{ id: 1, n: '10' }, { id: 2, n: '9' }]
      expect(whereTree(typed, { property: 'n', comparator: '>', value: 2, type: 'string' }).map(row => row.id)).toEqual([2])
      expect(whereTree(typed, { property: 'n', comparator: '>', value: 2, type: 'int' }).map(row => row.id)).toEqual([1, 2])
      const joined = [{ id: 1, 'e.name': 'x' }, { id: 2, 'e.name': 'y' }]
      expect(whereTree(joined, { property: 'name', joinEntity: 'e', comparator: '=', value: 'x' }).map(row => row.id)).toEqual([1])
      expect(whereTree(joined, { and: [{ property: 'name', joinEntity: 'e', comparator: '!=', value: 'x' }, { property: 'id', comparator: '>', value: 1 }] }).map(row => row.id)).toEqual([2])
    })

    test('or keeps a row when any branch is true, not when its branch is false', () => {
      expect(whereTree(rows, { or: [{ property: 'n', comparator: '=', value: 1 }, { property: 's', comparator: '=', value: 'y' }] }).map(row => row.id)).toEqual([1, 3])
      expect(whereTree(rows, { not: n2 }).map(row => row.id)).toEqual([1])
      expect(whereTree(rows, { and: [n2, { not: sx }] }).map(row => row.id)).toEqual([3])
      expect(whereTree([], { or: [n2, sx] })).toEqual([])
    })

    describe('three-valued logic: a comparison on a null or missing field is unknown', () => {
      const row = { t: 1, f: 2, u: null }
      const T = { property: 't', comparator: '=', value: 1 }
      const F = { property: 'f', comparator: '=', value: 1 }
      const U = { property: 'u', comparator: '=', value: 1 }
      const missing = { property: 'gone', comparator: '!=', value: 1 }

      test('a condition: true, false, or unknown (null) for a null or missing field', () => {
        expect(treeTruth(row, T)).toBe(true)
        expect(treeTruth(row, F)).toBe(false)
        expect(treeTruth(row, U)).toBeNull()
        expect(treeTruth(row, missing)).toBeNull()
        // is null / exists are never unknown
        expect(treeTruth(row, { property: 'u', comparator: 'is null' })).toBe(true)
        expect(treeTruth(row, { property: 'gone', comparator: 'exists' })).toBe(false)
      })

      test.each([
        ['not true', { not: T }, false],
        ['not false', { not: F }, true],
        ['not unknown', { not: U }, null],
        ['true and true', { and: [T, T] }, true],
        ['true and false', { and: [T, F] }, false],
        ['false and unknown', { and: [F, U] }, false],
        ['unknown and false', { and: [U, F] }, false],
        ['true and unknown', { and: [T, U] }, null],
        ['unknown and unknown', { and: [U, missing] }, null],
        ['true or unknown', { or: [T, U] }, true],
        ['unknown or true', { or: [U, T] }, true],
        ['false or unknown', { or: [F, U] }, null],
        ['false or false', { or: [F, F] }, false],
        ['not (false or unknown)', { not: { or: [F, U] } }, null],
        ['not (false and unknown)', { not: { and: [F, U] } }, true]
      ])('%s', (name, node, expected) => {
        expect(treeTruth(row, node)).toBe(expected)
      })

      test('only rows where the whole tree is true are kept', () => {
        const withNulls = [{ id: 1, n: 5 }, { id: 2, n: 3 }, { id: 3, n: null }, { id: 4 }]
        const n5 = { property: 'n', comparator: '=', value: 5 }
        const ids = node => whereTree(withNulls, node).map(item => item.id)
        // not (n = 5) gives the same rows as n != 5: neither returns null or missing
        expect(ids({ not: n5 })).toEqual([2])
        expect(ids({ property: 'n', comparator: '!=', value: 5 })).toEqual([2])
        expect(ids({ not: { not: n5 } })).toEqual([1])
        expect(ids({ or: [n5, { property: 'n', comparator: 'is null' }] })).toEqual([1, 3])
        // in with a null in the list: a match is true, no match is unknown (x in [1, null] is x = 1 or x = null)
        const in5 = { property: 'n', comparator: 'in', value: [5, null] }
        expect(treeTruth({ n: 5 }, in5)).toBe(true)
        expect(treeTruth({ n: 3 }, in5)).toBeNull()
        expect(treeTruth({ n: 3 }, { property: 'n', comparator: 'in', value: [5] })).toBe(false)
        expect(ids(in5)).toEqual([1])
        expect(ids({ not: in5 })).toEqual([])
        expect(ids({ not: { property: 'n', comparator: 'in', value: [5] } })).toEqual([2])
        // a null between bound bounds nothing: unknown, so not (...) keeps nothing either
        expect(ids({ not: { property: 'n', comparator: 'between', value: [null, 5] } })).toEqual([])
        // unknown and false is false, so not (...) keeps rows 3 and 4
        expect(ids({ not: { and: [n5, { property: 'id', comparator: '=', value: 1 }] } })).toEqual([2, 3, 4])
      })
    })
  })
})
