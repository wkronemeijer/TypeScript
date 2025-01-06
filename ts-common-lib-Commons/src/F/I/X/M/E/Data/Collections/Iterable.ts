const { from: toArray } = Array;

/** 
 * Converts a function that returns a generator, 
 * into one that returns an array of its yielded items. 
 * 
 * Also works for objects if you use the following:
 * 
 * @example
   class Book {
       // ...
       getNames = collect(function*(){
           yield  this.name;
           yield* this.aliases;
       });
   }
 */
export function collect<A extends readonly any[], R>(
    generator: (...args: A) => Iterable<R>
): (...args: A) => R[] {
    return function(this: unknown, ...args) {
        return toArray(generator.call(this, ...args))
    };
}
