import { retrieveFile } from './retrieveFile'
import { testHelpers } from 'js-build-tools/testHelpers'
import fs from 'fs'

const databasePath = 'retrieve-file-database/'
const gulpConfig = testHelpers.gulpConfig
gulpConfig.set('databasePath', databasePath)
testHelpers.setDefaults(databasePath)

beforeEach(testHelpers.beforeEach)

afterEach(testHelpers.afterEach)

describe('retrieveFile', () => {
  test('should get the file if found', async () => {
    const recordsContent = {
      path: '',
      definition: [
        {
          name: 'path',
          type: 'string',
          optional: false,
          keys: []
        },
        {
          name: 'definition',
          type: 'object',
          optional: false,
          keys: []
        },
        {
          name: 'entries',
          type: 'array',
          optional: false,
          keys: []
        },
      ],
      entries: [
        'exercise_muscle.json',
        'exercises.json',
        'muscles.json',
        'workouts.json',
      ]
    }
    const fileName = '__RECORDS.json'
    fs.writeFileSync(`${databasePath}${fileName}`, JSON.stringify(recordsContent))
    expect(await retrieveFile(fileName)).toEqual(recordsContent)
  })
})