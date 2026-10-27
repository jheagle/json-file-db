import siFunciona from 'si-funciona'
import { readEntity } from './readEntity'
import { useJoinClause } from '../utilities/useJoinClause'

export const joinEntity = async (entity, joinEntity, dataSets = {}, joinClauses = [], entityAlreadyResolved = false, joinAlreadyResolved = false) => {
  // Same ambiguity readEntity() always has (can't tell "never loaded" from "loaded, zero rows
  // matched") - runQuery already resolved entity's rows via an indexed condition in that second
  // case, so entityAlreadyResolved tells this call not to reload and silently discard that result.
  if (!entityAlreadyResolved) {
    dataSets = await readEntity(entity, dataSets)
  }
  if (!joinClauses.length) {
    return dataSets
  }
  // The same for joinEntity: an indexed condition on its field may have resolved its rows to none
  if (!joinAlreadyResolved) {
    dataSets = await readEntity(joinEntity, dataSets)
  }
  for (const anEntity in dataSets[entity]) {
    let filterJoins = siFunciona.cloneObject(dataSets)
    filterJoins[entity] = [dataSets[entity][anEntity]]
    for (const joinClause of joinClauses) {
      filterJoins = await useJoinClause(joinClause, dataSets, filterJoins)
    }
    dataSets[entity][anEntity][joinEntity] = filterJoins[joinEntity]
  }
  return dataSets
}
