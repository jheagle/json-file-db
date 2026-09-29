/**
 * Validate (and where sensible, coerce) a value against a field's declared type. Runs only
 * against values being written by insertEntity/updateEntity - it never re-validates data already
 * on disk, so a field whose declared type doesn't match its already-stored values (which can
 * happen, since nothing enforced this before) is left alone until something actually updates it.
 * An unrecognized type name is treated as unconstrained rather than rejected, so a typo in a
 * schema's field type can't silently block every write to that field.
 * @param type
 * @param value
 */
export declare const typeCheck: (type?: string, value?: any) => any;
//# sourceMappingURL=typeCheck.d.ts.map