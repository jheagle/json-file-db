import { where } from '../queries/where'

export const reconcileJoin = (dataSet, entityName, entityKey, joinEntity, joinProp) => {
  const entity = dataSet[entityName][entityKey]
  if (entity.hasOwnProperty(joinEntity) && Array.isArray(entity[joinEntity])) {
    entity[joinEntity].forEach(
      (mergedEntity, k) => {
        const matchedEntity = where(
          dataSet[joinEntity],
          {
            property: joinProp,
            comparator: '=',
            value: mergedEntity[joinProp]
          }
        )
        if (matchedEntity.length) {
          dataSet[entityName][entityKey][joinEntity][k] = matchedEntity[0]
        }
      }
    )
  }
  return dataSet
}