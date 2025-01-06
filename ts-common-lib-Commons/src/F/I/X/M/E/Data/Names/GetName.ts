import { keyof_t, typeof_withNull } from "../../Types/Primitive";
import { isObject } from "../../IsX";

const constructorKey         = "constructor";
const defaultConstructorName = ({}).constructor.name;

function tryGetFunctionName(object: object): string | undefined {
    if (typeof object === "function" && object.name) {
        return object.name;
    }
}

const possibleKeys: readonly keyof_t[] = [
    "name",
    "title",
    "key",
    "id",
    Symbol.toStringTag,
];

/** Retrieves a non-empty string using the given key. */
function tryNameLikeProperties(object: object): string | undefined {
    let value;
    
    for (const key of possibleKeys) {
        if (
            key in object && 
            (value = (object as any)[key]) && // <- filters out empty strings
            typeof value === "string"
        ) {
            return value;
        }
    }
}

/** Retrieves the name of the constructor of the given object, if it exists. */
function tryGetConstructorName(object: object): string | undefined {
    let constructor;
    
    if (
        constructorKey in object &&
        (constructor = object[constructorKey]) &&
        typeof constructor === "function"
    ) {
        if (constructor.name) {
            if (constructor.name !== defaultConstructorName) {
                return constructor.name;
            } else {
                return undefined;
            }
        } else {
            return "(anonymous constructor)";
        }
    }
}

/** 
 * Tries to retrieve the most "descriptive" name.  
 * It uses a number of heuristics.
 */
export function getDescriptiveName(value: unknown): string {
    let name;
    
    // Let's see how good control-flow typing is
    if (isObject(value) && (name = (
        tryGetFunctionName(value) ||
        tryNameLikeProperties(value) ||
        tryGetConstructorName(value)
    ))) {
        return name;
    }
    
    // "number", "null", "object", "string", etc.
    return typeof_withNull(value);
}

// This thing needs a better name...
// describe is already taken
