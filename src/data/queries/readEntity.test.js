import { readEntity } from './readEntity'
import { testHelpers } from 'js-build-tools/testHelpers'
import { copyDatabase } from '../../../test-data/copyDatabase'

const databasePath = 'read-entity-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(
  () => testHelpers.beforeEach()
    .then(() => copyDatabase(databasePath))
)

afterEach(testHelpers.afterEach)

const allWorkouts = [
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

describe('readEntity', () => {
  test('it will get all files', async () => {
    const dataSet = await readEntity('workouts')
    expect(dataSet['workouts']).toEqual(allWorkouts)
  }, 30000)
})
