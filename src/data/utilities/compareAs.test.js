import { compareAs, sameValue } from './compareAs'

describe('compareAs', () => {
  test('a string field compares numbers and strings as strings', () => {
    expect(compareAs('string', 3)).toBe('3')
    expect(compareAs('string', '3')).toBe('3')
    expect(compareAs('string', 'b3a1c2d4-uuid')).toBe('b3a1c2d4-uuid')
  })

  test('an int field compares numeric strings as numbers, and leaves anything else alone', () => {
    expect(compareAs('int', '3')).toBe(3)
    expect(compareAs('int', 3)).toBe(3)
    expect(compareAs('int', 'abc')).toBe('abc')
  })

  test('a boolean field compares "true" and "false" as booleans', () => {
    expect(compareAs('boolean', 'true')).toBe(true)
    expect(compareAs('boolean', 'false')).toBe(false)
    expect(compareAs('boolean', true)).toBe(true)
  })

  test('null and undefined are never converted', () => {
    expect(compareAs('string', null)).toBeNull()
    expect(compareAs('int', undefined)).toBeUndefined()
  })

  test('an unknown or missing type leaves the value alone', () => {
    expect(compareAs(undefined, '3')).toBe('3')
    expect(compareAs('object', 3)).toBe(3)
  })
})

describe('sameValue', () => {
  test('a string field matches an id whether stored as a number or a string', () => {
    expect(sameValue('string', 3, '3')).toBe(true)
    expect(sameValue('string', '3', 3)).toBe(true)
    expect(sameValue('string', 3, 4)).toBe(false)
  })

  test('a string field does not treat differently written numbers as one value, unlike ==', () => {
    // eslint-disable-next-line eqeqeq
    expect('1.0' == 1).toBe(true)
    expect(sameValue('string', '1.0', 1)).toBe(false)
  })

  test('an int field matches numeric strings', () => {
    expect(sameValue('int', '10', 10)).toBe(true)
    expect(sameValue('int', '10', 11)).toBe(false)
  })

  test('null only matches null or undefined in a typed field', () => {
    expect(sameValue('string', null, null)).toBe(true)
    expect(sameValue('string', null, 'null')).toBe(false)
    expect(sameValue('int', null, 0)).toBe(false)
  })

  test('an untyped field keeps loose equality', () => {
    expect(sameValue(undefined, '2', 2)).toBe(true)
    expect(sameValue(undefined, null, undefined)).toBe(true)
    expect(sameValue(undefined, '2', 3)).toBe(false)
  })
})
