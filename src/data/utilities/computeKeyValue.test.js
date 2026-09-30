import { computeKeyValue } from './computeKeyValue'

describe('computeKeyValue', () => {
  test('returns the raw scalar value for a single-field key, unchanged from the existing format', () => {
    expect(computeKeyValue(['_id'], { _id: 1, name: 'foo' })).toBe(1)
    expect(computeKeyValue(['date'], { date: '2024-06-02' })).toBe('2024-06-02')
  })

  test('returns a deterministic composite for a multi-field key, in field order', () => {
    expect(computeKeyValue(['a', 'b'], { a: 1, b: 'x', c: 'unused' })).toBe(JSON.stringify([1, 'x']))
  })

  test('two records with the same field values produce the same composite, usable with ==/===', () => {
    const valueA = computeKeyValue(['a', 'b'], { a: 1, b: 'x' })
    const valueB = computeKeyValue(['a', 'b'], { a: 1, b: 'x' })
    expect(valueA).toBe(valueB)
  })

  test('a different value in any field produces a different composite', () => {
    const valueA = computeKeyValue(['a', 'b'], { a: 1, b: 'x' })
    const valueB = computeKeyValue(['a', 'b'], { a: 1, b: 'y' })
    expect(valueA).not.toBe(valueB)
  })
})
