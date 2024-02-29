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
