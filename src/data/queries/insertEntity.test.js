import { create } from '../introspect/create'
import { insertEntity } from './insertEntity'
import { testHelpers } from 'js-build-tools/testHelpers'
import { configure } from '../utilities/config'

const { readFile } = require('fs/promises')

const databasePath = 'insert-entity-database/'
configure({ databasePath })
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

const definition = [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'bar', type: 'string', optional: true, autoGenerate: false }
]

const keys = [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
]

describe('insertEntity', () => {
  test('inserts a new entity, generating its primary key', async () => {
    await create('foo', definition, keys)
    const dataSet = await insertEntity('foo', [{ bar: 'baz' }], {})

    expect(dataSet.foo).toHaveLength(1)
    const inserted = dataSet.foo[0]
    expect(typeof inserted._id).toBe('string')
    expect(inserted.bar).toBe('baz')

    expect(testHelpers.fileExists(`${databasePath}foo/${inserted._id}.json`)).toBeTruthy()
    const entryFile = JSON.parse(await readFile(`${databasePath}foo/${inserted._id}.json`, 'utf8'))
    expect(entryFile).toEqual(inserted)

    const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    expect(recordFile.entries).toEqual([`${inserted._id}.json`])

    const indexFile = JSON.parse(await readFile(`${databasePath}__indexes/foo/pk__id.json`, 'utf8'))
    expect(indexFile).toEqual([{ value: inserted._id, record: [`${inserted._id}.json`] }])
  })

  test('inserts multiple entities from one call', async () => {
    await create('foo', definition, keys)
    const dataSet = await insertEntity('foo', [{ bar: 'one' }, { bar: 'two' }], {})

    expect(dataSet.foo).toHaveLength(2)
    const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
    expect(recordFile.entries).toHaveLength(2)
  })

  test('appends onto an existing dataSet entry instead of replacing it', async () => {
    await create('foo', definition, keys)
    const dataSet = await insertEntity('foo', [{ bar: 'one' }], { foo: [{ bar: 'existing' }] })
    expect(dataSet.foo).toHaveLength(2)
    expect(dataSet.foo[0]).toEqual({ bar: 'existing' })
  })

  test('applies a field default when no value is given', async () => {
    const definitionWithDefault = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'status', type: 'string', optional: false, useDefault: true, defaultValue: 'pending' }
    ]
    await create('foo', definitionWithDefault, keys)
    const dataSet = await insertEntity('foo', [{}], {})
    expect(dataSet.foo[0].status).toBe('pending')
  })

  test('throws when a required field has no value, default, or autoGenerate', async () => {
    const definitionRequiringBar = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'bar', type: 'string', optional: false, autoGenerate: false }
    ]
    await create('foo', definitionRequiringBar, keys)
    await expect(insertEntity('foo', [{}], {})).rejects.toThrow('Missing required field "bar" for foo')
  })

  test('throws on a duplicate primary key value instead of writing the file', async () => {
    const definitionExplicitId = [
      { name: '_id', type: 'string', optional: false, autoGenerate: false },
      { name: 'bar', type: 'string', optional: true }
    ]
    await create('foo', definitionExplicitId, keys)
    await insertEntity('foo', [{ _id: 'dupe', bar: 'first' }], {})
    await expect(insertEntity('foo', [{ _id: 'dupe', bar: 'second' }], {}))
      .rejects.toThrow('Duplicate value for primary key "_id" on foo')
  })

  test('coerces a value to match its field\'s declared type', async () => {
    const definitionWithInt = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'reps', type: 'int', optional: false, autoGenerate: false }
    ]
    await create('foo', definitionWithInt, keys)
    const dataSet = await insertEntity('foo', [{ reps: '10' }], {})
    expect(dataSet.foo[0].reps).toBe(10)
  })

  test('rejects a value that does not match its field\'s declared type', async () => {
    const definitionWithInt = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'reps', type: 'int', optional: false, autoGenerate: false }
    ]
    await create('foo', definitionWithInt, keys)
    await expect(insertEntity('foo', [{ reps: 'ten' }], {}))
      .rejects.toThrow('Value "ten" is not a valid int')
  })

  describe('multi-field keys', () => {
    const multiDefinition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'a', type: 'string', optional: true },
      { name: 'b', type: 'string', optional: true }
    ]
    const multiUniqueKeys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' },
      { type: 'unique', fields: ['a', 'b'], lookup: 'unique_a_b.json' }
    ]

    test('accepts a row whose composite value is new, even if individual fields repeat', async () => {
      await create('foo', multiDefinition, multiUniqueKeys)
      await insertEntity('foo', [{ a: 'x', b: 'y' }], {})
      const result = await insertEntity('foo', [{ a: 'x', b: 'z' }], {})
      expect(result.foo[0].a).toBe('x')
      expect(result.foo[0].b).toBe('z')
    })

    test('rejects a row whose composite value duplicates an existing one', async () => {
      await create('foo', multiDefinition, multiUniqueKeys)
      await insertEntity('foo', [{ a: 'x', b: 'y' }], {})
      await expect(insertEntity('foo', [{ a: 'x', b: 'y' }], {}))
        .rejects.toThrow('Duplicate value for unique key "a, b" on foo')
    })

    test('indexes a multi-field key as a composite value', async () => {
      await create('foo', multiDefinition, multiUniqueKeys)
      const inserted = await insertEntity('foo', [{ a: 'x', b: 'y' }], {})
      const indexFile = JSON.parse(await readFile(`${databasePath}__indexes/foo/unique_a_b.json`, 'utf8'))
      expect(indexFile).toEqual([{ value: JSON.stringify(['x', 'y']), record: [`${inserted.foo[0]._id}.json`] }])
    })

    test('a genuinely composite (multi-field) primary key works, with a UUID-based filename', async () => {
      const compositePrimaryKeys = [
        { type: 'primary', fields: ['a', 'b'], lookup: 'pk_a_b.json' }
      ]
      await create('foo', multiDefinition, compositePrimaryKeys)
      const inserted = await insertEntity('foo', [{ a: 'x', b: 'y' }], {})
      expect(inserted.foo[0].a).toBe('x')
      expect(inserted.foo[0].b).toBe('y')
      const recordFile = JSON.parse(await readFile(`${databasePath}foo.json`, 'utf8'))
      expect(recordFile.entries).toHaveLength(1)
      // No single-field primary key exists, so the filename falls back to a generated UUID -
      // never derived from the composite key's own field values.
      expect(recordFile.entries[0]).not.toContain('x')
      expect(recordFile.entries[0]).not.toContain('y')
    })
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

    test('accepts a foreign key value that exists in the referenced record', async () => {
      await create('exercises', exerciseDefinition, exerciseKeys)
      const exercise = await insertEntity('exercises', [{ name: 'Bench Press' }], {})
      await create('workouts', workoutDefinition, workoutKeys)
      const result = await insertEntity('workouts', [{ exercise_id: exercise.exercises[0]._id }], {})
      expect(result.workouts[0].exercise_id).toBe(exercise.exercises[0]._id)
    })

    test('rejects a foreign key value that does not exist in the referenced record', async () => {
      await create('exercises', exerciseDefinition, exerciseKeys)
      await create('workouts', workoutDefinition, workoutKeys)
      await expect(insertEntity('workouts', [{ exercise_id: 'does-not-exist' }], {}))
        .rejects.toThrow('Foreign key "exercise_id" on workouts references a nonexistent exercises._id = does-not-exist')
    })

    test('skips the check when an optional foreign key field is omitted', async () => {
      await create('exercises', exerciseDefinition, exerciseKeys)
      await create('workouts', workoutDefinition, workoutKeys)
      const result = await insertEntity('workouts', [{}], {})
      expect(result.workouts[0].exercise_id).toBeUndefined()
    })
  })
})
