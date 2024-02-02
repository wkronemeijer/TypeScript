const {
    create, 
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

export {
    create, 
    getPrototypeOf, setPrototypeOf,
    
    defineProperty, defineProperties, deleteProperty,
    getOwnPropertyDescriptor,
    hasProperty, hasOwnProperty, 
    ownKeys, ownStringKeys, ownSymbolKeys,
    entries, fromEntries,
    
    assign, 
    freeze, 
};
