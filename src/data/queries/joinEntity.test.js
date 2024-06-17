import { joinEntity } from './joinEntity'
import { testHelpers } from 'js-build-tools/testHelpers'
import { copyDatabase } from '../../../test-data/copyDatabase'

const databasePath = 'join-entity-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(
  () => testHelpers.beforeEach()
    .then(() => copyDatabase(databasePath))
)

afterEach(testHelpers.afterEach)

describe('joinEntity', () => {
  test('it will find the joins', async () => {
    const joinClauses = [
      {
        and: undefined,
        propertyA: 'workouts.exercise_id',
        comparator: '=',
        propertyB: 'exercises._id'
      },
      {
        and: 'and',
        propertyA: 'exercises._id',
        comparator: '=',
        propertyB: 'exercise_muscle.exercise_id'
      },
      {
        and: 'and',
        propertyA: 'exercise_muscle.muscle_id',
        comparator: '=',
        propertyB: 'muscles._id'
      }
    ]
    const result = await joinEntity('workouts', 'muscles', {}, joinClauses)
    expect(result['workouts']).toEqual([
      {
        _id: 1,
        exercise_id: 1,
        weight_effort: '115lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 0,
        date: '2024-06-02',
        muscles: [{ _id: 11, name: 'Pectorals', alias: 'chest', image: '' }]
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
        muscles: [{ _id: 8, name: 'Hamstrings', alias: 'abs', image: '' }]
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
        muscles: [{ _id: 12, name: 'Quadriceps', alias: 'quads', image: '' }]
      },
      {
        _id: 4,
        exercise_id: 1,
        weight_effort: '120lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 0,
        date: '2024-06-05',
        muscles: [{ _id: 11, name: 'Pectorals', alias: 'chest', image: '' }]
      },
      {
        _id: 5,
        exercise_id: 2,
        weight_effort: '160lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 1,
        date: '2024-06-05',
        muscles: [{ _id: 8, name: 'Hamstrings', alias: 'abs', image: '' }]
      },
      {
        _id: 6,
        exercise_id: 3,
        weight_effort: '160lbs',
        reps: 10,
        sets: 3,
        note: '',
        order: 2,
        date: '2024-06-05',
        muscles: [{ _id: 12, name: 'Quadriceps', alias: 'quads', image: '' }]
      }
    ])
  })
})
