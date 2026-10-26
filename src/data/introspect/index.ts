import { create as createRecord } from './create'
import { drop as dropRecord } from './drop'
import { describe as describeRecord } from './describe'
import { withDatabaseLock } from '../utilities/databaseLock'

// The public versions take the database lock (see withDatabaseLock); code inside the package imports the files directly
export const create = (...args: Parameters<typeof createRecord>): ReturnType<typeof createRecord> =>
  withDatabaseLock(() => createRecord(...args))
export const drop = (...args: Parameters<typeof dropRecord>): ReturnType<typeof dropRecord> =>
  withDatabaseLock(() => dropRecord(...args))
export const describe = (...args: Parameters<typeof describeRecord>): ReturnType<typeof describeRecord> =>
  withDatabaseLock(() => describeRecord(...args))

export { fieldProperties, fieldDefinition, fieldName } from './definitions/field'
export { keyProperties, keyDefinition, indexType, indexLocation } from './definitions/key'
export { referenceProperties, reference } from './definitions/keyReference'
export { recordProperties, recordDefinition, recordPath, entityPath } from './definitions/record'
