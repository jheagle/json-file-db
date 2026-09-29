/**
 * Check whether any record in the referenced entity has the given property set to the given
 * value - the mirror image of keyUnique(), which checks that no record already has a value.
 * @param entity
 * @param property
 * @param value
 */
export declare const foreignKeyExists: (entity: string, property: string, value: any) => Promise<boolean>;
//# sourceMappingURL=foreignKeyExists.d.ts.map