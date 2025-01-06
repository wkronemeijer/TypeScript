// Small scale serialization and deserialization library
// Overall idea is for classes to register
// Custom implementation can store any kind of value 

import {assignObject, createObject, defineProperty} from "../Re-export/Object";
import {Json, parseJson, stringifyJson} from "./Json";
import {isFunction, isObject, isString} from "../IsX";
import {RegExpNewtype} from "../Data/Nominal/RegExp";
import {Constructor} from "../Types/Mixins";
import {swear} from "../Errors/Assert";
import {guard} from "../Exception";
import {panic} from "../Errors/Panic";

// For the constructor
const SERIALIZABLE_INFO = Symbol("serializable");
const PROTOTYPE         = "prototype"   satisfies keyof Function;
const NAME              = "name"        satisfies keyof Function;

// For the saveable object
const CONSTRUCTOR  = "constructor" satisfies keyof Object;

// For the saved object
// NOTE: Saved object is like a stored call
// Stored call for revive actually lol
const CONSTRUCTOR_ID  = "<is>";
const CONSTRUCTOR_ARG = "<value>";

////////////////////////////
// SerializableIdentifier //
////////////////////////////

type  QualifiedName = ReturnType<typeof QualifiedName>;
const QualifiedName = RegExpNewtype("QualifiedName",
    /^[A-Za-z0-9\$\_\.:]+$/
);

/////////////////////////////
// SerializableConstructor //
/////////////////////////////

type ReplaceFunction<TLive extends object, TInert> = ( value:  TLive, info: SerializableConstructorInfo) => TInert;
type  ReviveFunction<TLive extends object, TInert> = (stored: TInert, info: SerializableConstructorInfo) => TLive;

interface SerializableConstructorInfo {
    readonly id: QualifiedName;
    readonly constructor: Constructor;
    readonly dependencies: readonly SerializableConstructor[];
    
    replace: ReplaceFunction<any, any>;
    revive :  ReviveFunction<any, any>;
}

interface SerializableConstructor extends Constructor {
    readonly [SERIALIZABLE_INFO]: SerializableConstructorInfo
    readonly [PROTOTYPE]: object;
    readonly [NAME]: string;
}

function isSerializableConstructor(value: unknown): value is SerializableConstructor {
    return (
        isFunction(value) && // guarantees "name" 
        PROTOTYPE          in value && isObject(value[PROTOTYPE]) && // arrow functions have no prototype
        SERIALIZABLE_INFO  in value && isObject(value[SERIALIZABLE_INFO])
    );
}

function markSerializableConstructor(info: SerializableConstructorInfo): void {
    defineProperty(info.constructor, SERIALIZABLE_INFO, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: info,
    });
}

////////////////////
// SaveableObject //
////////////////////

interface SerializableObject {
    readonly [CONSTRUCTOR]: SerializableConstructor;
}

function isSerializableObject(value: unknown): value is SerializableObject {
    return (
        isObject(value) && 
        CONSTRUCTOR in value && isSerializableConstructor(value[CONSTRUCTOR])
    );
}

/////////////////
// SavedObject //
/////////////////

interface StoredInstance {
    readonly [CONSTRUCTOR_ID]: QualifiedName;
    readonly [CONSTRUCTOR_ARG]: unknown;
}

function isStoredInstance(value: unknown): value is StoredInstance {
    return (
        isObject(value) && 
        CONSTRUCTOR_ID  in value && isString(value[CONSTRUCTOR_ID]) &&
        CONSTRUCTOR_ARG in value && isObject(value[CONSTRUCTOR_ARG])
    );
}

////////////////////////////
// Serializable attribute //
////////////////////////////

const defaultReplace: ReplaceFunction<object, unknown> = (
    value: object, 
    _: SerializableConstructorInfo,
): unknown => {
    return {...value}; // copies own, enumerable properties
}

const defaultRevive: ReviveFunction<object, unknown> = (
    saved: unknown, 
    {constructor}: SerializableConstructorInfo,
): object => {
    guard(typeof saved === "object", "expected saved object");
    return assignObject(createObject(constructor.prototype) as object, saved);
}

// Synonym for readability
export function markSerializable<TLive extends object, TInert>(
    constructor: new(...args: any[]) => TLive, 
    options: {
        readonly id?: string;
        readonly dependencies?: Iterable<Constructor>;
        readonly replace?: ReplaceFunction<TLive, TInert>;
        readonly revive?: ReviveFunction<TLive, TInert>;
    } = {},
): void {
    const {
        id: rawId,
        dependencies: [...rawDependencies] = [],
        replace = defaultReplace,
        revive = defaultRevive,
    } = options;
    
    const id = QualifiedName(rawId ?? constructor[NAME]);
    const dependencies = rawDependencies.filter(isSerializableConstructor);
    
    swear(dependencies.length === rawDependencies.length, () =>
        `all dependencies must be serializable`
    );
    
    markSerializableConstructor({
        id,
        constructor,
        dependencies,
        replace,
        revive,
    });
}

///////////////
// Decorator //
///////////////

interface serializable_Options {
    readonly dependencies?: readonly Constructor[];
}

type ConstructorDecorator = <F extends Constructor>(constructor: F, context?: DecoratorContext) => F;

/** Decorator to mark a class as serializable. */
export function serializable(): ConstructorDecorator;
/** Decorator to mark a class as serializable. */
export function serializable(options?: serializable_Options): ConstructorDecorator;
/** Decorator to mark a class as serializable. */
export function serializable(dependencies?: readonly Constructor[]): ConstructorDecorator;
// Implementation
export function serializable(arg?: serializable_Options | readonly Constructor[] | undefined): ConstructorDecorator {
    const dependencies: readonly Constructor[] = (
        arg === undefined ? [] :
        arg instanceof Array ? arg :
        arg.dependencies ??
        []
    );
    return (self, _) => {
        markSerializable(self, {dependencies});
        return self;
    }
}

////////////////////////////
// Built-in serializables //
////////////////////////////

// (Array is handled by JSON automatically) 

markSerializable(Map, {
    replace: map => [...map],
    revive: iter => new Map(iter),
});

markSerializable(Set, {
    replace: set => [...set],
    revive: iter => new Set(iter),
});

markSerializable(Date, {
    replace: date => date.valueOf(),
    revive: timeStamp => new Date(timeStamp),
});

//////////////////////////
// SerializableRegistry //
//////////////////////////

class SerializableRegistry {
    private readonly store = new Map<QualifiedName, SerializableConstructor>;
    
    register(constructor: SerializableConstructor): void {
        const id = constructor[SERIALIZABLE_INFO].id;
        const registered = this.store.get(id);
        if (registered !== undefined) {
            if (registered === constructor) {
                // ok
            } else {
                panic(`id '${id}' is already in use`);
            }
        } else {
            this.store.set(id, constructor);
        }
    }
    
    get(id: QualifiedName): SerializableConstructor | undefined {
        return this.store.get(id);
    }
}

function createSerializableRegistry(root: SerializableConstructor): SerializableRegistry {
    const registry = new SerializableRegistry;
    const visited = new WeakSet<SerializableConstructor>;
    (function recurse(constructor: SerializableConstructor) {
        // Prevent loops
        if (visited.has(constructor)) {return}
        visited.add(constructor);
        
        // Register
        registry.register(constructor);
        
        // Recurse
        for (const dep of constructor[SERIALIZABLE_INFO].dependencies) {
            recurse(dep);
        }
    }(root));
    return registry;
}

let ContextualRegistry: SerializableRegistry | undefined;

//////////////////////
// Public functions //
//////////////////////

const globalReplacer = (_: string, value: unknown): unknown => {
    if (isSerializableObject(value)) {
        const info = value.constructor[SERIALIZABLE_INFO];
        return {
            [CONSTRUCTOR_ID]: info.id,
            [CONSTRUCTOR_ARG]: (0, info.replace)(value, info),
        }
    } else {
        return value;
    }
};

export function serialize(root: unknown, space?: string | number): Json {
    return stringifyJson(root, globalReplacer, space);
}

const globalRevive = (_: string, value: unknown): unknown => {
    if (isStoredInstance(value)) {
        const id = value[CONSTRUCTOR_ID];
        const constructor = ContextualRegistry?.get(id);
        guard(constructor, () => 
            `cannot revive unregistered type '${id}'`
        );
        const info     = constructor[SERIALIZABLE_INFO];
        const argument = value[CONSTRUCTOR_ARG];
        // Give info as second object?
        return (0, info.revive)(argument, info);
    } else {
        return value;
    }
};

export function deserialize<F extends Constructor>(rootConstructor: F, json: string): InstanceType<F> {
    const previousRegistry = ContextualRegistry;
    try {
        guard(isSerializableConstructor(rootConstructor), () => 
            `root constructor '${rootConstructor}' must be serializable`
        );
        ContextualRegistry = createSerializableRegistry(rootConstructor);
        const value = parseJson(json, globalRevive);
        guard(value instanceof rootConstructor, () =>
            `root object was not an instance of ${rootConstructor.name}`
        );
        return value as InstanceType<typeof rootConstructor>; // ??? no idea why TS fails here
    } finally {
        ContextualRegistry = previousRegistry;
    }
}
