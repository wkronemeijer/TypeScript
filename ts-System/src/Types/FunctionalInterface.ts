/*
We need a T that contains a method M that is a function, of which we want to extract the length.
T depends M, so T must come "at" or "after" M, not before in the parameters.
TypeScript does not allow you to specify some parameters but infer others,
so the factory must be curried to allow type inference to happen.

If we could, it would be specified as taking an option argument, with the following properties:
- methodName: K;
- ofInterface: type(T)
- methodLength: Parameters<T[K]>["length"];
*/

// TODO: This type is messy.
// Is there a better way to describe a functional interface?
// i.e. an interface with 1 method member.
type FunctionalInterface<MethodName extends string> = {
    [_ in MethodName]: (...args: any[]) => any;
};

type MethodLength<T extends FunctionalInterface<K>, K extends string> = Parameters<T[K]>["length"];

export const FunctionalInterface_createTypeGuard: 
    <MethodName  extends string                         >(methodName  : MethodName                           ) => 
    <MethodOwner extends FunctionalInterface<MethodName>>(methodLength: MethodLength<MethodOwner, MethodName>) => 
    (value: unknown) => value is MethodOwner 
= 
    <K extends string>(methodName: K) => 
    <T extends FunctionalInterface<K>>(methodLength: MethodLength<T, K>) => 
    (value: unknown): value is T => 
(
    typeof value === "object" &&
    value !== null &&
    methodName in value &&
    typeof (value as T)[methodName] === "function" &&
    (value as T)[methodName].length === methodLength
);
