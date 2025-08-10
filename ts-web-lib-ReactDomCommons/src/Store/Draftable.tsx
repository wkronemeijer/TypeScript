// My own React State Management Solution

import {ReactNode, Context, Dispatch, SetStateAction, createContext, useContext, useSyncExternalStore, useRef, useCallback, useLayoutEffect} from "react";
import {createDraft, finishDraft, freeze, isDraftable} from "immer";

//////////////////
// Helper types //
//////////////////

type Selector<T, U> = (value: T) => U;

type Unsubscribe = () => void;

type AnyFunc = (...args: any[]) => any;

export type OnlyMethods<T> = {
    // NB: Does not erase receiver type
    readonly [P in keyof T as T[P] extends AnyFunc ? P : never]: T[P];
}

type SetStatePair<T> = [T, Dispatch<SetStateAction<T>>];

/////////////////
// Store Types //
/////////////////

/** Contains the implementation of the Store trait. */
interface StoreConstructor<T> {
    readonly name: string;
    new(...args: never[]): T;
}

type StoreDispatch<T> = (mutator: (draft: T) => void) => void;

/** Specific instance created using a store impl. */
interface StoreInstance<T> {
    /** AKA `queueMutator` */
    readonly dispatch: StoreDispatch<T>;
    readonly getState: () => T;
    readonly subscribe: (onStoreChange: () => void) => Unsubscribe;
}

const $context     = Symbol("context");
const $constructor = Symbol("constructor");

/** 
 * Bundles context and impl for access at runtime. 
 * 
 * Many of these functions are best renamed and 
 * exported for use by various components.
 */
export interface Store<T> {
    readonly [$context]: Context<StoreInstance<T> | null>;
    readonly [$constructor]: StoreConstructor<T>;
    
    /** 
     * Manually dispatch mutations. 
     * 
     * Is React-stable. 
     */
    readonly useDispatch: () => StoreDispatch<T>;
    
    /** Access a projection of the state. 
     * 
     * **NB**: 
     * Be careful closing over local parameters in the selector function.
     * This can cause "stale props", 
     * which in turn can cause issues, e.g. when shrinking a list.
     */
    readonly useSelector: <const U>(selector: Selector<T, U>) => U;
    
    /** Access a projection of the state as a useState pair.
     * 
     * **NB**: 
     * Be careful closing over local parameters in the selector function.
     * This can cause "stale props", 
     * which in turn can cause issues, e.g. when shrinking a list.
    */
    readonly useSelectorState: (
        <const U                >(selector: Selector<T, U>) => 
        <const K extends keyof U>(key: K) => 
        SetStatePair<U[K]>
    );
    // Curried for better type inference
    
    /** 
     * Uses a proxy to wrap {@link useDispatch} usage. Stable down to 1 layer.
     * 
     * Important usage restrictions:
     * - Never destructure more than 1 layer.
     */
    readonly useReceiver: <const U>(selector: Selector<T, U>) => OnlyMethods<U>;
    
    /** 
     * Uses a proxy to reduce the amount of {@link useSelector} boilerplate.
     * 
     * Important usage restrictions:
     * - Always destructure the result.
     * - Never destructure conditionally.
     * - Never destructure more than 1 layer.
     */
    readonly useShallowState: () => T;
}

/////////////////////
// Creating stores //
/////////////////////

function prime<T>(ssa: SetStateAction<T>): (old: T) => T {
    if (typeof ssa === "function") {
        return ssa as any; // FIXME: How do we exclude callable Ts?
    } else {
        return () => ssa;
    }
}

/** Creates a store using a direct implmentation. */
export function createDraftableStore<T>(klass: StoreConstructor<T>): Store<T> {
    const context = createContext<StoreInstance<T> | null>(null);
    
    /////////////////
    // useInstance //
    /////////////////
    
    /** Is React-stable. */
    function useInstance(): StoreInstance<T> {
        const instance = useContext(store[$context]);
        if (instance === null) {
            const {name = "???"} = store[$constructor];
            throw new Error(`missing provider for store '${name}'`);
        }
        return instance;
    }
    
    /////////////////
    // useDispatch //
    /////////////////
    
    function useDispatch(): StoreDispatch<T> {
        const instance = useInstance();
        return instance.dispatch;
    }
    
    /////////////////
    // useSelector //
    /////////////////
    
    function useSelector<U>(selector: (x: T) => U): U {
        const instance = useInstance();
        return useSyncExternalStore(
            instance.subscribe, 
            () => selector(instance.getState()),
        );
    }
    
    //////////////////////
    // useSelectorState //
    //////////////////////
    
    function useSelectorState<const U>(selector: Selector<T, U>) {
        return function <const K extends keyof U>(key: K): SetStatePair<U[K]> {
            const instance = useInstance();
            
            /////////
            // Get //
            /////////
            
            const value = useSyncExternalStore(
                instance.subscribe,
                () => selector(instance.getState())[key]
            );
            
            /////////
            // Set //
            /////////
            // We need to stabilize the returned function
            // Variation on useEvent is inlined here
            
            const selectorRef = useRef<typeof selector>(selector);
            const keyRef      = useRef<typeof key>(key);
            
            useLayoutEffect(() => {
                selectorRef.current = selector;
                keyRef.current      = key;
            }, [selector, key]);
            
            const setValue = useCallback((ssa: SetStateAction<U[K]>) => {
                instance.dispatch(draft => {
                    const selector = selectorRef.current;
                    const key      = keyRef.current;
                    
                    const target = selector(draft);
                    target[key] = prime(ssa)(target[key]);
                });
            }, []);
            
            /////////
            // Fin //
            /////////
            
            return [value, setValue];
        }
    } 
    
    ////////////////
    // useMethods //
    ////////////////
    
    type StableFunc = (name: string | symbol, ...args: unknown[]) => unknown;
    
    const UseMethodsTraps: ProxyHandler<StableFunc> = {
        get(target, key, receiver) {
            if (!Reflect.has(target, key)) {
                Object.defineProperty(target, key, {
                    configurable: true,
                    value: (...args: unknown[]) => target(key, ...args),
                });
            }
            return Reflect.get(target, key, receiver);
        },
    };
    
    function useReceiver<const U>(selector: Selector<T, U>): OnlyMethods<U> {
        const dispatch    = useDispatch();
        const selectorRef = useRef(selector);
        
        // TODO: Why not use selectorRef.current = selector?
        useLayoutEffect(() => {
            selectorRef.current = selector;
        }, [selector]);
        
        const stable = useCallback<StableFunc>((name, ...args) => dispatch(draft => {
            const selector = selectorRef.current;
            const target = selector(draft) as any;
            target[name](...args);
        }), []);
        
        return new Proxy(stable, UseMethodsTraps) as any;
    }
    
    /////////////////////
    // useShallowState //
    /////////////////////
    
    // This assumes objects are destructured in the same order every time.
    const UseSelectorProxy: T = new Proxy({}, {
        get: (_, key) => useSelector<unknown>(state => state[key as keyof T]),
    }) as any;
    
    function useShallowState(): T {
        return UseSelectorProxy;
    }
    
    /////////////////////////////
    // Putting it all together //
    /////////////////////////////
    
    const store: Store<T> = {
        [$context]: context,
        [$constructor]: klass,
        useDispatch,
        useSelector,
        useSelectorState,
        useReceiver,
        useShallowState,
    };
    
    return store;
}

//////////////////////////
// Instatiating a store //
//////////////////////////

function createStoreInstance<T>(init: T): StoreInstance<T> {
    if (!isDraftable(init)) {
        throw new Error(`initial value must be draftable`);
    }
    
    //////////////////
    // Nofitication //
    //////////////////
    
    const listeners = new Set<() => void>;
    
    function notify(): void {
        // TODO: Does this need a try/catch?
        for (const listener of listeners) {
            listener();
        }
    }
    
    function subscribe(onStoreChange: () => void): Unsubscribe {
        listeners.add(onStoreChange);
        return () => listeners.delete(onStoreChange);
    }
    
    ////////////////////////
    // State modification //
    ////////////////////////
    
    // One upvalue holds all of our state (🤡)
    let state = freeze(init, true);
    
    function getState(): T {
        return state;
    }
    
    function dispatch(mutator: (draft: T) => void): void {
        // Justification: we have asserted isDraftable before this point
        const draft = createDraft<any>(state) as T;
        try {
            mutator(draft);
        } catch (error) {
            console.error(error);
            return; 
        }
        state = finishDraft(draft) as T;
        notify();
    }
    
    return {dispatch, getState, subscribe};
}

//////////////////////
// Providing stores //
//////////////////////

/** 
 * Provides the store for all children. 
 * 
 * **NB**: the store is initialized once, not every time when `init` changes.
 */
export function DraftableStoreProvider<T>({store, children, initial}: {
    /** The store to create and provide. */
    readonly store: Store<T>;
    /** Initial state of the store. New values are ignored. */
    readonly initial: T;
    /** Components that need an instance of this store. */
    readonly children: ReactNode;
}): ReactNode {
    const value = useRef<StoreInstance<T> | null>(null);
    value.current ??= createStoreInstance(initial);
    
    // TODO: React 19 uses the context directly as a component
    const Provider = store[$context].Provider;
    return <Provider value={value.current}>
        {children}
    </Provider>
}
