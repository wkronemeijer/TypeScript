// In one file because the alternative would require tons of @internal 
// Besides file length isn't even >200loc

import { create, defineProperty, entries } from "../Re-export/Object";
import { Json, parseJson, stringifyJson } from "./Json";
import { isObject, isString } from "../IsX";
import { RegExpNewtype } from "../Data/Nominal/RegExp";
import { Constructor } from "../Types/Mixins";
import { implies } from "../Data/Boolean";
import { swear } from "../Errors/Assert";
import { guard } from "../Exception";

// For the constructor
const SERIALIZABLE = Symbol("@@serializable");
const PROTOTYPE    = "prototype"   satisfies keyof Function;
const NAME         = "name"        satisfies keyof Function;

// For the saveable object
const CONSTRUCTOR  = "constructor" satisfies keyof Object;

// For the saved object
const TYPE  = "#isa#";
const VALUE = "#value#";

////////////////////////////
// SerializableIdentifier //
////////////////////////////

type  SerializableIdentifier = ReturnType<typeof SerializableIdentifier>;
const SerializableIdentifier = RegExpNewtype("SerializableIdentifier",
    /[A-Za-z0-9\$\_]+/
);

/////////////////////////////
// SerializableConstructor //
/////////////////////////////

interface SerializableInfo {
    readonly identifier: SerializableIdentifier;
    readonly dependencies: readonly Constructor[];
}

interface SerializableConstructor extends Constructor {
    readonly [SERIALIZABLE]: SerializableInfo
    readonly [PROTOTYPE]: object;
    readonly [NAME]: string;
}

function SerializableConstructor_hasInstance(value: unknown): value is SerializableConstructor {
    return (
        typeof value === "function" && // guarantees "name"
        PROTOTYPE     in value && isObject(value[PROTOTYPE]) && // arrow functions have no prototype
        SERIALIZABLE  in value && isObject(value[SERIALIZABLE])
    );
}

/////////////////
// SavedObject //
/////////////////

interface SavedObject {
    readonly [TYPE]: SerializableIdentifier;
    readonly [VALUE]: object;
}

function SavedObject_hasInstance(value: unknown): value is SavedObject {
    return (
        isObject(value) && 
        TYPE  in value && isString(value[TYPE]) &&
        VALUE in value && isObject(value[VALUE])
    );
}

////////////////////
// SaveableObject //
////////////////////

interface SaveableObject {
    readonly constructor: SerializableConstructor;
}

function SaveableObject_hasInstance(value: unknown): value is SaveableObject {
    return (
        isObject(value) && 
        CONSTRUCTOR in value && SerializableConstructor_hasInstance(value[CONSTRUCTOR])
    );
}

////////////////////////////
// Serializable attribute //
////////////////////////////

/** 
 * Marks a class as serializable.
 * 
 * Until esbuild supports decorators, you have to call this standalone.
 */
export function serializable(
    dependencies: readonly Constructor[] = []
): <F extends Constructor>(
    constructor: F, 
    context?: DecoratorContext,
) => F {
    return (self, _context) => {
        const identifier = SerializableIdentifier(self[NAME]);
        const info: SerializableInfo = { identifier, dependencies };
        defineProperty(self, SERIALIZABLE, {
            configurable: true,
            writable: true,
            value: info,
        });
        return self;
    }
}

//////////////////////////
// SerializableRegistry //
//////////////////////////

type     SerializableRegistry = ReadonlyMap<SerializableIdentifier, SerializableConstructor>;
function SerializableRegistry(root: Constructor): SerializableRegistry {
    const registry = new Map<SerializableIdentifier, SerializableConstructor>;
    (function recurse(constructor: Constructor) {
        swear(SerializableConstructor_hasInstance(constructor), () =>
            `${constructor.name} is not a serializable constructor.`
        );
        const id = constructor[SERIALIZABLE].identifier;
        swear(implies(registry.has(id), registry.get(id) === constructor), () => 
            `'${id}' is already in use.`
        );
        registry.set(id, constructor);
        for (const dep of constructor[SERIALIZABLE].dependencies) {
            recurse(dep);
        }
    }(root));
    return registry;
}

//////////////////////
// Public functions //
//////////////////////

export function serialize(root: unknown, space?: string | number): Json {
    return stringifyJson(root, (_key, value) => SaveableObject_hasInstance(value) ? {
        [TYPE]: value.constructor[SERIALIZABLE].identifier,
        [VALUE]: { ...value },
    } : value, space);
}

export function deserialize<F extends Constructor>(rootConstructor: F, json: string): InstanceType<F> {
    const registry = SerializableRegistry(rootConstructor);
    const value = parseJson(json, (_key, value) => {
        if (SavedObject_hasInstance(value)) {
            const id = value[TYPE];
            const constructor = registry.get(id);
            swear(constructor, () =>
                `Cannot revive unknown type '${id}'.`
            );
            const revivedObject = create(constructor.prototype) as object;
            for (const [storedKey, storedValue] of entries(value[VALUE])) {
                // Use defineProperty to avoid triggering setters
                defineProperty(revivedObject, storedKey, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: storedValue,
                });
            }
            return revivedObject;
        } else {
            return value;
        }
    });
    guard(value instanceof rootConstructor, () =>
        `Root object was not an instance of ${rootConstructor.name}`
    );
    return value;
}
