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
})