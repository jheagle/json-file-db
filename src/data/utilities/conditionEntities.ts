import { ParsedQuery } from './parsers/parseQuery'
import { isEntityProperty } from './parsers/isEntityProperty'
import { splitEntityProperty } from './parsers/splitEntityProperty'
import { conditionsOf } from './conditionTree'

/**
 * Check which entity each condition's field is on, before anything is read, and say whether the where clause has to be
 * evaluated per pair of a row and one of its joined rows:
 * - the queried entity (`workouts.date`): written as the plain field (`date`), which is where the row holds it
 * - the joined entity (`read workouts.exercises on ...`, `exercises.name`): per pair (see whereTree), so returns true
 * - an entity merged into the rows or the joined rows (`merge workouts.exercise_id with exercises._id`): read from the
 *   merged fields (`exercises.name` on the row), as before
 * - anything else is an error: an entity that only links the join (`exercise_muscle` in `workouts.muscles`), or one
 *   that isn't in the query at all (these used to match nothing, or fail to read the entity)
 *
 * update and delete apply their conditions before any join or merge runs, so they only take the entity's own fields.
 * (An indexed joined-field condition used to be dropped once its index had narrowed the joined rows, so the command hit
 * every row the other conditions allowed: `delete workouts.exercises on ... where exercises._id = 1` deleted every
 * workout. Refused since #79.)
 * @param parsed - its conditions on the queried entity lose their `entity.` prefix
 * @throws {Error} For a condition on a field the query can't check
 */
export const conditionEntities = (parsed: ParsedQuery): boolean => {
  const entity = parsed.entity
  const joinEntity = parsed.joinClauses.length ? parsed.joinEntity : undefined
  const joined = new Set([entity, joinEntity])
  const merged = new Set(parsed.mergeJoins
    .filter(merge => joined.has(splitEntityProperty(merge.propertyA).entity))
    .map(merge => splitEntityProperty(merge.propertyB).entity))
  const linking = new Set(parsed.joinClauses
    .flatMap(clause => [clause.propertyA, clause.propertyB].map(property => splitEntityProperty(property).entity))
    .filter(name => !joined.has(name) && !merged.has(name)))
  const changes = parsed.command === 'update' || parsed.command === 'delete'
  let perPair = false
  for (const condition of conditionsOf(parsed.where)) {
    if (!isEntityProperty(condition.property)) {
      continue
    }
    const { entity: fieldEntity, property } = splitEntityProperty(condition.property)
    if (fieldEntity === entity) {
      condition.property = property
      continue
    }
    if (changes) {
      throw new Error(`${parsed.command} can only use conditions on ${entity}'s own fields, not ${condition.property}`)
    }
    if (fieldEntity === joinEntity) {
      perPair = true
      continue
    }
    if (merged.has(fieldEntity)) {
      continue
    }
    if (linking.has(fieldEntity)) {
      throw new Error(`${fieldEntity} only links ${entity} to ${joinEntity}: a condition can't use its fields (${condition.property})`)
    }
    const usable = [entity, joinEntity, ...merged].filter(name => typeof name !== 'undefined').join(', ')
    throw new Error(`${fieldEntity} is not part of this query (${condition.property}): conditions can use the fields of ${usable}`)
  }
  return perPair
}
