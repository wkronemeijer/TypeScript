import {PartialRecord_toPartialFunction} from "../../Core/Data/Collections/Record";
import {StringEnum} from "../../Core/Data/Textual/StringEnum";
import {AnsiColor} from "../Console/TextDecoration";

export type  UserLogChannel = ReturnType<typeof UserLogChannel>;
export const UserLogChannel = StringEnum([
    "info",
    "log",
    "warn",
    "error", // error (duh)
] as const).withDefault("log");

export type  DeveloperLogChannel = ReturnType<typeof DeveloperLogChannel>;
export const DeveloperLogChannel = StringEnum([
    "trace",
    "perf",
    "meta", // everything else
] as const).withDefault("meta");

export type  LogChannel = ReturnType<typeof LogChannel>;
export const LogChannel = StringEnum([
    ...UserLogChannel.values,
    ...DeveloperLogChannel.values,
] as const).withDefault(UserLogChannel.default);

export const LogChannel_getColor = PartialRecord_toPartialFunction<LogChannel, AnsiColor>({
    warn: "yellow",
    error: "red",
    info: "black",
    trace: "magenta",
    perf: "blue",
    meta: "green",
    // Cyan is unused
});
