import { ReplaceableFunction } from "../Core/Data/Function/ReplaceableFunction";
import { DecoratedString } from "./Console/Reusable/DecoratedString";

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

/////////////////////////////
// Console-like formatting //
/////////////////////////////

const formatSingle = (value: unknown): DecoratedString => {
    if (typeof value === "string") {
        return DecoratedString(value);
    } else {
        return inspectValue(value, {});
    }
};

export function consoleLikeFormat(args: unknown[]): DecoratedString {
    return DecoratedString(args.map(formatSingle).join(' '));
}
