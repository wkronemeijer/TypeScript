import { HexColorString, HexColorString_toComponents } from "./HexColor";
import { Case, UnionMatcher } from "../../../Data/SumType";
import { Array_lastElement } from "../../../Collections/BuiltIns/Array";
import { RegExpNewtype } from "../../../Data/Nominal/RegExp";
import { MarkerNewtype } from "../../../Data/Nominal/Marker";
import { StringBuilder } from "../../StringBuilder";
import { StringEnum } from "../../../Data/Textual/StringEnum";
import { neverPanic } from "../../../Errors/ErrorFunctions";
import { ReadWrite } from "../../../Types/ReadWrite";
import { Satisfies } from "../../../Types/Satisfies";
import { isString } from "../../../Types/IsX";
import { Member } from "../../../Data/Enumeration";
import { assign } from "../../../ReExport/Module/Object";
import { clamp } from "../../../Data/Numeric/Double";

const DecorationsPattern = /[\uEE0A-\uEE0F]/u;
const BEGIN_SEQUENCE = '\uEE0A';
const END_SEQUENCE   = '\uEE0B';
// ???C, ???D, ???E are unused
const POP_STYLE      = '\uEE0F';

/** 
 * A string *optionally* containing decorations. 
 * Similar to ANSI terminal codes, except these nest.
 */
export type  DecoratedString = ReturnType<typeof DecoratedString>; 
export const DecoratedString = MarkerNewtype("DecoratedString", isString);

export function containsDecorations(string: string): string is DecoratedString {
    return DecorationsPattern.test(string);
}

type ColorTarget = (
    | "foreground"
    | "background"
);

export type  NamedAnsiColor = Member<typeof NamedAnsiColor>;
export const NamedAnsiColor = StringEnum({
    black: 0,
    red: 1,
    green: 2,
    yellow: 3,
    blue: 4,
    magenta: 5,
    cyan: 6,
    white: 7,
});

type ExtendedAnsiColor = Case<`4bit`, {
    readonly bright?: boolean;
    readonly name: NamedAnsiColor;
}>;

type SrgbAnsiColor = Case<`24bit`, {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
}>;

type clear  = "clear";
type normal = "normal";

type AnyAnsiColor = (
    | NamedAnsiColor
    | ExtendedAnsiColor
    | SrgbAnsiColor 
    | HexColorString
);

type NormalizedAnsiColor = (
    | ExtendedAnsiColor
    | SrgbAnsiColor
);

function normalizeAnsiColor(color: AnyAnsiColor | clear): NormalizedAnsiColor | clear {
    switch (true) {
        case color === "clear"                : return "clear";
        case HexColorString.hasInstance(color): return { kind: "24bit", ...HexColorString_toComponents(color) };
        case NamedAnsiColor.hasInstance(color): return { kind: "4bit", name: color };
        default                               : return color;
    } 
}

function getSequence(target: ColorTarget, color: NormalizedAnsiColor | clear): number[] {
    const isForeground = target === "foreground";
    if (color === "clear") {
        return [isForeground ? 39 : 49];
    } else if (color.kind === "4bit") {
        const isBright = color.bright;
        const base = (isBright ?
            (isForeground ? 90 : 100) :
            (isForeground ? 30 :  40)
        );
        const ordinal = NamedAnsiColor.getOrdinal(color.name); // in 0-7
        return [base + ordinal];
    } else if (color.kind === "24bit") {
        const red   = clamp(0, color.red  , 255);
        const green = clamp(0, color.green, 255);
        const blue  = clamp(0, color.blue , 255);
        return [isForeground ? 38 : 48, 2, red, green, blue];
    } else {
        neverPanic(color);
    }
}

interface StyleState {
    readonly foreground: NormalizedAnsiColor | clear;
    readonly background: NormalizedAnsiColor | clear;
    
    readonly intensity: "bold" | "faint" | normal;
    readonly reversed: "reversed" | normal;
    readonly sloped: "italic" | normal ;
    
    readonly underlines: 0 | 1 | 2;
    readonly overline: 0 | 1;
}

function StyleState(): ReadWrite<StyleState> {
    return {
        foreground: "clear",
        background: "clear",
        intensity: "normal",
        reversed: "normal",
        sloped: "normal",
        underlines: 0,
        overline: 0,
    }
}

//////////////////////
// Style transition //
//////////////////////

type StyleTransition = Partial<StyleState>;

function StyleTransition(): ReadWrite<StyleTransition> {
    return {};
}

function StyleTransition_apply(state: StyleState, delta: StyleTransition): StyleState {
    return assign({}, state, delta);
}

/////////////////
// Style Stack //
/////////////////

interface StyleStack {
    readonly depth: number;
    readonly current: StyleState;
    push(delta: StyleTransition): void;
    pop(): void;
}

interface StyleStackConstructor {
    new(): StyleStack;
}

const      StyleStack
:          StyleStackConstructor 
= class    StyleStack_impl 
implements StyleStack {
    private stack = new Array<StyleState>();
    private readonly root: StyleState = StyleState();
    
    get current(): StyleState {
        return Array_lastElement(this.stack) ?? this.root;
    }
    
    get depth(): number {
        return 1 + this.stack.length;
    }
    
    push(delta: Partial<StyleState>): void {
        this.stack.push(StyleTransition_apply(this.current, delta));
    }
    
    pop(): void {
        this.stack.pop();
    }
}

//////////////////
// Short format //
//////////////////

// Internal
type  ShortStringStyle = ReturnType<typeof ShortStringStyle>;
const ShortStringStyle = RegExpNewtype("ShortStringStyle", 
    /[a-z0-9]+/
)

function compress(delta: StyleTransition): ShortStringStyle {
    const result = new StringBuilder;
    __NOT_IMPLEMENTED();
}

function decompress(delta: ShortStringStyle): StyleTransition {
    const result = new StringBuilder;
    __NOT_IMPLEMENTED();
}

////////////////////////////////////
// Decoration style (user-facing) //
////////////////////////////////////

export type DecorationStyle = Satisfies<{
    
}, StyleTransition>;

function DecorationStyle_normalize(style: DecorationStyle): StyleTransition {
    return style;
}

function decorate(
    style: DecorationStyle, 
    string: string,
): DecoratedString {
    return DecoratedString(`${BEGIN_SEQUENCE}${compress(style)}${END_SEQUENCE}${string}${POP_STYLE}`);
}

/** A string *optionally* containing ANSI terminal control codes. */
type  AnsiString = ReturnType<typeof AnsiString>;
const AnsiString = MarkerNewtype("AnsiString", isString);

///////////////
// Functions //
///////////////

type DecorationTreeNode = (
    | {
        readonly kind: "text",
        readonly text: string,
    }
    | {
        readonly kind: "node",
        readonly style: StyleTransition,
        readonly nodes: readonly DecorationTreeNode[],
    }
);

interface DecorationTreeNodeAlgebra<R> {
    text(string: string): R;
    node(style: StyleTransition, nodes: readonly R[]): R;
}

function DecorationTreeNode_createFold<R>(algebra: DecorationTreeNodeAlgebra<R>): (value: DecorationTreeNode) => R {
    const fold = (value: DecorationTreeNode): R => {
        switch (value.kind) {
            case "text": return algebra.text(value.text);
            case "node": return algebra.node(value.style, value.nodes.map(fold));
        }
    }
    return fold;
}

// Note that this function cannot fail
function parse(string: DecoratedString): DecorationTreeNode {
    const nodes = new Array<DecorationTreeNode>;
    
    const root: DecorationTreeNode = {
        kind: "node",
        style: {},
        nodes: nodes,
    }
    __NOT_IMPLEMENTED();
}

///////////////
// Rendering //
///////////////

const renderNode: (node: DecorationTreeNode) => (
    AnsiString
) = UnionMatcher<DecorationTreeNode, [], AnsiString>({
    text({ text }) {
        return AnsiString(text);
    },
    node({ style, nodes }) {
        // TODO: Insert more ansi codes
        return AnsiString(nodes.map(renderNode).join(""));
    }
})

function ansiRender(string: string): AnsiString {
    if (!containsDecorations(string)) {
        return AnsiString(string);
    }
    const stack = new StyleStack();
    
    const result = new StringBuilder();
    
    __NOT_IMPLEMENTED();
}

// TODO: Put an 

///////////
// Strip //
///////////

const stripNode: (node: DecorationTreeNode) => (
    string
) = UnionMatcher<DecorationTreeNode, [], string>({
    text({ text }) {
        return text;
    },
    node({ nodes }) {
        return nodes.map(stripNode).join("");
    }
})

/** Removes all decoration info from a string. */
function strip(string: DecoratedString): string {
    if (!containsDecorations(string)) {
        return string;
    } else {
        return stripNode(parse(string));
    }
}

/////////////
// Exports //
/////////////

export const DecoratedString_new                = decorate;  
export const DecoratedString_parse              = parse;
export const DecoratedString_renderToAnsiString = ansiRender;
export const DecoratedString_strip              = strip;
