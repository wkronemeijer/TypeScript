import { Date_format } from "../(Commons)/Date";

import { ApplicationName } from "../Manifest";

export function GeneratedComment(
    message: string, 
    commentPrefix = "// ",
): string {
    return `${commentPrefix} [${ApplicationName}] ${message}`;
}

GeneratedComment.wasHere = function() {
    return GeneratedComment(`Generated on ${Date_format(new Date)}.`);
};
