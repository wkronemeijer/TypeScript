// AKA enums created with the TypeScript keyword `enum`
// I would love to use some T where T:enum but I didn't find anything
// And this works good enough.

import { uncapitalize } from "../Text/Casing";

export type NativeEnum = { 
    readonly [s: number | string]: string | number;
};

export type NativeEnum_Member<N extends NativeEnum> = 
    Extract<N[NativeEnum_StringMember<N>], number>
;

export type NativeEnum_StringMember<N extends NativeEnum> = 
    Extract<keyof N, string>
;

export type NativeEnum_AssimilatedMember<N extends NativeEnum> = 
    Uncapitalize<NativeEnum_StringMember<N>>
;

// AKA the thing you put into the E slot of a normal StringEnum
export type NativeEnum_AssimilatedMemberTuple<N extends NativeEnum> = 
    readonly NativeEnum_AssimilatedMember<N>[]
;

enum Color {
    White = -1,
    Black = 0,
    Red, 
    Blue,
    Green,
    Yellow,
}
type ColorT = typeof Color;

type t0 = Extract<Color.Red, number>;

type Color_Member = NativeEnum_Member<typeof Color>;


// 'N[Extract<keyof N, string>] & number' is not assignable to parameter of type 'Extract<N[Extract<keyof N, string>], number>'.


type t1 = ColorT[Extract<keyof ColorT, string>] & number
type t2 = Extract<ColorT[Extract<keyof ColorT, string>], number>

