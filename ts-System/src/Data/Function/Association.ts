import { Getter, Setter } from "./[GS]etter";
import { swear } from "../../Assert";

/**
 * Creates a associative, non-commutative function.
 * A "tuple extension" of weak map.
 * 
 * Commonly changing parameters should be to the left, 
 * and more "constant" parameters to the right.
 */
export function createAssociation<TParams extends object[], TResult>(
    initialize: (...args: TParams) => TResult
): [
    getter: Getter<TParams, TResult>,
    setter: Setter<TParams, TResult>,
] {
    swear(initialize.length >= 1, "initializer must have atleast 1 argument.");
    const count       = initialize.length;
    const setterCount = count + 1;
    
    function findParent(args: TParams) {
        
    }
    
    const root = new WeakMap;
    
    const getter = (...args: TParams): TResult => {
        let cursor, innerMap; 
        swear(args.length === count);
        
        
        
        cursor = root;
        for (let i = 0; i < count; i++) {
            const key = args[i]!;
            if (!(innerMap = cursor.get(key))) {
                cursor.set(key, innerMap = new WeakMap);
            }
            cursor = innerMap;
        }
        
        return cursor
    }
    
    const setter = (...args: [...TParams, TResult]): void => {
        if (args.length !== setterCount) {
            
        }
    }
    
    return [getter, setter];
}
