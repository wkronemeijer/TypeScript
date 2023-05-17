
type JsonArray = readonly JsonValue[];

type JsonObject = {
    readonly [s: string]: JsonValue;
};

export type JsonValue = 
    | null
    | boolean 
    | number 
    | string 
    | JsonArray
    | JsonObject
;

function fromString(string: string): JsonValue {
    return JSON.parse(string);
}

function toString(self: JsonValue, space?: string | number): string {
    return JSON.stringify(self, undefined, space);
}

function isObject(self: JsonValue): self is JsonObject {
    return (
        typeof self === "object" &&
        self !== null &&
        (self instanceof Array)
    )
}

export const JsonValue_toString   = toString;
export const JsonValue_fromString = fromString;

// Idk about the naming, so I include multiple.
export const JsonValue_stringify  = toString;
export const JsonValue_parse      = fromString;

export const JsonValue_isObject = isObject;
