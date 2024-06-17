import { readEntity } from '../queries/readEntity'
import { splitEntityProperty } from './parsers/splitEntityProperty'
import { where } from '../queries/where'

export const mergeJoin = async (propertyA = '', propertyB = '', dataSets = {}) => {
  const { entity: entityA, property: propA } = splitEntityProperty(propertyA)
  const { entity: entityB, property: propB } = splitEntityProperty(propertyB)

  dataSets = await readEntity(entityA, dataSets)
  dataSets = await readEntity(entityB, dataSets)

  dataSets[entityA] = dataSets[entityA].map((dataA) => {
    const matches = where(dataSets[entityB], { property: propB, comparator: '=', value: dataA[propA] })
    if (!matches.length) {
      return dataA
    }
    const mergeMatch = matches[0]
    for (let prop in mergeMatch) {
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