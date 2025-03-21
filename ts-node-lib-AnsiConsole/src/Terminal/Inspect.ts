import {DecoratedString} from "./Console/Reusable/DecoratedString";
import {inspect} from "util";

interface InspectOptions {
    depth?: number;
    colors?: boolean;
    
    maxStringLength?: number;
    maxCollectionLength?: number;
    breakLength?: number;
}

/** Platform-independent replacement for `util.inspect` */
export function inspectValue(
    value: unknown, 
    _: InspectOptions = {},
): DecoratedString {
    return DecoratedString(typeof value === "string" ? value : inspect(value));
}

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
