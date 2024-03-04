/**
 * A function that when called, undoes the subscription.
 * Used by things like `EventEmitter.on` or `useEffect`.
 */

export interface Unsubscribe {
    (): void;
}
