import { parser } from '../../queries/parser'

const parseOne = text => parser(text)[0]

describe('parseSchemaStatement', () => {
  test.each([
    ['drop notes', { command: 'drop', entity: 'notes', ifExists: false }],
    ['drop if exists notes', { command: 'drop', entity: 'notes', ifExists: true }],
    ['DROP IF EXISTS Notes', { command: 'drop', entity: 'Notes', ifExists: true }],
    ['describe notes', { command: 'describe', entity: 'notes', ifExists: false }],
    ['Describe Notes', { command: 'describe', entity: 'Notes', ifExists: false }],
    ['show records', { command: 'show', entity: '__RECORDS', ifExists: false }],
    ['SHOW RECORDS', { command: 'show', entity: '__RECORDS', ifExists: false }],
    ['  show records  ', { command: 'show', entity: '__RECORDS', ifExists: false }]
  ])('%s', (text, expected) => {
    expect(parseOne(text)).toMatchObject(expected)
  })

  test('works among other queries, with ;', () => {
    expect(parser('show records; describe a; drop if exists b; read c').map(({ command }) => command))
      .toEqual(['show', 'describe', 'drop', 'read'])
  })

  test('a record may be named like a schema command', () => {
    expect(parseOne('read show').entity).toBe('show')
    expect(parseOne('drop describe').entity).toBe('describe')
  })

  describe('errors', () => {
    test.each([
      ['drop', 'Expected: drop [if exists] <name>'],
      ['drop if exists', 'Unrecognized query value: exists'],
      ['describe', 'Expected: describe <name>'],
      ['show', 'Expected: show records (the only thing that can be shown so far)'],
      ['show indexes', 'Expected: show records (the only thing that can be shown so far)'],
      ['show recordsx', 'Expected: show records'],
      ['drop a b', 'Unrecognized query value: b'],
      ['describe a where b = 1', 'Unrecognized query value: where b = 1'],
      ['show records read a', 'Missing ; before: read a'],
      ['drop a show records', 'Missing ; before: show records'],
      ['read a drop b', 'Missing ; before: drop b'],
      ['create t (a string) describe t', 'Missing ; before: describe t'],
      ['drop __RECORDS', '__RECORDS is reserved for the list of records (use: show records)'],
      ['describe __RECORDS', '__RECORDS is reserved for the list of records (use: show records)']
    ])('%s', (text, message) => {
      expect(() => parser(text)).toThrow(message)
    })
  })
})
