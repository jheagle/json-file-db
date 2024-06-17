import { reconcileJoins } from './reconcileJoins'

describe('reconcileJoins', () => {
  test('reconciles several joins', () => {
    const propertyA = 'muscles._id'
    const propertyB = 'exercise_muscle.muscle_id'
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
        },
        {
          _id: 2,
          exercise_id: 2,
          weight_effort: '155lbs',
          reps: 10,
          sets: 3,
          note: '',
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
          date: '2024-06-02',
          muscles: [{ _id: 12, name: 'Quadriceps', alias: 'quads', image: '' }]
        }
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
      ]
    }
    const result = reconcileJoins(propertyA, propertyB, dataSet)
    expect(result['workouts']).toEqual([
      {
        _id: 1,
        exercise_id: 1,
        weight_effort: '115lbs',
        reps: 10,
        sets: 3,
        note: '',
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
    ])
  })
})