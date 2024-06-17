import { query } from './query'
import { testHelpers } from 'js-build-tools/testHelpers'
import { copyDatabase } from '../../../test-data/copyDatabase'

const databasePath = 'query-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(
  () => testHelpers.beforeEach()
    .then(() => copyDatabase(databasePath))
)

afterEach(testHelpers.afterEach)

describe('query', () => {
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
})
