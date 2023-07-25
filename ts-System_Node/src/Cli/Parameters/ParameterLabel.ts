import { Newtype, Object_explicitKeys, Set_hasAny, from, swear } from "@wkronemeijer/system";
import { CliParseResult } from "../ParseResult";

export type CliParameterLabel = Newtype<string, "CliParameterLabel">;


const forbiddenLabels = from(Object_explicitKeys<CliParseResult>({
    kind: true,
    rest: true,
})).toSet();

export function CliParameterLabel(string: string): CliParameterLabel {
    const result = (
        string
        .replaceAll("-", "")
        .toLowerCase()
    );
    swear(!Set_hasAny(forbiddenLabels, result),  () => 
        `'${result}' can not be used as a label.`);
    swear(result.length > 0,
        "Parameter label must not be empty.");
    return result as CliParameterLabel;
}

export function CliParameterLabel_tryParseArgument(string: string): CliParameterLabel | undefined {
    if (
        (string.startsWith('-') ||        string.startsWith('--')) &&
        string.length > 2
    ) {
        return CliParameterLabel(string);
    } else {
        return undefined;
    }
}

export function CliParameterLabel_tryGetIndex(self: CliParameterLabel): number | undefined {
    const asNumber = Number(self);
    if (Number.isInteger(asNumber) ) {
        return asNumber;
    } else {
        return undefined;
    }
}
