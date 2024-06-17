import { ParsedCommand, ParsedEntity } from './findCommand';
import { ParsedJoinEntity } from './findJoinEntity';
import { ParsedSelect } from './findSelects';
import { ParsedCondition } from './findConditions';
import { ParsedJoinClause } from './findJoinClauses';
import { ParsedMergeJoin } from './findMergeJoins';
import { ParsedSortClause } from './findSortClauses';
import { ParsedGroupBy } from './findGroupBy';
import { ParsedLimit } from './findLimit';
import { ParsedOffset } from './findOffset';
/**
 * @typedef {Object} ParsedQuery
 * @property {ParsedCommand|undefined} command
 * @property {ParsedEntity|undefined} entity
 * @property {ParsedJoinEntity|undefined} joinEntity
 * @property {Array<ParsedSelect>} selectClauses
 * @property {Array<ParsedCondition>} conditions
 * @property {Array<ParsedJoinClause>} joinClauses
 * @property {Array<ParsedMergeJoin>} mergeJoins
 * @property {Array<ParsedSortClause>} sortClauses
 * @property {ParsedGroupBy|undefined} groupBy
 * @property {ParsedLimit|undefined} limit
 * @property {ParsedOffset|undefined} offset
 */
export type ParsedQuery = {
    command: ParsedCommand | undefined;
    entity: ParsedEntity | undefined;
    joinEntity: ParsedJoinEntity | undefined;
    selectClauses: ParsedSelect[];
    conditions: ParsedCondition[];
    joinClauses: ParsedJoinClause[];
    mergeJoins: ParsedMergeJoin[];
    sortClauses: ParsedSortClause[];
    groupBy: ParsedGroupBy | undefined;
    limit: ParsedLimit | undefined;
    offset: ParsedOffset | undefined;
};
/**
 * Break a query down into its components.
 * @param {string} query
 * @returns {ParsedQuery}
 */
export declare const parseQuery: (query: string) => ParsedQuery;
