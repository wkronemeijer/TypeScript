import { Member, StringEnum } from "@wkronemeijer/system";

export type  DiagnosticDisplayMode = Member<typeof DiagnosticDisplayMode>;
export const DiagnosticDisplayMode = StringEnum([
    "inline",
    "block",
] as const).withDefault("inline");
