export declare const field: ({ name, type, optional, useDefault, defaultValue, keys }?: {
    name?: string;
    type?: string;
    optional?: boolean;
    useDefault?: boolean;
    defaultValue?: string;
    keys?: any[];
}) => {
    name: string;
    type: string;
    optional: boolean;
    keys: {
        type: "index" | "primary" | "unique" | "multi" | "foreign";
        references: any[];
        autoGenerate: boolean;
    }[];
};
