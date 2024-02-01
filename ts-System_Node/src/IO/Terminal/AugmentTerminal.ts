import { inspect } from "util";

import { DecoratedString, PowerlineLogMessageFormatter, formatLogMessage, inspectValue } from "@wkronemeijer/system";

export function augmentTerminal(): void {
    inspectValue.overwrite(value => DecoratedString(
        typeof value === "string" ? value : inspect(value)
    ));
    
    const stdout = process.stdout;
    if (stdout.isTTY && stdout.hasColors()) {
        formatLogMessage.overwrite(PowerlineLogMessageFormatter);
    }
}
