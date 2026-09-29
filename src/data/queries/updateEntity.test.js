import { create } from '../introspect/create'
import { insertEntity } from './insertEntity'
import { updateEntity } from './updateEntity'
import { testHelpers } from 'js-build-tools/testHelpers'

const { readFile } = require('fs/promises')

const databasePath = 'update-entity-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

const definition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'bar', type: 'string', optional: true, autoGenerate: false },
  { name: 'note', type: 'string', optional: true, autoGenerate: false }
]

const keys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
]

describe('updateEntity', () => {
  test('does nothing when dataSet has no rows to update', async () => {
    await create('foo', definition, keys)
    const result = await updateEntity('foo', { bar: 'changed' }, { foo: [] })
    expect(result).toEqual({ foo: [] })
  })

  test('throws when the record has no single-field primary key', async () => {
    await create('foo', definition, [])
    await expect(updateEntity('foo', { bar: 'x' }, { foo: [{ _id: '1' }] }))
      .rejects.toThrow('Cannot update "foo" without a single-field primary key')
  })

  test('throws when no entry matches the row being updated', async () => {
    await create('foo', definition, keys)
    await expect(updateEntity('foo', { bar: 'x' }, { foo: [{ _id: 'missing' }] }))
      .rejects.toThrow('Could not find entry for foo where "_id" = missing')
  })

  test('merges the given values onto the existing entry file, leaving other fields intact', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one', note: 'keep me' }], {})
    const row = inserted.foo[0]

    const result = await updateEntity('foo', { bar: 'updated' }, { foo: [row] })

    expect(result.foo).toEqual([{ _id: row._id, bar: 'updated', note: 'keep me' }])
    const onDisk = JSON.parse(await readFile(`${databasePath}foo/${row._id}.json`, 'utf8'))
    expect(onDisk).toEqual({ _id: row._id, bar: 'updated', note: 'keep me' })
  })

  test('finds the right file to update even when a filename does not match the primary key', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one' }], {})
    const row = inserted.foo[0]
    const { rename, writeFile } = require('fs/promises')
    await rename(`${databasePath}foo/${row._id}.json`, `${databasePath}foo/custom-name.json`)
    const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    recordFile.entries = ['custom-name.json']
    await writeFile(`${databasePath}foo.json`, JSON.stringify(recordFile))

    const result = await updateEntity('foo', { bar: 'moved' }, { foo: [row] })
    expect(result.foo[0].bar).toBe('moved')
    const onDisk = JSON.parse(await readFile(`${databasePath}foo/custom-name.json`, 'utf8'))
    expect(onDisk.bar).toBe('moved')
  })

  test('throws when the update would remove a required field', async () => {
    const definitionRequiringBar = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'bar', type: 'string', optional: false, autoGenerate: false }
    ]
    await create('foo', definitionRequiringBar, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one' }], {})
    await expect(updateEntity('foo', { bar: undefined }, { foo: [inserted.foo[0]] }))
      .rejects.toThrow('Missing required field "bar" for foo')
  })

  test('moves a changed unique key value to a new index entry', async () => {
    const uniqueDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'email', type: 'string', optional: false, autoGenerate: false }
    ]
    const uniqueKeys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
      { type: 'unique', fields: ['email'], lookup: 'unique_email.json' }
    ]
    await create('foo', uniqueDefinition, uniqueKeys)
    const inserted = await insertEntity('foo', [{ email: 'old@example.com' }], {})
    const row = inserted.foo[0]

    await updateEntity('foo', { email: 'new@example.com' }, { foo: [row] })

    const emailIndex = JSON.parse(await readFile(`${databasePath}__indexes/foo/unique_email.json`, 'utf8'))
    expect(emailIndex).toEqual([{ value: 'new@example.com', record: [`${row._id}.json`] }])
  })

  test('rejects an update that collides with another record\'s unique value', async () => {
    const uniqueDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'email', type: 'string', optional: false, autoGenerate: false }
    ]
    const uniqueKeys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
      { type: 'unique', fields: ['email'], lookup: 'unique_email.json' }
    ]
    await create('foo', uniqueDefinition, uniqueKeys)
    const inserted = await insertEntity('foo', [{ email: 'first@example.com' }, { email: 'second@example.com' }], {})

    await expect(updateEntity('foo', { email: 'second@example.com' }, { foo: [inserted.foo[0]] }))
      .rejects.toThrow('Duplicate value for unique key "email" on foo')
  })

  test('coerces a value to match its field\'s declared type', async () => {
    const definitionWithInt = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'reps', type: 'int', optional: false, autoGenerate: false }
    ]
    await create('foo', definitionWithInt, keys)
    const inserted = await insertEntity('foo', [{ reps: 10 }], {})
    const result = await updateEntity('foo', { reps: '12' }, { foo: [inserted.foo[0]] })
    expect(result.foo[0].reps).toBe(12)
  })

  test('rejects a value that does not match its field\'s declared type', async () => {
    const definitionWithInt = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'reps', type: 'int', optional: false, autoGenerate: false }
    ]
    await create('foo', definitionWithInt, keys)
    const inserted = await insertEntity('foo', [{ reps: 10 }], {})
    await expect(updateEntity('foo', { reps: 'twelve' }, { foo: [inserted.foo[0]] }))
      .rejects.toThrow('Value "twelve" is not a valid int')
  })

  test('does not re-validate a field the update never touches, even if it is already stored with a mismatched type', async () => {
    await create('foo', definition, keys)
    const inserted = await insertEntity('foo', [{ bar: 'one' }], {})
    const row = inserted.foo[0]
    // Simulate data that predates any type checking - _id is declared type "string" but stored
    // as a real number, exactly like the project's own real fixture data.
    const { writeFile } = require('fs/promises')
    await writeFile(`${databasePath}foo/${row._id}.json`, JSON.stringify({ _id: 1, bar: 'one', note: null }))

    const result = await updateEntity('foo', { bar: 'updated' }, { foo: [{ ...row, _id: 1 }] })
    expect(result.foo[0].bar).toBe('updated')
    expect(result.foo[0]._id).toBe(1)
  })

  describe('foreign keys', () => {
    const exerciseDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'name', type: 'string', optional: true, autoGenerate: false }
    ]
    const exerciseKeys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
    ]
    const workoutDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'exercise_id', type: 'string', optional: true, autoGenerate: false }
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

    test('accepts changing a foreign key to a value that exists in the referenced record', async () => {
      await create('exercises', exerciseDefinition, exerciseKeys)
      const exercises = await insertEntity('exercises', [{ name: 'Bench Press' }, { name: 'Squat' }], {})
      await create('workouts', workoutDefinition, workoutKeys)
      const inserted = await insertEntity('workouts', [{ exercise_id: exercises.exercises[0]._id }], {})

      const result = await updateEntity('workouts', { exercise_id: exercises.exercises[1]._id }, { workouts: [inserted.workouts[0]] })
      expect(result.workouts[0].exercise_id).toBe(exercises.exercises[1]._id)
    })

    test('rejects changing a foreign key to a value that does not exist in the referenced record', async () => {
      await create('exercises', exerciseDefinition, exerciseKeys)
      const exercises = await insertEntity('exercises', [{ name: 'Bench Press' }], {})
      await create('workouts', workoutDefinition, workoutKeys)
      const inserted = await insertEntity('workouts', [{ exercise_id: exercises.exercises[0]._id }], {})

      await expect(updateEntity('workouts', { exercise_id: 'does-not-exist' }, { workouts: [inserted.workouts[0]] }))
        .rejects.toThrow('Foreign key "exercise_id" on workouts references a nonexistent exercises._id = does-not-exist')
    })

    test('does not re-check an unchanged foreign key value, even if its referenced record was since removed', async () => {
      await create('exercises', exerciseDefinition, exerciseKeys)
      const exercises = await insertEntity('exercises', [{ name: 'Bench Press' }], {})
      await create('workouts', workoutDefinition, workoutKeys)
      const inserted = await insertEntity('workouts', [{ exercise_id: exercises.exercises[0]._id }], {})

      const { rm } = require('fs/promises')
      await rm(`${databasePath}exercises/${exercises.exercises[0]._id}.json`)

      const result = await updateEntity('workouts', { exercise_id: exercises.exercises[0]._id }, { workouts: [inserted.workouts[0]] })
      expect(result.workouts[0].exercise_id).toBe(exercises.exercises[0]._id)
    })
  })

  test('re-updating a row to its own existing unique value does not falsely collide', async () => {
    const uniqueDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'email', type: 'string', optional: false, autoGenerate: false }
    ]
    const uniqueKeys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
      { type: 'unique', fields: ['email'], lookup: 'unique_email.json' }
    ]
    await create('foo', uniqueDefinition, uniqueKeys)
    const inserted = await insertEntity('foo', [{ email: 'same@example.com' }], {})
    const row = inserted.foo[0]

    const result = await updateEntity('foo', { email: 'same@example.com' }, { foo: [row] })
    expect(result.foo[0].email).toBe('same@example.com')
  })
})
