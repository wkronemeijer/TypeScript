const {
    create: createObject, 
    defineProperty, defineProperties, hasOwn: hasOwnProperty,
    freeze: freezeObject, 
    assign: assignObject, 
    entries, 
    fromEntries: objectFromEntries,
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

/** @deprecated use `createObject` instead */
const create = createObject;

/** @deprecated use `freezeObject` instead */
const freeze = freezeObject;

/** @deprecated use `assignObject` instead */
const assign = assignObject;

/** @deprecated use `objectFromEntries` instead */
const fromEntries = objectFromEntries;

export {
    create, createObject,
    getPrototypeOf, setPrototypeOf,
    
    defineProperty, defineProperties, deleteProperty,
    getOwnPropertyDescriptor,
    hasProperty, hasOwnProperty, 
    ownKeys, ownStringKeys, ownSymbolKeys,
    entries, 
    
    fromEntries, objectFromEntries,
    assign, assignObject,
    freeze, freezeObject,
};
