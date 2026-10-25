import { splitQueries } from './splitQueries'

const sampleQueries = [
  'read workouts where date = \'2024-06-02\'',
  'read workouts.muscles' +
  ' on workouts.exercise_id = exercises._id' +
  ' and on exercises._id = exercise_muscle.exercise_id' +
  ' and on exercise_muscle.muscle_id = muscles._id' +
  ' where muscles.alias = \'chest\'',
  'read workouts.muscles' +
  ' on workouts.exercise_id = exercises._id' +
  ' and on exercises._id = exercise_muscle.exercise_id' +
  ' and on exercise_muscle.muscle_id = muscles._id' +
  ' merge workouts.exercise_id with exercises._id' +
  ' merge exercise_muscle.muscle_id with muscles._id' +
  ' where muscles.alias = \'chest\'',
  'read workouts sort date desc, order',
  'read workouts group by date',
  'read workouts.exercises' +
  ' select exercises.name as exercise, workouts.sets as sets, reps' +
  ' on workouts.exercise_id = exercises._id' +
  ' merge workouts.exercise_id with exercises._id' +
  ' limit 2' +
  ' offset 1'
]

describe('splitQueries', () => {
  test('can identify all queries', () => {
    const queries = sampleQueries.join(';\n')
    const result = splitQueries(queries)
    expect(result).toEqual(sampleQueries)
  })

  test('allows a ; after the last query, and ignores empty statements', () => {
    expect(splitQueries('read a;')).toEqual(['read a'])
    expect(splitQueries(' read a ;; read b ; ')).toEqual(['read a', 'read b'])
    expect(splitQueries('')).toEqual([])
  })

  test('no longer splits on command keywords: queries need a ; between them', () => {
    expect(splitQueries('read a read b')).toEqual(['read a read b'])
  })

  test('keeps a value containing a command keyword or a ; in one query', () => {
    expect(splitQueries('insert notes values text = \'please read this; then update it\'; read notes')).toEqual([
      'insert notes values text = \'please read this; then update it\'',
      'read notes'
    ])
  })

  test('removes comments, keeping the words either side apart', () => {
    const collapsed = queries => splitQueries(queries).map((query) => query.replace(/\s+/g, ' '))
    expect(collapsed('read a -- first; not a split\nwhere b = 1; /* second; */read c')).toEqual(['read a where b = 1', 'read c'])
    expect(collapsed('read a/* joined? */where b = 1')).toEqual(['read a where b = 1'])
  })

  test('keeps comment markers inside a string', () => {
    expect(splitQueries('insert t values s = \'-- not /* a */ comment\'')).toEqual([
      'insert t values s = \'-- not /* a */ comment\''
    ])
  })

  test('throws for an unclosed string or comment', () => {
    expect(() => splitQueries('read t where a = \'x; read b')).toThrow('Unclosed string')
    expect(() => splitQueries('read t /* where a = 1')).toThrow('Unclosed comment')
  })
})
