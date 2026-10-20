import { readEntity } from '../queries/readEntity'
import { splitEntityProperty } from './parsers/splitEntityProperty'
import { where } from '../queries/where'
import { retrieveRecord } from './retrieveRecord'
import { fieldType } from './fieldType'

export const mergeJoin = async (propertyA = '', propertyB = '', dataSets = {}) => {
  const { entity: entityA, property: propA } = splitEntityProperty(propertyA)
  const { entity: entityB, property: propB } = splitEntityProperty(propertyB)

  dataSets = await readEntity(entityA, dataSets)
  dataSets = await readEntity(entityB, dataSets)

  const typeB = fieldType(await retrieveRecord(entityB), propB)
  dataSets[entityA] = dataSets[entityA].map((dataA) => {
    const matches = where(dataSets[entityB], { property: propB, comparator: '=', value: dataA[propA], type: typeB })
    if (!matches.length) {
      return dataA
    }
    const mergeMatch = matches[0]
    for (const prop in mergeMatch) {
      if (prop === propB) {
        // Skip the condition property since it is irrelevant
        continue
      }
      dataA[`${entityB}.${prop}`] = mergeMatch[prop]
    }
    return dataA
  })
  return dataSets
}
