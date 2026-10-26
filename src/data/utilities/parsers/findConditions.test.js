import { findConditions } from './findConditions'
import { maskArrays, maskStrings, unmaskStrings } from './maskStrings'

const parse = (query) => {
  const parsed = { conditions: [] }
  // parseQuery masks the strings and arrays before any find* step runs
  const remaining = unmaskStrings(findConditions(parsed, maskArrays(maskStrings(query))), '\'')
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

  test.each(['=', '!=', '>', '<=', 'like'])('refuses a comparison with null (%s), which could never match', (comparator) => {
    expect(() => parse(`where note ${comparator} null`)).toThrow(`\`note ${comparator} null\` never matches (null equals nothing, as in SQL): use \`note is null\` or \`note is not null\``)
  })

  test.each([
    ['is null', 'is null'],
    ['IS  NOT\tNULL', 'is not null'],
    ['exists', 'exists'],
    ['does not exist', 'does not exist']
  ])('extracts %s, which takes no value', (written, comparator) => {
    const { parsed, remaining } = parse(`where note ${written} and where reps > 1`)
    expect(parsed.conditions).toEqual([
      { property: 'note', comparator, value: null },
      { property: 'reps', comparator: '>', value: 1 }
    ])
    expect(remaining).toBe('')
  })

  test('reads is null, exists and the rest only as whole words', () => {
    const { parsed, remaining } = parse('where note existsx = 1')
    expect(parsed.conditions).toEqual([])
    expect(remaining).toBe('where note existsx = 1')
  })

  test('still reads a field named like the keywords', () => {
    const { parsed } = parse('where exists = 1 and where is_null exists')
    expect(parsed.conditions).toEqual([
      { property: 'exists', comparator: '=', value: 1 },
      { property: 'is_null', comparator: 'exists', value: null }
    ])
  })

  test('extracts true and false as real booleans', () => {
    const { parsed } = parse('where active = true where archived = false')
    expect(parsed.conditions).toEqual([
      { property: 'active', comparator: '=', value: true },
      { property: 'archived', comparator: '=', value: false }
    ])
  })
})
