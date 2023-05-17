import { AnsiColor, Member, Record_toFunction, Record_toTotalFunction, StringEnum_create } from "@local/system";

export type  DiagnosticKind = Member<typeof DiagnosticKind>;
export const DiagnosticKind = StringEnum_create([
    "info",
    "warning",
    "error",
] as const);

export const DiagnosticKind_isFatal = Record_toTotalFunction<DiagnosticKind, boolean>({
    error: true,
}, false);

export const DiagnosticKind_getColor = Record_toFunction<DiagnosticKind, AnsiColor>({
    info: "white",
    warning: "yellow",
    error: "red",
});
