import { findInsertValues } from './findInsertValues'

const parse = (query) => {
  const parsed = {}
  const remaining = findInsertValues(parsed, query)
  return { parsed, remaining }
}

describe('findInsertValues', () => {
  test('extracts a single row, wrapped in a one-element array', () => {
    const { parsed, remaining } = parse("insert workouts values reps = 12, date = '2024-06-02'")
    expect(parsed.insertValues).toEqual([{ reps: 12, date: '2024-06-02' }])
    expect(remaining).toBe('insert workouts')
  })

  test('extracts every literal shape', () => {
    const { parsed } = parse('values active = true, tags = [1,2,3], note = null')
    expect(parsed.insertValues).toEqual([{ active: true, tags: [1, 2, 3], note: null }])
  })

  test('leaves the query untouched, with an empty insertValues, when there is no values clause', () => {
    const { parsed, remaining } = parse("read workouts where date = '2024-06-02'")
    expect(parsed.insertValues).toEqual([])
    expect(remaining).toBe("read workouts where date = '2024-06-02'")
  })
})
