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
})
