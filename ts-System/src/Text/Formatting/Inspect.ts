import { ReplaceableFunction } from "../../Multiplatform/ReplaceableFunction";
import { DecoratedString } from "../Console/DecoratedString";
import { isRunAsNodeCjs } from "../../Multiplatform/PlatformQuery";

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

////////////////////
// Multi-platform //
////////////////////
// TODO: Remove when common inspect is implemented

if (isRunAsNodeCjs()) {
    // @ts-ignore
    const inspect = module.require("util").inspect;
    inspectValue.replace(value => typeof value === "string" ? value : inspect(value));
}
