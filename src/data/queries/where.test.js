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
})