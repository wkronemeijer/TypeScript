import {useSyncExternalStore} from "react";
import {Unsubscribe} from "@wkronemeijer/system";

////////////////////////////
// Navigation declaration //
////////////////////////////

interface NavigationEventMap {
    "navigate": Event;
}

interface NavigationResult {
    readonly committed: Promise<void>;
    readonly finished: Promise<void>;
}

interface NavigationNavigateOptions {
    readonly state?: unknown;
    readonly info?: unknown;
    readonly history?: "auto" | "push" | "replace";
}

interface Navigation extends EventTarget {
    readonly canGoBack: boolean;
    readonly canGoForward: boolean;
    
    navigate(url: string | URL, options?: NavigationNavigateOptions): NavigationResult
    reload(): NavigationResult;
    
    addEventListener<K extends keyof NavigationEventMap>(
        kind: K, 
        listener: (this: Navigation, event: NavigationEventMap[K]) => any, 
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        kind: string, 
        listener: EventListenerOrEventListenerObject, 
        options?: boolean | AddEventListenerOptions,
    ): void;
}

declare global {
    interface Window {
        readonly navigation: Navigation;
    }
}

//////////
// Hook //
//////////

const listeners = new Set<() => void>;

function notify() {
    // TODO: Throw an AggregateError at the end
    for (const listener of listeners) {
        try {
            listener();
        } catch (e) {
            console.error(e);
        }
    }
}

function subscribe(onStoreChange: () => void): Unsubscribe {
    listeners.add(onStoreChange);
    return () => listeners.delete(onStoreChange);
}

function getSnapshot(): string {
    return window.location.href;
}

export function useLocation<T>(selector: (href: string) => T): T {
    return useSyncExternalStore(subscribe, () => selector(getSnapshot()));
}

export const subscribeToWindowLocation = subscribe;

//////////////////////////
// Register for updates //
//////////////////////////
// https://caniuse.com/mdn-api_navigation

try {
    // `window.location.href` updates AFTER triggering 'navigate';
    // We queue notify to make sure they see the NEW value.
    window.navigation.addEventListener(
        "navigate", 
        () => {setTimeout(notify)}, 
        {passive: true},
    );
} catch { 
    // Fall back to polling
    const interval = 500/*ms*/;
    
    let lastHref = getSnapshot();
    setInterval(() => {
        const currentHref = getSnapshot();
        if (lastHref !== currentHref) {
            lastHref = currentHref;
            notify();
        }
    }, interval);
}
