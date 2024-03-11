import { PartialRecord_toPartialFunction } from "../../Core/Data/Collections/Record";
import { StringEnum } from "../../Core/Data/Textual/StringEnum";
import { AnsiColor } from "../Console/TextDecoration";
import { Member } from "../../Core/Data/Collections/Enumeration";

export type  UserLogChannel = Member<typeof UserLogChannel>;
export const UserLogChannel = StringEnum([
    "info",
    "log",
    "warn",
    "error", // error (duh)
] as const).withDefault("log");

export type  DeveloperLogChannel = Member<typeof DeveloperLogChannel>;
export const DeveloperLogChannel = StringEnum([
    "trace",
    "perf",
    "meta", // everything else
] as const).withDefault("meta");

export type  LogChannel = Member<typeof LogChannel>;
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
