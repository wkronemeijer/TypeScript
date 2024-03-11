import { panic } from "../Core/Errors/Panic";

/**
 * A string, possibly with insertion points like `{0}` that can be formatted.
 * 
 * Just a plain string, as it can possibly have no insertion points at all.
 */
export type FormattableString = string;

const insertionPointPattern = /\{(\d+)\}/g;
const defaultReplacement = "<missing argument>";

/** 
 * Formats a string by replacing items like `{0}` with the stringified 0-th argument. 
 * 
 * Useful if you want to customize the formatting of an assertion function, 
 * but don't want the string to made unless an assertion failure has actually occured.
 * 
 * Only supports up to 10 parameters, and does not support additional formatting options.
 * Does not throw, even if too few arguments are provided.
 */
export function FormattableString_format(self: FormattableString, ...substitutes: unknown[]): string {    
    const length = substitutes.length;
    const insertionPointReplacement = (_: unknown, digit: string) => {
        const i = Number(digit);
        switch (true) {
            case isNaN(i)  : panic();
            case i < length: return String(substitutes[i]);
            default        : return defaultReplacement;
        }
    };
    return self.replaceAll(insertionPointPattern, insertionPointReplacement);
}

export const formatString = FormattableString_format;
