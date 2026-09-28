import { ParsedQuery } from './parseQuery';
export type ParsedCommand = string | 'delete' | 'insert' | 'read' | 'update';
export type ParsedEntity = string;
/**
 * Extract command clauses from the query.
 * @param parsed
 * @param query
 */
export declare const findCommand: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findCommand.d.ts.map