import { Newtype, requires } from "@local/system";


export type     Quantity = Newtype<number, "Quantity">;
export function Quantity(number: number): Quantity {
    requires(number >= 0, "quantity should be non-negative.");
    requires(isFinite(number), "quantity should be finite.");
    return number as Quantity;
}

export const Quantity_default = Quantity(0);

export function Quantity_toString(self: Quantity): string {
    return `${self}\xD7`;
}
