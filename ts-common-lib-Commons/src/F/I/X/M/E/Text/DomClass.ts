import { identity } from "../Data/Function/Function";
import { Falsy } from "../Types/Truthy";

/** 
 * Joins strings for the `class` attribute. 
 * 
 * (The name is `className` in reverse to be general but also unambiguous) 
 * @example 
 * <div className={emanSsalc("MyComponent", 
 *     "DarkMode",
 *     env.get("colorTheme"),
 *     isSelected && "selected",
 *     isLarge ? "large" : "small",
 * )}>...</div>
 */
export function emanSsalc(
    ...maybeNames: (string | Falsy)[]
): string {
    return (
        maybeNames
        .filter(identity) // Reminder: Boolean("") == false
        .join(' ')
        .trim()
    );
}
