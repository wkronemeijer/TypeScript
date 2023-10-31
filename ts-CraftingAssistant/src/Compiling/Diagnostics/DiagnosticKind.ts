import { AnsiColor, Member, PartialRecord_toTotalFunction, Record_toFunction, StringEnum, constant } from "@wkronemeijer/system";

export type  DiagnosticKind = Member<typeof DiagnosticKind>;
export const DiagnosticKind = StringEnum([
    "info",
    "warning",
    "error",
] as const);

export const DiagnosticKind_isFatal = PartialRecord_toTotalFunction<DiagnosticKind, boolean>({
    error: true,
}, constant(false)); 

export const DiagnosticKind_getColor = Record_toFunction<DiagnosticKind, AnsiColor>({
    info: "white",
    warning: "yellow",
    error: "red",
});
