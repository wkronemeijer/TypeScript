import {useLocation} from "./Location";

type SearchParamKey   = string;
type SearchParamValue = string | null;

/** 
 * Returns the current value of a search parameter. 
 * 
 * If you want a live value, use {@link useSearchParam}.
 */
export function getSearchParam(
    name: SearchParamKey, 
    href = window.location.href,
): string | null {
    const url = new URL(href);
    return url.searchParams.get(name);
}

/** 
 * Returns the current value of a search parameter. 
 * 
 * If you just want the current value, use {@link getSearchParam}.
 */
export function useSearchParam(name: SearchParamKey): string | null {
    return useLocation(href => getSearchParam(name, href));
}

/** Sets a search parameter, or deletes if the value is null. */
export function setSearchParam(
    name: SearchParamKey,
    value: SearchParamValue,
): void {
    const url = new URL(window.location.href);
    if (value !== null) {
        url.searchParams.set(name, value);
    } else {
        url.searchParams.delete(name);
    }
    window.history.replaceState(null, "", url);
}
