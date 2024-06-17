import { retrieveRecords } from './retrieveRecords'
import { testHelpers } from 'js-build-tools/testHelpers'
import { copyDatabase } from '../../../test-data/copyDatabase'

const databasePath = 'retrieve-records-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(
  () => testHelpers.beforeEach()
    .then(() => copyDatabase(databasePath))
)

afterEach(testHelpers.afterEach)

describe('retrieveRecords', () => {
  test('retrieve main RECORDS file', async () => {
    expect(await retrieveRecords('__RECORDS')).toEqual([
      {
        path: 'exercise_muscle',
        definition: [
          {
            name: '_id',
            type: 'string',
            optional: false
          },
          {
            name: 'exercise_id',
            type: 'string',
            optional: false
          },
          {
            name: 'muscle_id',
            type: 'string',
            optional: false
          },
          { name: 'muscle_rank', type: 'int', optional: false }
        ],
        keys: [
          { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
          {
            type: 'foreign', fields: ['exercise_id'], lookup: 'fk_exercise_id.json', references: [
              {
                'fields': ['exercises._id'],
                'lookup': 'exercises.json'
              }
            ]
          },
          {
            type: 'foreign', fields: ['muscle_id'], lookup: 'fk_muscle_id.json', references: [
              {
                'fields': ['muscles._id'],
                'lookup': 'muscles.json'
              }
            ]
          }
        ],
        entries: [
          'bench_press_pectorals.json',
          'deadlift_hamstrings.json',
          'squat_quadriceps.json'
        ]
      },
      {
        path: 'exercises',
        definition: [
          {
            name: '_id',
            type: 'string',
            optional: false
          },
          { name: 'name', type: 'string', optional: false },
          { name: 'description', type: 'string', optional: true }
        ],
        keys: [
          { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
        ],
        entries: ['bench_press.json', 'deadlift.json', 'squat.json']
      },
      {
        path: 'muscles',
        definition: [
          {
            name: '_id',
            type: 'string',
            optional: false
          },
          { name: 'name', type: 'string', optional: false },
          { name: 'alias', type: 'string', optional: true },
          { name: 'image', type: 'string', optional: true }
        ],
        keys: [
          { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
        ],
        entries: [
          'abdominal.json',
          'biceps.json',
          'calves.json',
          'deltoids.json',
          'erector_spinae.json',
          'forearms.json',
          'gluteus_maximus.json',
          'hamstrings.json',
          'latissimus_dorsi.json',
          'obliques.json',
          'pectorals.json',
          'quadriceps.json',
          'trapezius.json',
          'triceps.json'
        ]
      },
      {
        path: 'workouts',
        definition: [
          {
            name: '_id',
            type: 'string',
            optional: false
          },
          {
            name: 'exercise_id',
            type: 'string',
            optional: false
          },
          {
            name: 'weight_effort',
            type: 'string',
            optional: true
          },
          { name: 'reps', type: 'int', optional: true },
          { name: 'sets', type: 'int', optional: true },
          { name: 'note', type: 'string', optional: true },
          { name: 'order', type: 'int', optional: false },
          { name: 'date', type: 'string', optional: false }
        ],
        keys: [
          { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
          { type: 'index', fields: ['date'], lookup: 'index_date.json' },
          {
            type: 'foreign',
            fields: ['exercise_id'],
            lookup: 'fk_exercise_id.json',
            references: [{ fields: ['exercises._id'], lookup: 'exercises.json' }]
          }
        ],
        entries: [
          '2024-06-02-001.json',
          '2024-06-02-002.json',
          '2024-06-02-003.json',
          '2024-06-05-001.json',
          '2024-06-05-002.json',
          '2024-06-05-003.json'
        ]
      }
    ])
  })

  test('retrieve workouts entries', async () => {
    expect(await retrieveRecords('workouts')).toEqual([
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
    ])
  })
})