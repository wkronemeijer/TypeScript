import { Comparable } from "./Comparable";
import { Ordering } from "./Ordering";
import { compare } from "./Compare";
import { panic } from "../../Errors/ErrorFunctions";

// Why not under compare?
// The namespace trick doesn't work if you re-assign the variable
// And since compare and compareAny are literally the same function...

const { Less, Equal, Greater } = Ordering;

export function compareIterable<T extends Comparable>(
    as: Iterable<T>,
    bs: Iterable<T>
): Ordering {
    const iterA = as[Symbol.iterator]();
    const iterB = bs[Symbol.iterator]();
    
    let resultA: IteratorResult<T>;
    let resultB: IteratorResult<T>;
    let ordering: Ordering;
    while (true) {
        resultA = iterA.next();
        resultB = iterB.next();
        
        if (!resultA.done && !resultB.done) {
            if (ordering = compare(resultA.value, resultB.value)) {
                return ordering;
            } else {
                continue;
            }
        } else if (resultA.done && resultB.done) { // both complete
            return Equal;
        } else if (resultA.done) { // i.e. sequence a is shorter
            return Less;
        } else if (resultB.done) { // i.e. sequence b is shorter
            return Greater;
        } else {
            panic();
        }
    }
}
