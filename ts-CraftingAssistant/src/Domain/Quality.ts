import { Newtype, requires } from "@wkronemeijer/system";


export type     Quality = Newtype<number, "Quality">;
export function Quality(tier: number): Quality {
    requires(0 <= tier && tier <= 5);
    return tier as Quality;
}

export const Quality_default = Quality(0);

export function Quality_toString(self: Quality): string {
    return "*".repeat(self);
}
