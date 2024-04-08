// Q: Why don't you split it up into more files?
// A: Because I don't think it makes the code any clearer. 

import { StringBuilder } from "../../Core/Data/Textual/StringBuilder";
import { StringEnum } from "../../Core/Data/Textual/StringEnum";
import { Newtype } from "../../Core/Data/Nominal/Newtype";
import { Member } from "../../Core/Data/Collections/Enumeration";

///////////////
// AnsiColor //
///////////////

// enum AnsiColorCode {
//     /** Black in dark mode, white in light mode. */
//     Black = 0,
//     Red,
//     Green,
//     Yellow,
//     Blue,
//     Magenta,
//     Cyan,
//     /** Really more "opposite" color to {@link Black}. */
//     White, 
//     Unset = 9
// }

export type  AnsiColor = Member<typeof AnsiColor>;
export const AnsiColor = StringEnum({
    /** Black in dark mode, white in light mode. */
    black: 0,
    red: 1,
    green: 2,
    yellow: 3,
    blue: 4,
    magenta: 5,
    cyan: 6,
    /** Really more "opposite" color to {@link Black}. */
    white: 7,
    
    unset: 9
} as const).withDefault("unset");

/////////////////
// Font weight //
/////////////////

export type  AnsiFontWeight = Member<typeof AnsiFontWeight>;
export const AnsiFontWeight = StringEnum([
    "unset",
    "bold",
] as const).withDefault("unset");

//////////////////
// Experimental //
//////////////////

export type StyleShorthand = 
    | `${AnsiColor}`
    | `on ${AnsiColor}`
    | `${AnsiColor} on ${AnsiColor}`
    | `${AnsiFontWeight} ${AnsiColor}`
    | `${AnsiFontWeight} on ${AnsiColor}`
    | `${AnsiFontWeight} ${AnsiColor} on ${AnsiColor}`
;

const stl: StyleShorthand = "on black";

//////////////
// Commands //
//////////////

const unsetAll = 0;

const setBold   = 1;
const unsetBold = 22;

const foregroundOffset = 30;
const backgroundOffset = 40;

const createCommandByColor = (shift: number) => (color: AnsiColor) => shift + AnsiColor.getOrdinal(color);

const setColor      = createCommandByColor(foregroundOffset);
const setBackground = createCommandByColor(backgroundOffset);
const setWeight     = (weight: AnsiFontWeight) => ({
    "bold": setBold,
    "unset": unsetBold,
} satisfies Record<AnsiFontWeight, number>)[weight];

const set = {
    color: setColor,
    background: setBackground,
    fontWeight: setWeight,
} as const satisfies Record<keyof AnsiTextStyle, (arg: any) => number>;

const unset = {
    color     : set.color("unset"),
    background: set.background("unset"),
    fontWeight: set.fontWeight("unset"),
} as const satisfies Record<keyof AnsiTextStyle, number>;

////////////////
// SgrCommand //
////////////////


type SgrArgument = number;

export type          SgrCommand = Newtype<string, "SgrCommand">;
export declare const SgrCommand_Brand: unique symbol;

function SgrCommand(args: SgrArgument[]): SgrCommand {
    return (args.length > 0 ?
        `\u001b[${args.join(";")}m` :
        ``
    ) as SgrCommand;
}

export const SgrCommand_ResetAll = SgrCommand([unsetAll]);

export const SgrCommand_isActive = (sgr: SgrCommand) => !!sgr;

///////////////////
// AnsiTextStyle //
///////////////////


export interface AnsiTextStyle {
    /** The color of the letters. */
    readonly color?: AnsiColor;
    readonly background?: AnsiColor;
    readonly fontWeight?: AnsiFontWeight;
}

export const AnsiTextStyle_Empty: AnsiTextStyle = {};

export function AnsiTextStyle_isNotEmpty(stl: AnsiTextStyle): boolean {
    return (
        stl.color      !== undefined ||
        stl.background !== undefined ||
        stl.fontWeight !== undefined
    );
}

export function AnsiTextStyle_set(stl: AnsiTextStyle): SgrCommand {
    const commands: SgrArgument[] = [];
    if (stl.color     ) { commands.push(set.color     (stl.color     )) }
    if (stl.background) { commands.push(set.background(stl.background)) }
    if (stl.fontWeight) { commands.push(set.fontWeight(stl.fontWeight)) }
    return SgrCommand(commands);
}

export function AnsiTextStyle_unset(stl: AnsiTextStyle): SgrCommand {
    const commands: SgrArgument[] = [];
    if (stl.color     ) { commands.push(unset.color     ) }
    if (stl.background) { commands.push(unset.background) }
    if (stl.fontWeight) { commands.push(unset.fontWeight) }
    return SgrCommand(commands);
}

interface AnsiTextStyle_use_Result {
    readonly isActive: boolean;
    readonly apply: SgrCommand;
    /** Be mindful this *unset*s the variables, not setting them back to what they were. If styles do not overlap, the result is the same however. */
    readonly unset: SgrCommand;
}

export function AnsiTextStyle_use(stl: AnsiTextStyle): AnsiTextStyle_use_Result {
    const apply    = AnsiTextStyle_set(stl);
    const isActive = SgrCommand_isActive(apply);
    const unset    = AnsiTextStyle_unset(stl);
    return { isActive, apply, unset};
}

// /** Paints a string by adding ANSI escape codes. For more fine-grained control, use  */
// export function paintString(string: string, paint: AnsiTextStyle): DecoratedString {
//     const result = new StringBuilder();
    
//     const { isActive, apply, unset } = AnsiTextStyle_use(paint);
    
//     if (isActive) { result.append(apply) }
//     result.append(string);
//     if (isActive) { result.append(unset) }
    
//     return DecoratedString(result.toString());
// }
