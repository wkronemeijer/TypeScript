import {enableMapSet} from "immer";

enableMapSet();

export const __LIB_REACT_DOM_COMMONS = {};

// Extend interface React uses for style props
declare module "csstype" {
    interface Properties {
         [key: `--${string}`]: string | number;
    }
}

export * from "./Modules.generated";
