export declare const key: ({ type, references, autoGenerate }?: {
    type?: string;
    references?: any[];
    autoGenerate?: boolean;
}) => {
    type: "index" | "primary" | "unique" | "multi" | "foreign";
    references: any[];
    autoGenerate: boolean;
};
