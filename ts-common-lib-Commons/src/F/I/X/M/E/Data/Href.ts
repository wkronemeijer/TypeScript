import {NewtypeChecker} from "./Nominal/NewtypeChecker";
import {isString} from "../IsX";

/** Stringified URI. */
export type  Href = ReturnType<typeof Href>;
export const Href = NewtypeChecker("Href", {
    constrain: isString,
    isValid: URL.canParse,
});
