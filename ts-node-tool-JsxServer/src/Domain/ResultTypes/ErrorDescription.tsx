import {Throwable, throwableToError} from "@wkronemeijer/system";
import {TypedResponseBody} from "../TypedResponseBody";

export type ErrorDescription = TypedResponseBody<"text/plain">;

export function ErrorDescription(throwable: Throwable): ErrorDescription {
    return {
        type: "text/plain",
        value: throwableToError(throwable).stack ?? "",
    }
}
