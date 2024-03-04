// TODO: Should we rename this to Mut<T>?
/** Makes all properties in T writable. */
export type ReadWrite<T> = {
    -readonly [P in keyof T]: T[P];
};
