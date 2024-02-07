import { GetRaspServer, RaspRequestProxy } from "@wkronemeijer/react-server-page-provider";
import { Dictionary, panic } from "@wkronemeijer/system";

/** Returns a deconstructable object containing the search parameters for the current request. */
export function getQueryParams(): Dictionary<string> {
    return Dictionary.from(new URL(__REQUEST_INFO.url).searchParams);
}

export function GetRaspRequest(): RaspRequestProxy {
    return GetRaspServer().getRequest(__REQUEST_INFO.id) ?? panic(
        `Could not find request.`
    );
}
