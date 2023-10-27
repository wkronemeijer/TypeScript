import { DecoratedString, PowerlineLogMessageFormatter, formatLogMessage, inspectValue } from "@wkronemeijer/system";
import { inspect } from "util";

export function augmentTerminal(): void {
    inspectValue.replace(value => DecoratedString(
        typeof value === "string" ? value : inspect(value)
    ));
    
    const stdout = process.stdout;
    if (stdout.isTTY && stdout.hasColors()) {
        formatLogMessage.replace(PowerlineLogMessageFormatter);
    }
}
