import { RegExpNewtype } from "../../../Data/Nominal/RegExp";

export type  HexColorString = ReturnType<typeof HexColorString>;
export const HexColorString = RegExpNewtype("HexColorString", 
    /^\#[A-Fa-f0-9]{6}$/
);

export function HexColorString_toComponents(hex: HexColorString): { 
    readonly red  : number;
    readonly green: number;
    readonly blue : number;
} {
    const red   = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue  = parseInt(hex.slice(5, 7), 16);
    return { red, green, blue };
}

export function HexColorString_toTuple(hex: HexColorString): [red: number, green: number, blue: number] {
    const { red, green, blue } = HexColorString_toComponents(hex);
    return [red, green, blue];
}
