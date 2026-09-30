/**
 * Check whether any other record, in any entity, still has a single-field foreign key pointing
 * at entity.property = value - the mirror image of foreignKeyExists(), which checks the opposite
 * direction (that a new/updated foreign key value points at something real). Used to RESTRICT a
 * delete or update that would otherwise leave a dangling reference behind. Scans every record in
 * the database via the __RECORDS registry, the same "no index needed, just look" approach as
 * keyUnique()/foreignKeyExists() - correctness over speed, matching this project's overall scale.
 * @param entity
 * @param property
 * @param value
 */
export declare const hasDependents: (entity: string, property: string, value: any) => Promise<boolean>;
//# sourceMappingURL=hasDependents.d.ts.map