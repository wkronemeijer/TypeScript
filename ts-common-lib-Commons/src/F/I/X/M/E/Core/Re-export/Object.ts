import {deprecatedAlias} from "../Deprecated";

const {
    defineProperty, 
    defineProperties, 
    hasOwn: hasOwnProperty,
    create: createObject, 
    freeze: freezeObject, 
    assign: assignObject, 
    getPrototypeOf, 
    setPrototypeOf,
    getOwnPropertyDescriptor,
    getOwnPropertyNames: ownStringKeys,
    getOwnPropertySymbols: ownSymbolKeys,
    entries: ownStringProperties, 
    fromEntries: _fromEntries,
} = Object;

const {
    ownKeys,
    has: hasProperty,
    deleteProperty,
} = Reflect;

/** @deprecated use `createObject` instead */
const create = deprecatedAlias("create", createObject, "createObject");

/** @deprecated use `freezeObject` instead */
const freeze = deprecatedAlias("freeze", freezeObject, "freezeObject");

/** @deprecated use `assignObject` instead */
const assign = deprecatedAlias("assign", assignObject, "assignObject");

/** @deprecated use `assignObject` instead */
const entries = deprecatedAlias(
    "entries", ownStringProperties, "ownStringProperties",
);

/** @deprecated use `objectFromEntries` instead */
const fromEntries = deprecatedAlias(
    "fromEntries", _fromEntries, "Object.fromEntries",
);

export {
    create, 
    createObject,
    getPrototypeOf, 
    setPrototypeOf,
    defineProperty, 
    defineProperties, 
    deleteProperty,
    getOwnPropertyDescriptor,
    hasProperty, 
    hasOwnProperty, 
    ownKeys, 
    ownStringKeys, 
    ownSymbolKeys,
    ownStringProperties,
    assignObject,
    freezeObject,
    // @deprecated:
    fromEntries,
    entries, 
    assign, 
    freeze, 
};
