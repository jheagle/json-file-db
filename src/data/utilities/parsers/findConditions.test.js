import { findConditions } from './findConditions'

const parse = (query) => {
  const parsed = { conditions: [] }
  const remaining = findConditions(parsed, query)
  return { parsed, remaining }
}

describe('findConditions', () => {
  test('extracts a quoted string value', () => {
    const { parsed, remaining } = parse("where date = '2024-06-02'")
    expect(parsed.conditions).toEqual([{ property: 'date', comparator: '=', value: '2024-06-02' }])
    expect(remaining).toBe('')
  })

  test('extracts an unquoted number as a real number', () => {
    const { parsed } = parse('where reps > 10')
    expect(parsed.conditions).toEqual([{ property: 'reps', comparator: '>', value: 10 }])
  })

  test('extracts an array literal as a real array', () => {
    const { parsed } = parse('where exercise_id in [1,2,3]')
    expect(parsed.conditions).toEqual([{ property: 'exercise_id', comparator: 'in', value: [1, 2, 3] }])
  })

  test('extracts null as the real null value', () => {
    const { parsed } = parse('where note = null')
    expect(parsed.conditions).toEqual([{ property: 'note', comparator: '=', value: null }])
  })

  test('extracts true and false as real booleans', () => {
    const { parsed } = parse('where active = true where archived = false')
    expect(parsed.conditions).toEqual([
      { property: 'active', comparator: '=', value: true },
      { property: 'archived', comparator: '=', value: false }
    ])
  })
})
