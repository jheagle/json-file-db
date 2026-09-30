import { query } from './query'
import { create } from '../introspect/create'
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from '../utilities/config'
import { copyDatabase } from '../../../test-data/copyDatabase'

const databasePath = 'query-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

beforeEach(
  () => testHelpers.beforeEach()
    .then(() => copyDatabase(databasePath))
)

afterEach(testHelpers.afterEach)

describe('query', () => {
  test('it deletes matching rows, resolved via an indexed condition', async () => {
    const deleted = await query('delete workouts where date = \'2024-06-05\'')
    expect(deleted[0]).toHaveLength(3)

    const remaining = await query('read workouts')
    expect(remaining[0]).toHaveLength(3)
    expect(remaining[0].every(row => row.date === '2024-06-02')).toBe(true)
  })

  test('it inserts a new row via a values clause', async () => {
    const inserted = await query("insert workouts values _id = 99, exercise_id = 1, order = 0, date = '2024-06-10'")
    expect(inserted[0]).toHaveLength(1)
    expect(inserted[0][0]).toMatchObject({ _id: '99', exercise_id: '1', order: 0, date: '2024-06-10' })

    const readBack = await query("read workouts where date = '2024-06-10'")
    expect(readBack[0]).toHaveLength(1)
  })

  test('it updates matching rows via a set clause, resolved via an indexed condition', async () => {
    const updated = await query("update workouts set reps = 20 where date = '2024-06-05'")
    expect(updated[0]).toHaveLength(3)
    expect(updated[0].every(row => row.reps === 20)).toBe(true)

    const readBack = await query("read workouts where date = '2024-06-05'")
    expect(readBack[0].every(row => row.reps === 20)).toBe(true)
  })

  test('it reads with where', async () => {
    const queryString = 'read workouts where date = \'2024-06-02\''
    const result = await query(queryString)
    expect(result).toEqual([
      [
        {
          _id: 1,
          exercise_id: 1,
          weight_effort: '115lbs',
          reps: 10,
          sets: 3,
          note: '',
          order: 0,
          date: '2024-06-02'
        },
        {
          _id: 2,
          exercise_id: 2,
          weight_effort: '155lbs',
          reps: 10,
          sets: 3,
          note: '',
          order: 1,
          date: '2024-06-02'
        },
        {
          _id: 3,
          exercise_id: 3,
          weight_effort: '155lbs',
          reps: 10,
          sets: 3,
          note: '',
          order: 2,
          date: '2024-06-02'
        }
      ]
    ])
  })

  test('it reads with joins and merges', async () => {
    const queryString = 'read workouts.muscles'
      + ' on workouts.exercise_id = exercises._id'
      + ' and on exercises._id = exercise_muscle.exercise_id'
      + ' and on exercise_muscle.muscle_id = muscles._id'
      + ' merge muscles._id with exercise_muscle.muscle_id'
      + ' where date = \'2024-06-02\''
    const result = await query(queryString)
    expect(result).toEqual([
      [
        {
          _id: 1,
          exercise_id: 1,
          weight_effort: '115lbs',
          reps: 10,
          sets: 3,
          note: '',
          order: 0,
          date: '2024-06-02',
          muscles: [
            {
              _id: 11,
              name: 'Pectorals',
              alias: 'chest',
              image: '',
              'exercise_muscle._id': 1,
              'exercise_muscle.exercise_id': 1,
              'exercise_muscle.muscle_rank': 100
            }
          ]
        },
        {
          _id: 2,
          exercise_id: 2,
          weight_effort: '155lbs',
          reps: 10,
          sets: 3,
          note: '',
          order: 1,
          date: '2024-06-02',
          muscles: [
            {
              _id: 8,
              name: 'Hamstrings',
              alias: 'abs',
              image: '',
              'exercise_muscle._id': 2,
              'exercise_muscle.exercise_id': 2,
              'exercise_muscle.muscle_rank': 100
            }
          ]
        },
        {
          _id: 3,
          exercise_id: 3,
          weight_effort: '155lbs',
          reps: 10,
          sets: 3,
          note: '',
          order: 2,
          date: '2024-06-02',
          muscles: [
            {
              _id: 12,
              name: 'Quadriceps',
              alias: 'quads',
              image: '',
              'exercise_muscle._id': 3,
              'exercise_muscle.exercise_id': 3,
              'exercise_muscle.muscle_rank': 100
            }
          ]
        }
      ]
    ])
  })

  test('it can use sort and group by', async () => {
    const queryString = 'read workouts sort date desc, order asc group by date'
    const result = await query(queryString)
    expect(result).toEqual([
      {
        '2024-06-02': [
          {
            _id: 1,
            exercise_id: 1,
            weight_effort: '115lbs',
            reps: 10,
            sets: 3,
            note: '',
            order: 0,
            date: '2024-06-02'
          },
          {
            _id: 2,
            exercise_id: 2,
            weight_effort: '155lbs',
            reps: 10,
            sets: 3,
            note: '',
            order: 1,
            date: '2024-06-02'
          },
          {
            _id: 3,
            exercise_id: 3,
            weight_effort: '155lbs',
            reps: 10,
            sets: 3,
            note: '',
            order: 2,
            date: '2024-06-02'
          },
        ],
        '2024-06-05': [
          {
            _id: 4,
            exercise_id: 1,
            weight_effort: '120lbs',
            reps: 10,
            sets: 3,
            note: '',
            order: 0,
            date: '2024-06-05'
          },
          {
            _id: 5,
            exercise_id: 2,
            weight_effort: '160lbs',
            reps: 10,
            sets: 3,
            note: '',
            order: 1,
            date: '2024-06-05'
          },
          {
            _id: 6,
            exercise_id: 3,
            weight_effort: '160lbs',
            reps: 10,
            sets: 3,
            note: '',
            order: 2,
            date: '2024-06-05'
          }
        ]
      }
    ])
  })

  test('a multi-field unique key works end-to-end through insert/update query strings', async () => {
    await create('pairs', [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'a', type: 'string', optional: true },
      { name: 'b', type: 'string', optional: true }
    ], [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
      { type: 'unique', fields: ['a', 'b'], lookup: 'unique_a_b.json' }
    ])

    const inserted = await query("insert pairs values a = 'x', b = 'y'")
    expect(inserted[0]).toHaveLength(1)

    await expect(query("insert pairs values a = 'x', b = 'y'"))
      .rejects.toThrow('Duplicate value for unique key "a, b" on pairs')

    const id = inserted[0][0]._id
    await query(`update pairs set b = 'z' where _id = '${id}'`)
    const read = await query('read pairs')
    expect(read[0]).toEqual([{ _id: id, a: 'x', b: 'z' }])
  })

  test('deleting a referenced record via a real query string is rejected while dependents exist', async () => {
    await expect(query('delete exercises where _id = 1'))
      .rejects.toThrow('Cannot delete from "exercises" where "_id" = 1 - other records still reference it')

    const stillThere = await query('read exercises where _id = 1')
    expect(stillThere[0]).toHaveLength(1)
  })
})
