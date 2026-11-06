import { create as createRecord } from './create'
import { drop as dropRecord } from './drop'
import { describe as describeRecord } from './describe'
import { formatDatabase as formatAll } from './formatDatabase'
import { withDatabaseLock } from '../utilities/databaseLock'
import { withWriteSet } from '../storage'

// The public versions take the database lock (see withDatabaseLock), and create, drop and formatDatabase change
// storage all at once or not at all (see withWriteSet); code inside the package imports the files directly
export const create = (...args: Parameters<typeof createRecord>): ReturnType<typeof createRecord> =>
  withDatabaseLock(() => withWriteSet(() => createRecord(...args)))
export const drop = (...args: Parameters<typeof dropRecord>): ReturnType<typeof dropRecord> =>
  withDatabaseLock(() => withWriteSet(() => dropRecord(...args)))
export const describe = (...args: Parameters<typeof describeRecord>): ReturnType<typeof describeRecord> =>
  withDatabaseLock(() => describeRecord(...args))
export const formatDatabase = (...args: Parameters<typeof formatAll>): ReturnType<typeof formatAll> =>
  withDatabaseLock(() => withWriteSet(() => formatAll(...args)))
export type { formatResult } from './formatDatabase'

export { fieldProperties, fieldDefinition, fieldName } from './definitions/field'
export { keyProperties, keyDefinition, indexType, indexLocation } from './definitions/key'
export { referenceProperties, reference } from './definitions/keyReference'
export { recordProperties, recordDefinition, recordPath, entityPath } from './definitions/record'
