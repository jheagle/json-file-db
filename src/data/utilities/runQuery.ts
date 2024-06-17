import { deleteEntity } from '../queries/deleteEntity'
import { insertEntity } from '../queries/insertEntity'
import { readEntity } from '../queries/readEntity'
import { updateEntity } from '../queries/updateEntity'
import { joinEntity } from '../queries/joinEntity'
import { mergeJoins } from '../queries/mergeJoins'
import { where } from '../queries/where'
import { sortBy } from '../queries/sortBy'
import { groupBy } from '../queries/groupBy'
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

  let dataSet = { [parsed.entity]: [] }

  parsed = await getConditionIndexedList(parsed, recordData, dataSet)
  parsed = await getJoinIndexedList(parsed, recordData, dataSet)

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

  dataSet[parsed.entity] = parsed.conditions.reduce(
    (remainingData, condition) => {
      return where(remainingData, condition)
    },
    dataSet[parsed.entity]
  )

  dataSet[parsed.entity] = sortBy(dataSet[parsed.entity], parsed.sortClauses)
  dataSet[parsed.entity] = groupBy(dataSet[parsed.entity], parsed.groupBy)

  return dataSet
}