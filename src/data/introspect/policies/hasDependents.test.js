import { create } from '../create'
import { insertEntity } from '../../queries/insertEntity'
import { hasDependents } from './hasDependents'
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from '../../utilities/config'

const databasePath = 'has-dependents-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

const exerciseDefinition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'name', type: 'string', optional: true }
]
const exerciseKeys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
]
const workoutDefinition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'exercise_id', type: 'string', optional: true }
]
const workoutKeys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
  {
    type: 'foreign',
    fields: ['exercise_id'],
    lookup: 'fk_exercise_id.json',
    references: [{ fields: ['exercises._id'], lookup: 'exercises.json' }]
  }
]

describe('hasDependents', () => {
  test('false when no other entity references this value', async () => {
    await create('exercises', exerciseDefinition, exerciseKeys)
    const exercise = await insertEntity('exercises', [{ name: 'Bench Press' }], {})
    expect(await hasDependents('exercises', '_id', exercise.exercises[0]._id)).toBe(false)
  })

  test('true when another entity has a foreign key pointing at this value', async () => {
    await create('exercises', exerciseDefinition, exerciseKeys)
    const exercise = await insertEntity('exercises', [{ name: 'Bench Press' }], {})
    await create('workouts', workoutDefinition, workoutKeys)
    await insertEntity('workouts', [{ exercise_id: exercise.exercises[0]._id }], {})

    expect(await hasDependents('exercises', '_id', exercise.exercises[0]._id)).toBe(true)
  })

  test('false once the only dependent is removed', async () => {
    await create('exercises', exerciseDefinition, exerciseKeys)
    const exercise = await insertEntity('exercises', [{ name: 'Bench Press' }], {})
    await create('workouts', workoutDefinition, workoutKeys)
    const workout = await insertEntity('workouts', [{ exercise_id: exercise.exercises[0]._id }], {})

    const { rm } = require('fs/promises')
    await rm(`${databasePath}workouts/${workout.workouts[0]._id}.json`)
    const { readFile, writeFile } = require('fs/promises')
    const recordFile = JSON.parse(await readFile(`${databasePath}workouts.json`, 'utf8'))
    recordFile.entries = []
    await writeFile(`${databasePath}workouts.json`, JSON.stringify(recordFile))

    expect(await hasDependents('exercises', '_id', exercise.exercises[0]._id)).toBe(false)
  })

  test('ignores a different value on the same foreign key field', async () => {
    await create('exercises', exerciseDefinition, exerciseKeys)
    const exercises = await insertEntity('exercises', [{ name: 'Bench Press' }, { name: 'Squat' }], {})
    await create('workouts', workoutDefinition, workoutKeys)
    await insertEntity('workouts', [{ exercise_id: exercises.exercises[0]._id }], {})

    expect(await hasDependents('exercises', '_id', exercises.exercises[1]._id)).toBe(false)
  })
})
