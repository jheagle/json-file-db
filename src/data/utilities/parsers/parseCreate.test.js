import { parser } from '../../queries/parser'
import { record } from '../../introspect/definitions/record'

const parseOne = text => parser(text)[0]

const createOf = text => parseOne(text).create

describe('parseCreate', () => {
  test('parses the command, the record name and if not exists', () => {
    const parsed = parseOne('create if not exists notes (text string)')
    expect(parsed.command).toBe('create')
    expect(parsed.entity).toBe('notes')
    expect(parsed.create.ifNotExists).toBe(true)
    expect(createOf('create notes (text string)').ifNotExists).toBe(false)
  })

  test('is case-insensitive except for names', () => {
    const { definition, keys } = createOf('CREATE IF NOT EXISTS Notes (Text STRING OPTIONAL NOT NULL, PRIMARY KEY (Text))')
    expect(definition).toEqual([{ name: 'Text', type: 'string', optional: true, autoGenerate: false, nullable: false }])
    expect(keys).toEqual([{ type: 'primary', fields: ['Text'], lookup: 'pk_Text.json' }])
    expect(parseOne('CREATE Notes (a string)').entity).toBe('Notes')
  })

  test('accepts an empty field list', () => {
    expect(createOf('create notes ()')).toEqual({ ifNotExists: false, definition: [], keys: [] })
  })

  describe('fields', () => {
    test('a field is required, not nullable and not auto unless it says so', () => {
      expect(createOf('create t (a int)').definition).toEqual([{ name: 'a', type: 'int', optional: false, autoGenerate: false }])
    })

    test.each(['string', 'int', 'boolean', 'object', 'array'])('accepts the %s type', type => {
      expect(createOf(`create t (a ${type})`).definition[0].type).toBe(type)
    })

    test('reads the modifiers in any order', () => {
      const expected = { name: 'a', type: 'string', optional: true, autoGenerate: false, nullable: true, useDefault: true, defaultValue: 'x' }
      expect(createOf('create t (a string optional null default \'x\')').definition[0]).toEqual(expected)
      expect(createOf('create t (a string default \'x\' null optional)').definition[0]).toEqual(expected)
    })

    test('auto', () => {
      expect(createOf('create t (_id string auto)').definition[0].autoGenerate).toBe(true)
    })

    test('null after default is the default\'s value, not the modifier', () => {
      const [field] = createOf('create t (a string default null)').definition
      expect(field.defaultValue).toBeNull()
      expect(field).not.toHaveProperty('nullable')
    })

    test.each([
      ['\'it\\\'s, (fine)\'', 'it\'s, (fine)'],
      ['"two words"', 'two words'],
      ['42', 42],
      ['[1, \'a\', [2]]', [1, 'a', [2]]],
      ['true', true],
      ['false', false],
      ['NULL', null]
    ])('reads the default %s', (written, value) => {
      expect(createOf(`create t (a string null default ${written})`).definition[0].defaultValue).toEqual(value)
    })

    test('fields and keys may span lines and hold comments', () => {
      const { definition, keys } = createOf(`create t (
        a string, -- the first, with a comma
        /* a (bracket */ b int,
        primary key (a)
      )`)
      expect(definition.map(field => field.name)).toEqual(['a', 'b'])
      expect(keys).toHaveLength(1)
    })
  })

  describe('keys', () => {
    test.each([
      ['primary key (a)', { type: 'primary', fields: ['a'], lookup: 'pk_a.json' }],
      ['primary key (a, b)', { type: 'primary', fields: ['a', 'b'], lookup: 'pk_a_b.json' }],
      ['unique (a)', { type: 'unique', fields: ['a'], lookup: 'unique_a.json' }],
      ['unique (a,b)', { type: 'unique', fields: ['a', 'b'], lookup: 'unique_a_b.json' }],
      ['index (b)', { type: 'index', fields: ['b'], lookup: 'index_b.json' }],
      ['index (a, b)', { type: 'index', fields: ['a', 'b'], lookup: 'index_a_b.json' }],
      [
        'foreign key (b) references other (id)',
        { type: 'foreign', fields: ['b'], lookup: 'fk_b.json', references: [{ fields: ['other.id'], lookup: 'other.json' }] }
      ]
    ])('%s', (written, expected) => {
      expect(createOf(`create t (a string, b string, ${written})`).keys).toEqual([expected])
    })

    test('a field may be named like a key word when it is not written as a key', () => {
      expect(createOf('create t (index int, unique string)').definition.map(field => field.name)).toEqual(['index', 'unique'])
    })
  })

  test('reproduces the test database\'s records exactly, index file names included', () => {
    const fixtures = {
      exercises: 'create exercises (_id string, name string, description string optional, primary key (_id))',
      muscles: 'create muscles (_id string, name string, alias string optional, image string optional, primary key (_id))',
      workouts: `create workouts (
        _id string, exercise_id string, weight_effort string optional, reps int optional, sets int optional,
        note string optional, order int, date string,
        primary key (_id), index (date), foreign key (exercise_id) references exercises (_id)
      )`,
      exercise_muscle: `create exercise_muscle (
        _id string, exercise_id string, muscle_id string, muscle_rank int,
        primary key (_id),
        foreign key (exercise_id) references exercises (_id),
        foreign key (muscle_id) references muscles (_id)
      )`
    }
    for (const [name, statement] of Object.entries(fixtures)) {
      const stored = require(`../../../../test-data/${name}.json`)
      const { definition, keys } = createOf(statement)
      expect(record({ path: name, definition, keys })).toEqual(record({ path: name, definition: stored.definition, keys: stored.keys }))
    }
  })

  describe('errors', () => {
    test.each([
      ['create t', 'Expected: create [if not exists] <name> (<fields and keys>)'],
      ['create t (a strng)', 'Unknown type "strng" for field "a" (expected string, int, boolean, object, array)'],
      ['create t (a)', 'Expected a field (<name> <type> ...) or a key in: a'],
      ['create t (a string,)', 'Empty item in the field list (an extra comma?)'],
      ['create t (a string, a int)', 'Field "a" is given twice'],
      ['create t (a string optional optional)', '"optional" is given twice for field "a"'],
      ['create t (a string null not null)', '"null" is given twice for field "a"'],
      ['create t (a string default)', 'Missing a value after default'],
      ['create t (a string default nope)', 'Unrecognized default value: nope'],
      ['create t (a string sometimes)', 'Unrecognized "sometimes" for field "a" in: a string sometimes'],
      ['create t (a string auto default \'x\')', 'Field "a" can\'t be both auto and have a default'],
      ['create t (a int auto)', 'Field "a" is auto, which generates a UUID, so its type must be string'],
      ['create t (a string, primary key (b))', 'The primary key (b) names "b", which is not a field'],
      ['create t (a string, b string, primary key (a), primary key (b))', 'Only one primary key is allowed'],
      ['create t (a string, index (a), index (a))', 'The same index key on "a" is given twice'],
      ['create t (a string, index (a, a))', 'The same field is named twice in: index (a, a)'],
      ['create t (a string, index ())', 'Expected field names separated by commas in: index ()'],
      ['create t (a string, b string, foreign key (a, b) references o (x, y))', 'Only single-field foreign keys are supported so far'],
      ['create __RECORDS ()', '__RECORDS is reserved for the list of records'],
      ['create t (a string) read t', 'Missing ; before: read t'],
      ['create t (a string) extra', 'Unrecognized query value: extra'],
      ['read t create u (a string)', 'Missing ; before: create u (a string)']
    ])('%s', (text, message) => {
      expect(() => parser(text)).toThrow(message)
    })

    test('an unclosed field list is an error (from the scanner, before parseCreate sees it)', () => {
      expect(() => parser('create t (a string')).toThrow('Unclosed bracket: ( never closed')
    })
  })
})
