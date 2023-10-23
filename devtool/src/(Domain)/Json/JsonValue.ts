export type JsonValue = (
    | null 
    | boolean 
    | number 
    | string 
    | JsonArray 
    | JsonObject
);

export type JsonArray = readonly JsonValue[];
export type JsonObject = { readonly [s: string]: JsonValue; };
