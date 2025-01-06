const marked = new WeakSet;

/** Runs the given function only once per distinct marker. */
export function doOnce(marker: object, body: () => void): void {
    if (!marked.has(marker)) {
        body();
        marked.add(marker);
    }
    /*
    DESIGN NOTE:
    Originally this had a result parameter R which it would store in a WeakMap
    But the same marker /can/ be re-used, so you cannot guarantee 
    that it is the right type.
    */
}
