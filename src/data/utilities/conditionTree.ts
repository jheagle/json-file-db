import type { ParsedCondition } from './parsers/findConditions'

/**
 * A where clause as a tree: a condition, or `and` / `or` over several nodes, or `not` over one. `a and b and c` is one
 * `and` node with three children, not nested pairs.
 */
export type ConditionNode = ParsedCondition | { and: ConditionNode[] } | { or: ConditionNode[] } | { not: ConditionNode }

/**
 * Whether a node is a single condition rather than `and` / `or` / `not`.
 * @param node
 */
export const isCondition = (node: ConditionNode): node is ParsedCondition =>
  !('and' in node) && !('or' in node) && !('not' in node)

/**
 * The tree for conditions that must all match: none gives undefined (no where clause), one gives that condition itself,
 * several give one `and` node.
 * @param conditions
 */
export const allOf = (conditions: ConditionNode[]): ConditionNode | undefined => {
  if (!conditions.length) {
    return undefined
  }
  return conditions.length === 1 ? conditions[0] : { and: conditions }
}

/**
 * Every condition in the tree, in order, whatever group it is in.
 * @param node
 */
export const conditionsOf = (node: ConditionNode | undefined): ParsedCondition[] => {
  if (typeof node === 'undefined') {
    return []
  }
  if (isCondition(node)) {
    return [node]
  }
  if ('not' in node) {
    return conditionsOf(node.not)
  }
  return ('and' in node ? node.and : node.or).flatMap(conditionsOf)
}

/**
 * The conditions every matching row must meet on their own: the tree itself when it is one condition, or the
 * conditions directly under its top-level `and`. Only these may narrow the rows read through an index (an `or` or a
 * `not` doesn't require any one of its conditions).
 * @param node
 */
export const requiredConditions = (node: ConditionNode | undefined): ParsedCondition[] => {
  if (typeof node === 'undefined') {
    return []
  }
  if (isCondition(node)) {
    return [node]
  }
  return 'and' in node ? node.and.filter(isCondition) : []
}
