import { findCommand } from './findCommand'

const parse = (query) => {
  const parsed = {}
  const remaining = findCommand(parsed, query)
  return { parsed, remaining }
}

describe('findCommand', () => {
  test.each([
    ['read', 'READ', 'Read', 'rEaD'],
    ['insert', 'INSERT', 'Insert', 'iNsErT'],
    ['update', 'UPDATE', 'Update', 'uPdAtE'],
    ['delete', 'DELETE', 'Delete', 'dElEtE']
  ])('%s gives the same result in any case', (lower, ...others) => {
    const expected = parse(`${lower} Workouts where a = 1`)
    expect(expected.parsed).toEqual({ command: lower, entity: 'Workouts' })
    for (const word of others) {
      expect(parse(`${word} Workouts where a = 1`)).toEqual(expected)
    }
  })

  test('keeps the case of the entity name', () => {
    expect(parse('READ MyTable').parsed.entity).toBe('MyTable')
    expect(parse('read MyTable').parsed.entity).toBe('MyTable')
  })

  test('leaves command and entity undefined when there is no command', () => {
    expect(parse('foo bar').parsed).toEqual({ command: undefined, entity: undefined })
  })
})
