import { StringBuilder } from "../Text/StringBuilder";
import { requires } from "../Assert";

function createJoinedMessage<E extends Error>(errors: readonly E[]): string {
    const result = new StringBuilder;
    for (const error of errors) {
        // Error.toString doesn't show up for some reason
        // (even though it exists, and inherits from Object as well ???)
        result.appendLine(String(error));
    }
    return result.toString();
}

export class CompoundError<E extends Error = Error> extends Error {
    readonly errors: readonly E[]
    constructor(
        errors: Iterable<E>
    ) {
        const errorArray = Array.from(errors);
        requires(errorArray.length > 0, 
            `There should be at least 1 error.`);
        const cause = errorArray[0];
        super(createJoinedMessage(errorArray), { cause });
        this.errors = errorArray;
    }
    
    static throwIfNotEmpty<E extends Error>(errors: readonly E[]): void {
        if (errors.length > 0) {
            throw new CompoundError(errors);
        }
    }
}

// TODO: Is this compound thing really useful? 
// Because if you have multiple that should really go through another channel
