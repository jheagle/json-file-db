import { sortBy } from './sortBy'

describe('sortBy', () => {
  test('applies sorting', () => {
    const dataSet = [
      {
        _id: 2,
        exercise_id: 2,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 1,
        date: '2024-06-02'
      },
      {
        _id: 1,
        exercise_id: 1,
        weight_effort: '115lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 0,
        date: '2024-06-02'
      },
      {
        _id: 1,
        exercise_id: 1,
        weight_effort: '115lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 0,
        date: '2024-06-05'
      },
      {
        _id: 3,
        exercise_id: 3,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 2,
        date: '2024-06-02'
      },
      {
        _id: 2,
        exercise_id: 2,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 1,
        date: '2024-06-05'
      },
      {
        _id: 3,
        exercise_id: 3,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 2,
        date: '2024-06-05'
      }
    ]
    const result = sortBy(dataSet, [{ property: 'date', direction: 'desc' }, { property: 'order', direction: 'asc' }])
    expect(result).toEqual([
      {
        _id: 1,
        exercise_id: 1,
        weight_effort: '115lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 0,
        date: '2024-06-05'
      },
      {
        _id: 2,
        exercise_id: 2,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 1,
        date: '2024-06-05'
      },
      {
        _id: 3,
        exercise_id: 3,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 2,
        date: '2024-06-05'
      },
      {
        _id: 1,
        exercise_id: 1,
        weight_effort: '115lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 0,
        date: '2024-06-02'
      },
      {
        _id: 2,
        exercise_id: 2,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 1,
        date: '2024-06-02'
      },
      {
        _id: 3,
        exercise_id: 3,
        weight_effort: '155lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 2,
        date: '2024-06-02'
      }
    ])
  })

  describe('null and missing', () => {
    const rows = () => [{ id: 'five', n: 5 }, { id: 'null', n: null }, { id: 'zero', n: 0 }, { id: 'missing' }, { id: 'twelve', n: 12 }]
    const order = (direction) => sortBy(rows(), [{ property: 'n', direction }]).map(row => row.id)

    test('ascending: missing, then null, then the values (null used to sort as 0)', () => {
      expect(order('asc')).toEqual(['missing', 'null', 'zero', 'five', 'twelve'])
    })

    test('descending: the exact reverse', () => {
      expect(order('desc')).toEqual(['twelve', 'five', 'zero', 'null', 'missing'])
    })

    test('two nulls (or two missing) tie, so the next sort field decides', () => {
      const tied = [{ id: 'b', n: null, m: 2 }, { id: 'a', n: null, m: 1 }, { id: 'd', m: 2 }, { id: 'c', m: 1 }]
      expect(sortBy(tied, [{ property: 'n', direction: 'asc' }, { property: 'm', direction: 'asc' }]).map(row => row.id))
        .toEqual(['c', 'd', 'a', 'b'])
    })
  })

  describe('by the declared type', () => {
    const order = (rows, type, direction = 'asc') => sortBy(rows, [{ property: 'v', direction, type }]).map(row => row.v)

    test('a string field sorts as text, even values stored as numbers', () => {
      expect(order([{ v: '9' }, { v: 10 }, { v: '2' }], 'string')).toEqual([10, '2', '9'])
      expect(order([{ v: '9' }, { v: '10' }, { v: '2' }], 'string', 'desc')).toEqual(['9', '2', '10'])
    })

    test('an int field sorts as numbers, even a value stored as a numeric string', () => {
      expect(order([{ v: '9' }, { v: 10 }, { v: 2 }], 'int')).toEqual([2, '9', 10])
    })

    test('no declared type sorts the raw values', () => {
      expect(order([{ v: '9' }, { v: '10' }, { v: 2 }], undefined)).toEqual([2, '10', '9'])
      expect(order([{ v: 9 }, { v: 10 }, { v: 2 }], 'object')).toEqual([2, 9, 10])
    })

    test('missing, then null, then the values, still', () => {
      expect(order([{ v: '9' }, { v: null }, {}, { v: 10 }], 'string')).toEqual([undefined, null, 10, '9'])
    })
  })
})
