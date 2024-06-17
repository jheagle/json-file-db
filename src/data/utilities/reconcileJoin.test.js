import { reconcileJoin } from './reconcileJoin'

describe('reconcileJoin', () => {
  test('will apply found join with changes', () => {
    const dataSet = {
      workouts: [
        {
          _id: 1,
          exercise_id: 1,
          weight_effort: '115lbs',
          reps: 10,
          sets: 3,
          note: '',
          date: '2024-06-02',
          muscles: [{ _id: 11, name: 'Pectorals', alias: 'chest', image: '' }]
        }
      ],
      muscles: [
        {
          _id: 11,
          name: 'Pectorals',
          alias: 'chest',
          image: '',
          'exercise_muscle._id': 1,
          'exercise_muscle.exercise_id': 1,
          'exercise_muscle.muscle_rank': 100
        },
        { _id: 14, name: 'Triceps', alias: '', image: '' }
      ]
    }
    const entity = 'workouts'
    const index = 0
    const joinEntity = 'muscles'
    const joinProperty = '_id'
    const result = reconcileJoin(dataSet, entity, index, joinEntity, joinProperty)
    expect(result[entity][index][joinEntity][0]).toEqual(dataSet[joinEntity][0])
  })
})