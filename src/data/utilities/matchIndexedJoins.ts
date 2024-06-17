import siFunciona from 'si-funciona'
import { where } from '../queries/where'
import { retrieveFile } from './retrieveFile'
import { splitEntityProperty } from './parsers/splitEntityProperty'

export const matchIndexedJoins = (entity, indexedClone, dataSets) => async (focusEntity, property, recordData, joinClause, filterJoins, indexed) => {
  const { entity: entityA, property: propertyA } = splitEntityProperty(joinClause.propertyA)
  const { entity: entityB, property: propertyB } = splitEntityProperty(joinClause.propertyB)
  const properties = [
    { entityFirst: entityA, propertyFirst: propertyA, entitySecond: entityB, propertySecond: propertyB },
    { entityFirst: entityB, propertyFirst: propertyB, entitySecond: entityA, propertySecond: propertyA },
  ]
  for (let checkProp of properties) {
    if (!indexedClone.hasOwnProperty(checkProp.entitySecond)) {
      indexedClone[checkProp.entitySecond] = siFunciona.cloneObject(indexed[checkProp.entitySecond])
    }
    const matchedRecords = indexedClone[checkProp.entitySecond][checkProp.propertySecond].reduce(
      (dataA, dataB) => siFunciona.mergeArrays(
        dataA,
        where(indexedClone[checkProp.entityFirst][checkProp.propertyFirst], {
          property: 'value',
          comparator: joinClause.comparator,
          value: dataB.value
        })
      ),
      []
    )
    let skipPush = checkProp.entityFirst === entity
    if (!dataSets.hasOwnProperty(checkProp.entityFirst)) {
      dataSets[checkProp.entityFirst] = []
    }
    for (let matchedRecord of matchedRecords) {
      for (let file of matchedRecord.record) {
        let entityRecord = file
        if (typeof file === 'string') {
          entityRecord = await retrieveFile(`${checkProp.entityFirst}/${file}`)
        }
        if (!skipPush) {
          dataSets[checkProp.entityFirst].push(entityRecord)
        }
        filterJoins[checkProp.entityFirst].push(entityRecord)
      }
    }
  }
}