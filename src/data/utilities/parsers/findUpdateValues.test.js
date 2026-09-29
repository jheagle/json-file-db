import { findUpdateValues } from './findUpdateValues'

const parse = (query) => {
  const parsed = {}
  const remaining = findUpdateValues(parsed, query)
  return { parsed, remaining }
}

describe('findUpdateValues', () => {
  test('extracts a single assignment', () => {
    const { parsed, remaining } = parse("update workouts set reps = 12")
    expect(parsed.updateValues).toEqual({ reps: 12 })
    expect(remaining).toBe('update workouts')
  })

  test('extracts multiple comma-separated assignments', () => {
    const { parsed } = parse("set reps = 12, note = 'done'")
    expect(parsed.updateValues).toEqual({ reps: 12, note: 'done' })
  })

  test('stops before a following where clause', () => {
    const { parsed, remaining } = parse("set reps = 12 where date = '2024-06-02'")
    expect(parsed.updateValues).toEqual({ reps: 12 })
    expect(remaining).toBe("where date = '2024-06-02'")
  })

  test('extracts every literal shape', () => {
    const { parsed } = parse('set active = true, archived = false, note = null, tags = [1,2,3]')
    expect(parsed.updateValues).toEqual({ active: true, archived: false, note: null, tags: [1, 2, 3] })
  })

  test('leaves the query untouched, with an empty updateValues, when there is no set clause', () => {
    const { parsed, remaining } = parse("read workouts where date = '2024-06-02'")
    expect(parsed.updateValues).toEqual({})
    expect(remaining).toBe("read workouts where date = '2024-06-02'")
  })
})
