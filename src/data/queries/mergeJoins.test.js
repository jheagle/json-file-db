import { mergeJoins } from './mergeJoins'
import { testHelpers } from 'js-build-tools/testHelpers'
import { copyDatabase } from '../../../test-data/copyDatabase'

const databasePath = 'merge-joins-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(
  () => testHelpers.beforeEach()
    .then(() => copyDatabase(databasePath))
)

afterEach(testHelpers.afterEach)

describe('mergeJoins', () => {
  test('can combine several merges', async () => {
    const results = await mergeJoins(
      {},
      [
        {
          propertyA: 'workouts.exercise_id',
          propertyB: 'exercises._id'
        },
        {
          propertyA: 'muscles._id',
          propertyB: 'exercise_muscle.muscle_id'
        }
      ]
    )
    expect(results).toEqual({
      workouts: [
        {
          _id: 1,
          exercise_id: 1,
          weight_effort: '115lbs',
          reps: 10,
          sets: 3,
          note: '',
          order: 0,
          date: '2024-06-02',
          'exercises.name': 'Bench Press',
          'exercises.description': ''
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
          'exercises.name': 'Deadlift',
          'exercises.description': ''
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
          'exercises.name': 'Squat',
          'exercises.description': ''
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
          'exercises.name': 'Bench Press',
          'exercises.description': ''
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
          'exercises.name': 'Deadlift',
          'exercises.description': ''
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
          'exercises.name': 'Squat',
          'exercises.description': ''
        }
      ],
      exercises: [
        { _id: 1, name: 'Bench Press', description: '' },
        { _id: 2, name: 'Deadlift', description: '' },
        { _id: 3, name: 'Squat', description: '' }
      ],
      muscles: [
        {
          _id: 1,
          name: 'Abdominal',
          alias: 'abs',
          image: '../img/abdominals.jpg'
        },
        { _id: 2, name: 'Biceps', alias: '', image: '' },
        { _id: 3, name: 'Calves', alias: '', image: '' },
        { _id: 4, name: 'Deltoids', alias: 'shoulders', image: '' },
        {
          _id: 5,
          name: 'Erector Spinae',
          alias: 'mid back, along spine',
          image: ''
        },
        { _id: 6, name: 'Forearms', alias: 'abs', image: '' },
        { _id: 7, name: 'Gluteus Maximus', alias: 'abs', image: '' },
        {
          _id: 8,
          name: 'Hamstrings',
          alias: 'abs',
          image: '',
          'exercise_muscle._id': 2,
          'exercise_muscle.exercise_id': 2,
          'exercise_muscle.muscle_rank': 100
        },
        {
          _id: 9,
          name: 'Latissimus Dorsi',
          alias: 'outer lower back',
          image: ''
        },
        { _id: 10, name: 'Obliques', alias: 'outer abs', image: '' },
        {
          _id: 11,
          name: 'Pectorals',
          alias: 'chest',
          image: '',
          'exercise_muscle._id': 1,
          'exercise_muscle.exercise_id': 1,
          'exercise_muscle.muscle_rank': 100
        },
        {
          _id: 12,
          name: 'Quadriceps',
          alias: 'quads',
          image: '',
          'exercise_muscle._id': 3,
          'exercise_muscle.exercise_id': 3,
          'exercise_muscle.muscle_rank': 100
        },
        { _id: 13, name: 'Trapezius', alias: 'upper back', image: '' },
        { _id: 14, name: 'Triceps', alias: '', image: '' }
      ],
      exercise_muscle: [
        { _id: 1, exercise_id: 1, muscle_id: 11, muscle_rank: 100 },
        { _id: 2, exercise_id: 2, muscle_id: 8, muscle_rank: 100 },
        { _id: 3, exercise_id: 3, muscle_id: 12, muscle_rank: 100 }
      ]
    })
  })
})