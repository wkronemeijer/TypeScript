import { ReplaceableFunction } from "../../Multiplatform/ReplaceableFunction";
import { DecoratedString } from "../Console/DecoratedString";

// TODO: Expand on the common util.inspect replacement
// web-util-inspect also works, so idk
// Doesn't need to be perfect, after all.

interface InspectOptions {
    depth?: number;
    colors?: boolean;
    
    maxStringLength?: number;
    maxCollectionLength?: number;
    breakLength?: number;
}

/** Platform-independent replacement for `util.inspect` */
export const inspectValue = ReplaceableFunction((
    value: unknown, 
    options: InspectOptions = {},
): DecoratedString => {
    return DecoratedString(String(value));
});

// 🤢
// TODO: Remove when common inspect is implemented
if ("process" in globalThis && "require" in globalThis) {
    inspectValue.replace((globalThis as any).require("util").inspect);
}
