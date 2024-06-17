import { splitQueries } from './splitQueries'

const sampleQueries = [
  'read workouts where date = \'2024-06-02\'',
  'read workouts.muscles'
  + ' on workouts.exercise_id = exercises._id'
  + ' and on exercises._id = exercise_muscle.exercise_id'
  + ' and on exercise_muscle.muscle_id = muscles._id'
  + ' where muscles.alias = \'chest\'',
  'read workouts.muscles'
  + ' on workouts.exercise_id = exercises._id'
  + ' and on exercises._id = exercise_muscle.exercise_id'
  + ' and on exercise_muscle.muscle_id = muscles._id'
  + ' merge workouts.exercise_id with exercises._id'
  + ' merge exercise_muscle.muscle_id with muscles._id'
  + ' where muscles.alias = \'chest\'',
  'read workouts sort date desc, order',
  'read workouts group by date',
  'read workouts.exercises'
  + ' select exercises.name as exercise, workouts.sets as sets, reps'
  + ' on workouts.exercise_id = exercises._id'
  + ' merge workouts.exercise_id with exercises._id'
  + ' limit 2'
  + ' offset 1'
]

describe('splitQueries', () => {
  test('can identify all queries', () => {
    const queries = sampleQueries.reduce((concatQueries, query) => concatQueries = `${concatQueries} ${query}`, '')
    const result = splitQueries(queries)
    expect(result).toEqual(sampleQueries)
  })
})