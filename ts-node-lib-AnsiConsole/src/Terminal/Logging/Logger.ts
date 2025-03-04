import {Record_toFunction, Satisfies} from "@wkronemeijer/system";
import {formatLogMessage} from "./LogMessageFormatter";
import {LogMessage} from "./LogMessage";
import {LogChannel} from "./LogChannel";

export interface Logger {
    (message: LogMessage): void;
}

type MethodName = Satisfies<(
    | "debug"
    | "info" 
    | "log" 
    | "error"
    | "warn" 
), keyof typeof console>;

const methodNameByChannel = Record_toFunction<LogChannel, MethodName>({
    log: "log",
    error: "error",
    info: "info",
    warn: "warn",
    perf: "info",
    meta: "debug",
    trace: "debug",
});

export const ConsoleLogMessagePrinter: Logger = message => {
    const target = methodNameByChannel(message.channel);
    const output = formatLogMessage(message);
    console[target](output);
    // We access the log function by key, so `console` can be monkeypatched.
};

export const __log = ConsoleLogMessagePrinter;
