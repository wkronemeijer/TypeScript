// Limited interface for array, so you don't forget which combination is the best.

/** Interface limitation to force FIFO usage. */
export interface Queue<T> extends ReadonlyArray<T> {
    /** Add a new element to the queue. */
    push(element: T): void;
    /** Removes the first element from the queue and returns it. */    
    shift(): T | undefined;
}

const t_assignable: 
    Array<number> extends Queue<number> ? 
true : false = true;
