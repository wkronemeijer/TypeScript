import { Dictionary } from "@wkronemeijer/system";

declare global {
    // TODO: Move this to 
    // The client-side of the TSX server-renderer
    const __URL_PARAMS: Dictionary<string>;
}
