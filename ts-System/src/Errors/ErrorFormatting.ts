import { terminal } from "../Logging/Terminal";
import { Exception } from "../Assert";

//////////////////////////////////////////////
// Standardize when and how to print errors //
//////////////////////////////////////////////
/** Prints a thrown value appropriately, i.e. bugs get a stack trace, but exceptions only display the message. */

export function printError(error: unknown): void {
    const message =
        // Exceptions and subclasses
        (error instanceof Exception) ? error.message :
        // All other Errors
        (error instanceof Error) ? error.stack :
        // Things that are not errors 
        String(error)
    ;
    terminal.error(message);
}
