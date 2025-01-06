const marked = new WeakSet;

/** Runs the given function only once per distinct marker. */
export function doOnce(marker: object, body: () => void): void {
    if (!marked.has(marker)) {
        body();
        marked.add(marker);
    }
}
