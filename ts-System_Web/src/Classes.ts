import { Falsy, identity } from "@wkronemeijer/system";

/** 
 * Joins strings for the `class` attribute. 
 * 
 * @example 
 * <div className={joinClasses("MyComponent", 
 *     "DarkMode",
 *     isLarge && "isLarge",
 * )}>...</div>
 */
function join(
    ...args: (string | Falsy)[]
): string {
    return (
        args
        .filter(identity) // Reminder: Boolean("") == false
        .join(' ')
    );
}

// Can't decide on a name...
export const emanSsalc      = join;
export const classNames     = join;
export const joinClasses    = join;
export const joinClassNames = join;
