export type fieldName = string;
export type fieldDefinition = {
    name: fieldName;
    type: string;
    optional: boolean;
    default?: any;
    autoGenerate: boolean;
};
export type fieldProperties = {
    name?: string;
    type?: string;
    optional?: boolean;
    useDefault?: boolean;
    defaultValue?: any;
    autoGenerate?: boolean;
};
/**
 * Generate a field for a record.
 * @param properties
 * @param properties.name
 * @param properties.type
 * @param properties.optional
 * @param properties.useDefault
 * @param properties.defaultValue
 * @param properties.autoGenerate
 */
export declare const field: ({ name, type, optional, useDefault, defaultValue, autoGenerate }?: fieldProperties) => fieldDefinition;
//# sourceMappingURL=field.d.ts.map