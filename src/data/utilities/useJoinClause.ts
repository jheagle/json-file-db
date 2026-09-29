import { readEntity } from '../queries/readEntity'
import { where } from '../queries/where'
import { splitEntityProperty } from './parsers/splitEntityProperty'
import siFunciona from 'si-funciona'

export const useJoinClause = async (
  { propertyA = null, comparator = '=', propertyB = null } = {},
  dataSets = {},
  filterJoins = {}
) => {
  const { entity: entityA, property: propA } = splitEntityProperty(propertyA)
  const { entity: entityB, property: propB } = splitEntityProperty(propertyB)

  if (!Object.prototype.hasOwnProperty.call(dataSets, entityA)) {
    dataSets = await readEntity(entityA, dataSets)
  }
  if (!Object.prototype.hasOwnProperty.call(dataSets, entityB)) {
    dataSets = await readEntity(entityB, dataSets)
  }

  if (!Object.prototype.hasOwnProperty.call(filterJoins, entityA)) {
    filterJoins[entityA] = siFunciona.cloneObject(dataSets[entityA])
  }
  if (!Object.prototype.hasOwnProperty.call(filterJoins, entityB)) {
    filterJoins[entityB] = siFunciona.cloneObject(dataSets[entityB])
  }

  filterJoins[entityA] = filterJoins[entityB].reduce(
    (dataA, dataB) => siFunciona.mergeArrays(
      dataA,
      where(filterJoins[entityA], { property: propA, comparator: comparator, value: dataB[propB] })
    ),
    []
  )

  filterJoins[entityB] = filterJoins[entityA].reduce(
    (dataB, dataA) => siFunciona.mergeArrays(
      dataB,
      where(filterJoins[entityB], { property: propB, comparator: comparator, value: dataA[propA] })
    ),
    []
  )
  return filterJoins
}