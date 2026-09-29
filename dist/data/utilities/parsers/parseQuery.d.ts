import { ParsedCommand, ParsedEntity } from './findCommand';
import { ParsedInsertRow } from './findInsertValues';
import { ParsedUpdateValues } from './findUpdateValues';
import { ParsedJoinEntity } from './findJoinEntity';
import { ParsedSelect } from './findSelects';
import { ParsedCondition } from './findConditions';
import { ParsedJoinClause } from './findJoinClauses';
import { ParsedMergeJoin } from './findMergeJoins';
import { ParsedSortClause } from './findSortClauses';
import { ParsedGroupBy } from './findGroupBy';
import { ParsedLimit } from './findLimit';
import { ParsedOffset } from './findOffset';
export type ParsedQuery = {
    command: ParsedCommand | undefined;
    entity: ParsedEntity | undefined;
    joinEntity: ParsedJoinEntity | undefined;
    selectClauses: ParsedSelect[];
    insertValues: ParsedInsertRow[];
    updateValues: ParsedUpdateValues;
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
 * @param query
 */
export declare const parseQuery: (query: string) => ParsedQuery;
//# sourceMappingURL=parseQuery.d.ts.map