import { create, defineProperty, entries, freeze } from "../../Re-export/Object";
import { Constructor } from "../../Types/Mixins";

// TODO: Immutable can totally be a mixin
// Use it on URL to make it resemebly `vscode.Uri`
// https://github.com/microsoft/TypeScript/issues/4881 
// Wait for when decorators can apply mixins, then try again
// Also include StringEnum 
// `StringEnum([...]).with({default: "123"})`
export class Immutable {
    constructor () {
        // TODO: Could we freeze objects when we are done?
        // Kind of like a bubbling phase to object initialization
        // setTimeout(() => freeze(this));
        // Would work, but also silly? Wasteful?
    }
    
    // https://stackoverflow.com/a/47657384
    // `Partial<this>` doesn't work, but `Pick<this, K>` does...
    // Pick loses intellisense, but still has appropriate type errors
    // Weird too because `this extends Point` at all times inside the function
    with<K extends keyof this>(newProps: Pick<this, K>): this {
        freeze(this); // Freeze the base so it can't change from under us
        const newThis = create(this);
        for (const [key, value] of entries(newProps)) {
            defineProperty(newThis, key, { 
                enumerable: true, 
                value,
            });
        }
        return newThis;
    }
}

function immutable<C extends Constructor>(
    base: C, 
    context: ClassDecoratorContext,
) {
    return class immutableImpl extends base {
        constructor(...args: any[]) {
            super(...args);
            
            // freeze(this)
            // Means all @immutable are final
            // ...which is not a strict requirement?
        }
        
        with<K extends keyof this>(newProps: Pick<this, K>): this {
            freeze(this); // freeze the base, so it can't change from under us
            const newThis = create(this);
            
            for (const [key, value] of entries(newProps)) {
                defineProperty(newThis, key, { 
                    enumerable: true, 
                    value,
                });
            }
            
            // assign(newThis, newProps);
            return newThis;
        }
    }
}
