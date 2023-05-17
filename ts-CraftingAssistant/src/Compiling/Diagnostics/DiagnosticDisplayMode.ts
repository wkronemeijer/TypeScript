import { Member, StringEnum_create } from "@local/system";

export type  DiagnosticDisplayMode = Member<typeof DiagnosticDisplayMode>;
export const DiagnosticDisplayMode = StringEnum_create([
    "inline",
    "block",
] as const).withDefault("inline");
