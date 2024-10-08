import {Newtype} from "../Data/Nominal/Newtype";
const {stringify, parse} = JSON;

export type JsonArray  = readonly JsonValue[];
export type JsonObject = {readonly [s: string]: JsonValue};
export type JsonValue  = (
    | null
    | boolean
    | number
    | string
    | JsonArray
    | JsonObject
);

// Note: these /can/ appear in the input, but never in the output.
export interface JsonStringifyableObject {
    toJSON(): JsonValue;
}

export type JsonInputValue = (
    | JsonValue 
    | JsonStringifyableObject
);

export type JsonOutputValue = JsonValue;

export type Json = Newtype<string, "Json">;

export interface JsonReplacer {
    (this: object, key: string, value: unknown): unknown;
}

// Expects T to implement an index signature (which is really silly)
// https://github.com/microsoft/TypeScript/issues/15300
// If you use `type` instead of `interface` it does work
// ???

export function stringifyJson(value: unknown, replacer?: JsonReplacer, space?: string | number): Json {
    return stringify(value, replacer, space) as Json;
}

export interface JsonReviver {
    (this: object, key: string, value: unknown): unknown;
}

export function parseJson(json: string                       ): JsonValue;
export function parseJson(json: string, reviver : JsonReviver): unknown;
export function parseJson(json: string, reviver?: JsonReviver): unknown {
    return parse(json, reviver);
}
