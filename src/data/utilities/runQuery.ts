import { deleteEntity } from '../queries/deleteEntity'
import { insertEntity } from '../queries/insertEntity'
import { readEntity } from '../queries/readEntity'
import { updateEntity } from '../queries/updateEntity'
import { joinEntity } from '../queries/joinEntity'
import { mergeJoins } from '../queries/mergeJoins'
import { where } from '../queries/where'
import { sortBy } from '../queries/sortBy'
import { groupBy } from '../queries/groupBy'
import { limitOffset } from '../queries/limitOffset'
import { selectFields } from '../queries/selectFields'
import { retrieveRecord } from './retrieveRecord'
import { getConditionIndexedList } from './getConditionIndexedList'
import { getJoinIndexedList } from './getJoinIndexedList'

export const runQuery = async (parsed) => {
  const recordData = {
    [parsed.entity]: await retrieveRecord(parsed.entity)
  }
  if (typeof parsed.joinEntity !== 'undefined') {
    recordData[parsed.joinEntity] = await retrieveRecord(parsed.joinEntity)
  }

  let dataSet: any = { [parsed.entity]: [] }

  parsed = await getConditionIndexedList(parsed, recordData, dataSet)
  parsed = await getJoinIndexedList(parsed, recordData, dataSet)

  // delete/update act on whatever is already in dataSet[entity] - unlike read, which loads
  // everything and lets the where-reduce below narrow it down afterward, they never get a second
  // pass. So the matching rows have to be fully resolved (indexed conditions already are, via
  // getConditionIndexedList above; anything left in parsed.conditions is not) before either runs.
  if (parsed.command === 'delete' || parsed.command === 'update') {
    dataSet = await readEntity(parsed.entity, dataSet)
    dataSet[parsed.entity] = parsed.conditions.reduce(
      (remainingData, condition) => where(remainingData, condition),
      dataSet[parsed.entity]
    )
  }

  switch (parsed.command) {
    case 'delete':
      dataSet = await deleteEntity(parsed.entity, dataSet)
      break
    case 'insert':
      dataSet = await insertEntity(parsed.entity, parsed.insertValues, dataSet)
      break
    case 'read':
      dataSet = await readEntity(parsed.entity, dataSet)
      break
    case 'update':
      dataSet = await updateEntity(parsed.entity, parsed.updateValues, dataSet)
      break
    default:
      throw new Error(`Unknown command: ${parsed.command}`)
  }
  dataSet = await joinEntity(parsed.entity, parsed.joinEntity, dataSet, parsed.joinClauses)
  dataSet = await mergeJoins(dataSet, parsed.mergeJoins)

  // delete/update already had parsed.conditions applied above, before they ran. Re-applying the
  // same conditions here would be wrong, not just redundant, for update specifically: if the
  // update just changed the very field a condition filters on, re-checking that condition against
  // the now-changed data would filter the just-updated rows back out.
  if (parsed.command !== 'delete' && parsed.command !== 'update') {
    dataSet[parsed.entity] = parsed.conditions.reduce(
      (remainingData, condition) => {
        return where(remainingData, condition)
      },
      dataSet[parsed.entity]
    )
  }

  dataSet[parsed.entity] = sortBy(dataSet[parsed.entity], parsed.sortClauses)
  dataSet[parsed.entity] = limitOffset(dataSet[parsed.entity], parsed.offset, parsed.limit)
  dataSet[parsed.entity] = groupBy(dataSet[parsed.entity], parsed.groupBy)
  dataSet[parsed.entity] = selectFields(dataSet[parsed.entity], parsed.selectClauses)

  return dataSet
}