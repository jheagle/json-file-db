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
    const query = 'read workouts'
      + ' where date = \'2024-06-02\''
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
    const query = 'read workouts.muscles'
      + ' on workouts.exercise_id = exercises._id'
      + ' and on exercises._id = exercise_muscle.exercise_id'
      + ' and on exercise_muscle.muscle_id = muscles._id'
      + ' where muscles.alias = \'chest\''
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
    const query = 'read workouts.muscles'
      + ' on workouts.exercise_id = exercises._id'
      + ' and on exercises._id = exercise_muscle.exercise_id'
      + ' and on exercise_muscle.muscle_id = muscles._id'
      + ' merge workouts.exercise_id with exercises._id'
      + ' merge exercise_muscle.muscle_id with muscles._id'
      + ' where muscles.alias = \'chest\''
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
    const query = 'read workouts'
      + ' sort date desc, order'
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
    const query = 'read workouts'
      + ' group by date'
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
    const query = 'read workouts.exercises'
      + ' select exercises.name as exercise, workouts.sets as sets, reps'
      + ' on workouts.exercise_id = exercises._id'
      + ' merge workouts.exercise_id with exercises._id'
      + ' limit 2'
      + ' offset 1'
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
    const query = 'read workouts.exercises'
      + ' select exercises.name as exercise, read'
      + ' on workouts.exercise_id = exercises._id'
      + ' merge workouts.exercise_id with exercises._id'
      + ' limit 2'
      + ' offset 1'
      + ' delete exercises'
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
})
