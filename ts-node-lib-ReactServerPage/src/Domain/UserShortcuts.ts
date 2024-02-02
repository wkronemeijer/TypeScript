import { Dictionary } from "@wkronemeijer/system";

/** Returns a deconstructable object containing the search parameters for the current request. */
export function getQueryParams(): Dictionary<string> {
    return Dictionary.from(new URL(__REQUEST_INFO.url).searchParams);
}
