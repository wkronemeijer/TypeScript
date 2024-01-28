import { max } from "@wkronemeijer/system";

export function positive(value: number): number {
    return max(0, value);
}
