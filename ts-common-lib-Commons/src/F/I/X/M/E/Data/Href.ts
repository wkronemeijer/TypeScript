import {NewtypeChecker} from "./Nominal/NewtypeChecker";
import {isString} from "../IsX";

/** A string that contains a URL. */
export type  Href = ReturnType<typeof Href>;
export const Href = NewtypeChecker("Href", {
    constrain: isString, 
    refine: value => URL.canParse(value),
});

export const isHref = Href.hasInstance;

// TODO: Add AbsoluteHref, RelativeHref and validation fns for those
