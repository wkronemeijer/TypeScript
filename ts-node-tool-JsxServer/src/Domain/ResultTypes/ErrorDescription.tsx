import { Throwable, throwableToError } from "@wkronemeijer/system";
import { MimeTypedString } from "../MimeType";

export type ErrorDescription = MimeTypedString<"text/plain">;

export function ErrorDescription(throwable: Throwable): ErrorDescription {
    return {
        type: "text/plain",
        body: throwableToError(throwable).stack!,
    }
}
