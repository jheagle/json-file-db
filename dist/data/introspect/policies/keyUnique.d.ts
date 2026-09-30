/**
 * Check that no existing record already has this combination of values across all of the given
 * fields - a single field for a normal unique/primary key, or several for a composite one.
 * references and checkKeys are parallel arrays: references[i]'s value must equal checkKeys[i].
 * @param entity
 * @param references
 * @param checkKeys
 */
export declare const keyUnique: (entity: any, references?: any[], checkKeys?: any[]) => Promise<boolean>;
//# sourceMappingURL=keyUnique.d.ts.map