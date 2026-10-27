import { allOf, conditionsOf, isCondition, requiredConditions, withoutConditions } from './conditionTree'

const a = { property: 'a', comparator: '=', value: 1 }
const b = { property: 'b', comparator: '>', value: 2 }
const c = { property: 'c', comparator: 'is null', value: null }

describe('conditionTree', () => {
  test('allOf: none is no where clause, one is the condition itself, several are one and node', () => {
    expect(allOf([])).toBeUndefined()
    expect(allOf([a])).toBe(a)
    expect(allOf([a, b, c])).toEqual({ and: [a, b, c] })
  })

  test('isCondition tells a condition from a group', () => {
    expect(isCondition(a)).toBe(true)
    expect(isCondition({ and: [a, b] })).toBe(false)
    expect(isCondition({ or: [a, b] })).toBe(false)
    expect(isCondition({ not: a })).toBe(false)
  })

  test('conditionsOf lists every condition, in order, inside any group', () => {
    expect(conditionsOf(undefined)).toEqual([])
    expect(conditionsOf(a)).toEqual([a])
    expect(conditionsOf({ and: [a, { or: [b, { not: c }] }] })).toEqual([a, b, c])
  })

  test('requiredConditions: only those every matching row must meet', () => {
    expect(requiredConditions(undefined)).toEqual([])
    expect(requiredConditions(a)).toEqual([a])
    expect(requiredConditions({ and: [a, { or: [b, c] }, c] })).toEqual([a, c])
    expect(requiredConditions({ or: [a, b] })).toEqual([])
    expect(requiredConditions({ not: a })).toEqual([])
  })

  test('withoutConditions removes conditions under the top-level and, collapsing what is left', () => {
    expect(withoutConditions({ and: [a, b, c] }, [b])).toEqual({ and: [a, c] })
    expect(withoutConditions({ and: [a, b] }, [b])).toBe(a)
    expect(withoutConditions({ and: [a, b] }, [a, b])).toBeUndefined()
    expect(withoutConditions(a, [a])).toBeUndefined()
    expect(withoutConditions(a, [])).toBe(a)
    expect(withoutConditions({ or: [a, b] }, [a])).toEqual({ or: [a, b] })
    expect(withoutConditions(undefined, [a])).toBeUndefined()
  })
})
