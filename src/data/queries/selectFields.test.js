import { selectFields } from './selectFields'

describe('selectFields', () => {
  const dataSet = [
    { _id: 1, reps: 10, date: '2024-06-02' },
    { _id: 2, reps: 12, date: '2024-06-05' }
  ]

  test('returns the dataSet unchanged when no select clauses are given', () => {
    expect(selectFields(dataSet, [])).toEqual(dataSet)
  })

  test('shapes each row down to just the selected properties', () => {
    expect(selectFields(dataSet, [{ property: 'date', alias: undefined }, { property: 'reps', alias: undefined }])).toEqual([
      { date: '2024-06-02', reps: 10 },
      { date: '2024-06-05', reps: 12 }
    ])
  })

  test('renames a selected property to its alias', () => {
    expect(selectFields(dataSet, [{ property: 'reps', alias: 'repetitions' }])).toEqual([
      { repetitions: 10 },
      { repetitions: 12 }
    ])
  })

  test('shapes each row within a grouped (groupBy) result, keeping the group keys', () => {
    const grouped = {
      '2024-06-02': [{ _id: 1, reps: 10, date: '2024-06-02' }],
      '2024-06-05': [{ _id: 2, reps: 12, date: '2024-06-05' }]
    }
    expect(selectFields(grouped, [{ property: 'reps', alias: undefined }])).toEqual({
      '2024-06-02': [{ reps: 10 }],
      '2024-06-05': [{ reps: 12 }]
    })
  })
})
