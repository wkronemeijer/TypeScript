const {
    create: createObject, 
    defineProperty, defineProperties, hasOwn: hasOwnProperty,
    freeze, 
    assign, entries, fromEntries,
    getPrototypeOf, setPrototypeOf,
    getOwnPropertyDescriptor,
    
    getOwnPropertyNames: ownStringKeys,
    getOwnPropertySymbols: ownSymbolKeys,
} = Object;

const {
    ownKeys,
    has: hasProperty,
    deleteProperty,
} = Reflect;

/**
 * @deprecated use `createObject` instead, it is less ambiguous
 */
const create = createObject;

export {
    create, createObject,
    getPrototypeOf, setPrototypeOf,
    
    defineProperty, defineProperties, deleteProperty,
    getOwnPropertyDescriptor,
    hasProperty, hasOwnProperty, 
    ownKeys, ownStringKeys, ownSymbolKeys,
    entries, fromEntries,
    
    assign, 
    freeze, 
};
