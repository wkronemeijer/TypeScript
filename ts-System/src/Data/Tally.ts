// Dumb object to keep track of tallies.
// Useless? Quite, but nicer if implemented this way.

import { primitive_t } from "../Types/Primitive";

/** Counts the number of occurences of various primitive values. */
export class Tally<T extends primitive_t> {
    private readonly tally = new Map<T, number>();
    
    /** Increments the tally for the specified item. */
    public add(item: T): void {
        this.tally.set(item, this.count(item) + 1);
    }
    
    /** Reads the tally for the specified item. */
    public count(item: T): number {
        return this.tally.get(item) ?? 0;
    }
    
    /** Clears the tally. */
    public clear() {
        this.tally.clear();
    }
}

/////////////
// Testing //
/////////////

// Can't test, because testing uses this file :X
// Lmfao, this is where the .spec file comes in. 
