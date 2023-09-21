
// from https://mariusschulz.com/blog/mixin-classes-in-typescript
// Thanks, Marius!
/** Generic shape of constructor of T instances. */
export type Constructor<T = any> = new (...args: any[]) => any;

// Mixins don't like extending null, so we add 1 layer of indirection.
/** A object type with no members. Useful for mixins. */
export class Null extends null { }

/**
 * A class with no properties or methods.
 * 
 * Useful as a root class for mixins.
 */
export class Any {}
