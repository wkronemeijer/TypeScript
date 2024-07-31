import {Throwable, throwableToError} from "@wkronemeijer/system";
import {TypedResponse} from "../MimeType";

export type ErrorDescription = TypedResponse<"text/plain">;

export function ErrorDescription(throwable: Throwable): ErrorDescription {
    return {
        type: "text/plain",
        body: throwableToError(throwable).stack ?? "",
    }
}
