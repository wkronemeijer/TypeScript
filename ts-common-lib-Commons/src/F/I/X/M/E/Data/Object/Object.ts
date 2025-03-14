import {defineProperty, ownKeys} from "../../Re-export/Object";
import {panic} from "../../Errors/Panic";

/** Same as {@link Object.create}, but preserves type so you can use it for what prototypes were meant to do. */
export function Object_create<T extends object>(prototype: T, overwrite: Partial<T> = {}): T {
    return Object.assign(Object.create(prototype) as T, overwrite);
}

export function Object_explicitKeys<T extends object>(object: Record<keyof Required<T>, true>): (keyof T)[] {
    return Object.keys(object) as any;
}

// Based on https://humanwhocodes.com/blog/2021/04/lazy-loading-property-pattern-javascript/
/** Efficiently defines a lazy property on the given constructor. Property will be non-enumerable.
 * 
 * Example usage:
 * 
 *      class Foo { 
 *          leopard!: number;
 *          constructor(public readonly lion: number) {}
 *      }
 *      
 *      Object_defineLazyProperty(Foo, "leopard", function(){ 
 *          return this.lion ** 2;
 *      });
 */
export function Object_defineLazyProperty<
    C extends new(...args: any[]) => any,
    O extends InstanceType<C>,
    K extends keyof O,
>(
    constructor: C, 
    property: K,
    initializer: (this: O, property: K) => O[K],
): void {
    // Not enumerable, because prototype properties don't show up in object spreads anyway
    // Which would make it showing up after 1 access unintuitive. 
    Object.defineProperty(constructor.prototype, property, {
        get() {
            const value: O[K] = initializer.call(this, property);
            Object.defineProperty(this, property, { 
                value, 
            });
            return value;
        },
        configurable: true,
    });
}

interface Object_defineWriteOnceProperty_Options {
    /** Makes the property return undefined, instead of throwing an error on access before init. Note that you **must** mark the property with `| undefined`, otherwise your code will be unsound. */
    accessBeforeInit?: boolean;
}

// Decorators are still fucked as of this moment (Feb 2023)
/** Efficiently defines a write-once property on the given constructor. Property will be enumerable.
 * 
 * Example usage:
 * 
 *      class Foo { 
 *          leopard!: number;
 *      }
 *      
 *      Object_defineWriteOnceProperty(Foo, "leopard");
 */
export function Object_defineWriteOnceProperty<
    C extends new(...args: any[]) => any,
    O extends InstanceType<C>,
    K extends keyof O,
>(
    constructor: C, 
    property: K,
    options?: Object_defineWriteOnceProperty_Options,
): void {
    const accessBeforeInit = options?.accessBeforeInit ?? false;
    
    Object.defineProperty(constructor.prototype, property, {
        get() {
            if (!accessBeforeInit) {
                panic(`Access before initialization of '${constructor.name}.${String(property)}'.`);
            } else {
                return undefined;
            }
        },
        set(value) {
            Object.defineProperty(this, property, {
                value,
                enumerable: true,
            });
        },
        configurable: true,
    });
}

/** Wraps {@link Object.entries}, but returns `unknown` instead. */
export const Object_entries: (object: {}) => [string, unknown][] = Object.entries;
/** Wraps {@link Object.values}, but returns `unknown` instead. */
export const Object_values : (object: {}) => unknown[] = Object.values;

///////////////////////////////
// Prototype property helper //
///////////////////////////////

interface PropertyValueMap {
    readonly [s: string | symbol]: unknown;
}

/** 
 * Similar to methods defined in a `class` expression/statement, 
 * this function defines configurable, non-enumerable, writable properties 
 * with the name and value based on the given map.
 * 
 * Supports both string and symbol-keyed properties.
 */
export function definePropertiesOnPrototype(
    target: object, 
    valueMap: PropertyValueMap,
) {
    for (const key of ownKeys(valueMap)) {
        defineProperty(target, key, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: valueMap[key],
        });
    }
}

export function defineLazyProperty<T, K extends keyof T>(target: T, key: K, initializer: () => T[K]) {
    const configurable = true;
    const enumerable = true;
    const writable = true;
    
    function set(value: T[K]): void {
        defineProperty(target, key, {
            configurable,
            enumerable,
            writable,
            value,
        });
    }
    
    function get(): T[K] {
        const value = initializer();
        set(value);
        return value;
    }
    
    defineProperty(target, key, {
        configurable,
        enumerable,
        get,
        set,
    });
}
