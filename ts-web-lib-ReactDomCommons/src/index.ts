import {enableMapSet} from "immer";

enableMapSet();

export const __LIB_REACT_DOM_COMMONS = {};

declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number;
    }
}

export * from "./Modules.generated";
