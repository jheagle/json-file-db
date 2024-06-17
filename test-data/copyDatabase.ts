// @ts-ignore
import fs from 'fs/promises'

export const copyDatabase = async (destination: string = 'test-database'): Promise<Array<string>> => {
  const makeDirs: string[] = [
    '__indexes',
    '__indexes/exercise_muscle',
    '__indexes/exercises',
    '__indexes/muscles',
    '__indexes/workouts',
    'exercise_muscle',
    'exercises',
    'muscles',
    'workouts',
  ]
  for (let dir of makeDirs) {
    await fs.mkdir(`${destination}/${dir}`)
  }
  const copyFiles: string[] = [
    '__RECORDS.json',
    'exercise_muscle.json',
    'exercise_muscle/bench_press_pectorals.json',
    'exercise_muscle/deadlift_hamstrings.json',
    'exercise_muscle/squat_quadriceps.json',
    '__indexes/exercise_muscle/fk_exercise_id.json',
    '__indexes/exercise_muscle/fk_muscle_id.json',
    '__indexes/exercise_muscle/pk__id.json',
    'exercises.json',
    'exercises/bench_press.json',
    'exercises/deadlift.json',
    'exercises/squat.json',
    '__indexes/exercises/pk__id.json',
    'muscles.json',
    'muscles/abdominal.json',
    'muscles/biceps.json',
    'muscles/calves.json',
    'muscles/deltoids.json',
    'muscles/erector_spinae.json',
    'muscles/forearms.json',
    'muscles/gluteus_maximus.json',
    'muscles/hamstrings.json',
    'muscles/latissimus_dorsi.json',
    'muscles/obliques.json',
    'muscles/pectorals.json',
    'muscles/quadriceps.json',
    'muscles/trapezius.json',
    'muscles/triceps.json',
    '__indexes/muscles/pk__id.json',
    'workouts.json',
    'workouts/2024-06-02-001.json',
    'workouts/2024-06-02-002.json',
    'workouts/2024-06-02-003.json',
    'workouts/2024-06-05-001.json',
    'workouts/2024-06-05-002.json',
    'workouts/2024-06-05-003.json',
    '__indexes/workouts/fk_exercise_id.json',
    '__indexes/workouts/index_date.json',
    '__indexes/workouts/pk__id.json',
  ]
  for (let file of copyFiles) {
    await fs.copyFile(`test-data/${file}`, `${destination}/${file}`)
  }
  return copyFiles
}