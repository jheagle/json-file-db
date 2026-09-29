import { typeCheck } from './typeCheck'

describe('typeCheck', () => {
  test('passes an undefined value through unchanged, for optional fields', () => {
    expect(typeCheck('string', undefined)).toBeUndefined()
  })

  test('does not constrain an unrecognized type name', () => {
    expect(typeCheck('whatever', 42)).toBe(42)
  })

  describe('string', () => {
    test('leaves an existing string alone', () => {
      expect(typeCheck('string', 'foo')).toBe('foo')
    })

    test('coerces a non-string to a string', () => {
      expect(typeCheck('string', 42)).toBe('42')
    })
  })

  describe('int', () => {
    test('leaves an existing integer alone', () => {
      expect(typeCheck('int', 42)).toBe(42)
    })

    test('coerces a numeric string to a number', () => {
      expect(typeCheck('int', '42')).toBe(42)
    })

    test('rejects a non-integer number', () => {
      expect(() => typeCheck('int', 4.2)).toThrow('Value "4.2" is not a valid int')
    })

    test('rejects a value that cannot be coerced to a number', () => {
      expect(() => typeCheck('int', 'not a number')).toThrow('Value "not a number" is not a valid int')
    })
  })

  describe('boolean', () => {
    test('leaves an existing boolean alone', () => {
      expect(typeCheck('boolean', false)).toBe(false)
    })

    test('coerces the strings "true"/"false" to real booleans', () => {
      expect(typeCheck('boolean', 'true')).toBe(true)
      expect(typeCheck('boolean', 'false')).toBe(false)
    })

    test('rejects anything else', () => {
      expect(() => typeCheck('boolean', 'yes')).toThrow('Value "yes" is not a valid boolean')
    })
  })

  describe('object', () => {
    test('accepts a plain object', () => {
      const value = { a: 1 }
      expect(typeCheck('object', value)).toBe(value)
    })

    test('rejects null', () => {
      expect(() => typeCheck('object', null)).toThrow('Value "null" is not a valid object')
    })

    test('rejects an array', () => {
      expect(() => typeCheck('object', [])).toThrow('is not a valid object')
    })

    test('rejects a primitive', () => {
      expect(() => typeCheck('object', 'foo')).toThrow('is not a valid object')
    })
  })

  describe('array', () => {
    test('accepts an array', () => {
      const value = [1, 2, 3]
      expect(typeCheck('array', value)).toBe(value)
    })

    test('rejects a non-array', () => {
      expect(() => typeCheck('array', { a: 1 })).toThrow('is not a valid array')
    })
  })
})
