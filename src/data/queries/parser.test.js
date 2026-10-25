import { parser } from './parser'

describe('parser', () => {
  test('can parse an update with a set clause and a where clause', () => {
    const query = "update workouts set reps = 12, note = 'done' where date = '2024-06-02'"
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'update',
        entity: 'workouts',
        joinEntity: undefined,
        selectClauses: [],
        insertValues: [],
        updateValues: { reps: 12, note: 'done' },
        conditions: [
          {
            property: 'date',
            comparator: '=',
            value: '2024-06-02'
          }
        ],
        joinClauses: [],
        mergeJoins: [],
        sortClauses: [],
        groupBy: undefined,
        limit: undefined,
        offset: undefined,
      }
    ])
  })

  test('can parse an insert with a values clause', () => {
    const query = "insert workouts values reps = 12, date = '2024-06-02'"
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'insert',
        entity: 'workouts',
        joinEntity: undefined,
        selectClauses: [],
        insertValues: [{ reps: 12, date: '2024-06-02' }],
        updateValues: {},
        conditions: [],
        joinClauses: [],
        mergeJoins: [],
        sortClauses: [],
        groupBy: undefined,
        limit: undefined,
        offset: undefined,
      }
    ])
  })

  test('can parse simple read', () => {
    const query = 'read workouts' +
      ' where date = \'2024-06-02\''
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'read',
        entity: 'workouts',
        joinEntity: undefined,
        selectClauses: [],
        insertValues: [],
        updateValues: {},
        conditions: [
          {
            property: 'date',
            comparator: '=',
            value: '2024-06-02'
          }
        ],
        joinClauses: [],
        mergeJoins: [],
        sortClauses: [],
        groupBy: undefined,
        limit: undefined,
        offset: undefined,
      }
    ])
  })

  test('can parse read with join', () => {
    const query = 'read workouts.muscles' +
      ' on workouts.exercise_id = exercises._id' +
      ' and on exercises._id = exercise_muscle.exercise_id' +
      ' and on exercise_muscle.muscle_id = muscles._id' +
      ' where muscles.alias = \'chest\''
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'read',
        entity: 'workouts',
        joinEntity: 'muscles',
        selectClauses: [],
        insertValues: [],
        updateValues: {},
        conditions: [
          {
            property: 'muscles.alias',
            comparator: '=',
            value: 'chest'
          }
        ],
        joinClauses: [
          {
            propertyA: 'workouts.exercise_id',
            comparator: '=',
            propertyB: 'exercises._id'
          },
          {
            propertyA: 'exercises._id',
            comparator: '=',
            propertyB: 'exercise_muscle.exercise_id'
          },
          {
            propertyA: 'exercise_muscle.muscle_id',
            comparator: '=',
            propertyB: 'muscles._id'
          }
        ],
        mergeJoins: [],
        sortClauses: [],
        groupBy: undefined,
        limit: undefined,
        offset: undefined,
      }
    ])
  })

  test('can parse read with join and merge', () => {
    const query = 'read workouts.muscles' +
      ' on workouts.exercise_id = exercises._id' +
      ' and on exercises._id = exercise_muscle.exercise_id' +
      ' and on exercise_muscle.muscle_id = muscles._id' +
      ' merge workouts.exercise_id with exercises._id' +
      ' merge exercise_muscle.muscle_id with muscles._id' +
      ' where muscles.alias = \'chest\''
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'read',
        entity: 'workouts',
        joinEntity: 'muscles',
        selectClauses: [],
        insertValues: [],
        updateValues: {},
        conditions: [
          {
            property: 'muscles.alias',
            comparator: '=',
            value: 'chest'
          }
        ],
        joinClauses: [
          {
            propertyA: 'workouts.exercise_id',
            comparator: '=',
            propertyB: 'exercises._id'
          },
          {
            propertyA: 'exercises._id',
            comparator: '=',
            propertyB: 'exercise_muscle.exercise_id'
          },
          {
            propertyA: 'exercise_muscle.muscle_id',
            comparator: '=',
            propertyB: 'muscles._id'
          }
        ],
        mergeJoins: [
          {
            propertyA: 'workouts.exercise_id',
            propertyB: 'exercises._id'
          },
          {
            propertyA: 'exercise_muscle.muscle_id',
            propertyB: 'muscles._id'
          }
        ],
        sortClauses: [],
        groupBy: undefined,
        limit: undefined,
        offset: undefined,
      }
    ])
  })

  test('can parse read with sort clause', () => {
    const query = 'read workouts' +
      ' sort date desc, order'
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'read',
        entity: 'workouts',
        joinEntity: undefined,
        selectClauses: [],
        insertValues: [],
        updateValues: {},
        conditions: [],
        joinClauses: [],
        mergeJoins: [],
        sortClauses: [
          { property: 'date', direction: 'desc' },
          { property: 'order', direction: 'asc' }
        ],
        groupBy: undefined,
        limit: undefined,
        offset: undefined,
      }
    ])
  })

  test('can parse read with group clause', () => {
    const query = 'read workouts' +
      ' group by date'
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'read',
        entity: 'workouts',
        joinEntity: undefined,
        selectClauses: [],
        insertValues: [],
        updateValues: {},
        conditions: [],
        joinClauses: [],
        mergeJoins: [],
        sortClauses: [],
        groupBy: 'date',
        limit: undefined,
        offset: undefined,
      }
    ])
  })

  test('can parse select, limit, and offset', () => {
    const query = 'read workouts.exercises' +
      ' select exercises.name as exercise, workouts.sets as sets, reps' +
      ' on workouts.exercise_id = exercises._id' +
      ' merge workouts.exercise_id with exercises._id' +
      ' limit 2' +
      ' offset 1'
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'read',
        entity: 'workouts',
        joinEntity: 'exercises',
        selectClauses: [
          {
            property: 'exercises.name',
            alias: 'exercise',
          },
          {
            property: 'workouts.sets',
            alias: 'sets',
          },
          {
            property: 'reps',
            alias: undefined,
          }
        ],
        insertValues: [],
        updateValues: {},
        conditions: [],
        joinClauses: [
          {
            propertyA: 'workouts.exercise_id',
            comparator: '=',
            propertyB: 'exercises._id'
          }
        ],
        mergeJoins: [
          {
            propertyA: 'workouts.exercise_id',
            propertyB: 'exercises._id'
          }
        ],
        sortClauses: [],
        groupBy: undefined,
        limit: 2,
        offset: 1,
      }
    ])
  })

  test('can use queries containing keyword', () => {
    const query = 'read workouts.exercises' +
      ' select exercises.name as exercise, read' +
      ' on workouts.exercise_id = exercises._id' +
      ' merge workouts.exercise_id with exercises._id' +
      ' limit 2' +
      ' offset 1;' +
      ' delete exercises'
    const result = parser(query)
    expect(result).toEqual([
      {
        command: 'read',
        entity: 'workouts',
        joinEntity: 'exercises',
        selectClauses: [
          { property: 'exercises.name', alias: 'exercise' },
          { property: 'read', alias: undefined }
        ],
        insertValues: [],
        updateValues: {},
        conditions: [],
        joinClauses: [
          {
            propertyA: 'workouts.exercise_id',
            comparator: '=',
            propertyB: 'exercises._id'
          }
        ],
        mergeJoins: [
          { propertyA: 'workouts.exercise_id', propertyB: 'exercises._id' }
        ],
        sortClauses: [],
        groupBy: undefined,
        limit: 2,
        offset: 1
      },
      {
        command: 'delete',
        entity: 'exercises',
        joinEntity: undefined,
        selectClauses: [],
        insertValues: [],
        updateValues: {},
        conditions: [],
        joinClauses: [],
        mergeJoins: [],
        sortClauses: [],
        groupBy: undefined,
        limit: undefined,
        offset: undefined
      }
    ])
  })

  test('keeps a value containing a command keyword intact (it used to be split, then glued back without its space)', () => {
    const result = parser("insert notes values text = 'please read this'")
    expect(result[0].insertValues).toEqual([{ text: 'please read this' }])
  })

  test('parses queries separated by ;, with an optional ; at the end', () => {
    const result = parser("read workouts where date = '2024-06-02'; read exercises;")
    expect(result.map(({ command, entity }) => [command, entity])).toEqual([['read', 'workouts'], ['read', 'exercises']])
  })

  test('reports a missing ; between queries', () => {
    expect(() => parser('read workouts read exercises')).toThrow('Failed to interpret: read workouts read exercises (Missing ; before: read exercises)')
  })

  test.each([
    ["read a where x = 'y' read b", 'read b'],
    ['update t set a = 1 read b', 'read b'],
    ["update t set a = 'z' where b = 2 read c", 'read c'],
    ["insert t values a = 1, b = 'w' delete c", 'delete c'],
    ['read a sort x desc limit 2 read b', 'read b']
  ])('reports a missing ; after a query with clauses: %s', (queries, second) => {
    expect(() => parser(queries)).toThrow(`(Missing ; before: ${second})`)
  })

  test('reads a name containing -- as a name, not a comment', () => {
    expect(parser('read my--table')[0].entity).toBe('my--table')
  })

  test('reports which query failed, with the reason', () => {
    expect(() => parser('read workouts; read exercises sort')).toThrow('Failed to interpret query 2 of 2: read exercises sort (Unrecognized query value:')
  })

  describe('strings', () => {
    const only = (queries) => parser(queries)[0]

    test('reads each string of a two-condition where on its own (main read one condition: x\' and where b = \'y)', () => {
      expect(only("read t where a = 'x' and where b = 'y'").conditions.map(({ value }) => value)).toEqual(['x', 'y'])
    })

    test('lets a string hold the other quote', () => {
      expect(only('insert t values name = "it\'s"').insertValues).toEqual([{ name: 'it\'s' }])
      expect(only('insert t values name = \'say "hi"\'').insertValues).toEqual([{ name: 'say "hi"' }])
    })

    test('applies escapes: \\\' is a quote, and \\\\\\\' is a backslash then a quote', () => {
      expect(only("insert t values name = 'it\\'s'").insertValues).toEqual([{ name: 'it\'s' }])
      expect(only("insert t values name = '\\\\\\''").insertValues).toEqual([{ name: '\\\'' }])
    })

    test('keeps keywords, commas and = inside a string out of the other clauses', () => {
      const read = only("read t where a = 'x sort b desc limit 1'")
      expect(read.conditions.map(({ value }) => value)).toEqual(['x sort b desc limit 1'])
      expect(read.sortClauses).toEqual([])
      expect(read.limit).toBeUndefined()
      expect(only("update t set note = 'a, b = 2', n = 1").updateValues).toEqual({ note: 'a, b = 2', n: 1 })
    })

    test('reads strings inside an array, with either quote', () => {
      expect(only('read t where a in ["x","y"]').conditions[0].value).toEqual(['x', 'y'])
      expect(only("read t where a in ['x', 'it\\'s']").conditions[0].value).toEqual(['x', 'it\'s'])
    })

    test('rejects mismatched quotes instead of reading them as one string', () => {
      expect(() => parser('insert t values name = \'abc"')).toThrow('Unclosed string')
    })

    test('shows a stray string as it was written in the error', () => {
      expect(() => parser("read t where a = 'x' 'stray'")).toThrow("(Unrecognized query value: 'stray')")
    })
  })
})
