
export class TomNode {
    readonly children: ReadonlyArray<TomNode> = [];
}

// Text can't set style, but it does have a computed style 
// so that text nodes can determine their own display. 
export class TomText 
extends TomNode {
    textValue: string = "";
}

export class TomElement
extends TomNode {
    
    constructor(
        readonly tag: string
    ) {
        super();
    }
}


class TomDivElement {
    static readonly tagName = "div";
}


type EventHandler<E extends { readonly kind: string; } = { kind: string; }> = 
    (event: E) => void
;

export interface TomChildrenAttribute {
    readonly children?: FooNode;
}

export interface TomEventAttributes {
    onFocus?: EventHandler;
    onBlur?: EventHandler;
}

type GlobalValue = 
    | "inherit"
    | "initial"
    | "unset"
    | undefined
;

export type TomCssValue<T = (string & {})> = 
    | GlobalValue
    | T
;

type TomCssColor = 
    | "black"
    | "red"
    | "green"
    | "blue"
    | "yellow"
    | "purple"
    | "white"
    | "default"
    | GlobalValue
;

type TomCssColorValue = TomCssValue<TomCssColor>;

type InnerDisplayValue = 
    | "flow"
    | "flex"
    | "grid"
    | GlobalValue
;

type OuterDisplayValue = 
    | "block"
    | "inline"
    | GlobalValue
;

/*
Alright, dev issues:
do we do a full tree?
Do we do a full box approach, like tex?
Do we do inner/outer display kind, despite being ugly?
- on one hand, it is complex, and its effect is only noticeable in flow layout (not in flex or grid)
- on the other, 
    it means text should always be inside specific kinds of nodes,
    making the benefit over ink very small.
- on another hand, flex and inline flow are very similar.
    and you would still have multiple 

Observation: all properties are visual

3 bit, 4 bit, 8 bit and 24 bit colors work in VSCode (our target)

*/

export interface TomStyleAttributes {
    
    readonly class?: string;
    readonly className?: string; 
    
    
    readonly display?: OuterDisplayValue;
    
    
    readonly color?: TomCssColorValue;
    readonly backgroundColor?: TomCssColorValue;
    
    readonly gap?: number;
    
    // Border
    readonly border?: TomCssValue;
    readonly borderWidth?: number;
    readonly borderStyle?: TomCssValue<
        | "single"
        | "double"
        | "thick"
        | "doubleThick"
    >;
    readonly borderContent?: TomCssValue;
    readonly borderColor?: TomCssColorValue;
    
    // Text decoration
    readonly font?: TomCssValue;
    readonly fontWeight?: TomCssValue<
        | "normal"
        | "bold"
    >;
    readonly fontVariant?: TomCssValue<
        | "normal"
        | "italic"
    >;
    readonly textDecoration?: TomCssValue<
        | "underline"
        | "none"
    >;
    
}

export interface TomShorthandStyleAttributes {
    readonly bold?: boolean;
    readonly italic?: boolean;
    readonly underlined?: boolean;
    
    readonly red?: boolean;
    readonly green?: boolean;
    readonly blue?: boolean;
    
    readonly faded?: boolean;
    readonly warning?: boolean;
    readonly error?: boolean;
}

export interface TomAttributes extends 
TomChildrenAttribute, 
TomEventAttributes, 
TomStyleAttributes, 
TomShorthandStyleAttributes {
}

// well if we do just visual stuff, tags mean very little
// so just supporting everythig is silly
// thus, what minimal set should we support?
/*
Logical choices:

div/box/block for block
span for inline 

box for single border

par 


*/
export interface TomAttributesByTag {
    readonly div: TomAttributes;
    readonly span: TomAttributes;
    
    readonly par: TomAttributes;
    readonly list: TomAttributes;
    readonly li: TomAttributes;
    
    readonly header: TomAttributes;
    readonly main: TomAttributes;
    readonly section: TomAttributes;
    readonly footer: TomAttributes;
    
    readonly button: TomAttributes;
    readonly checkbox: TomAttributes;
}

export type FunctionComponent<P = {}> = 
    (props: P) => ProtoNode
;


export type ProtoNode = {
    readonly tag: string | FunctionComponent<any>;
    readonly props: any;
    readonly children: FooNode;
}

export type FooNode = 
    // Iterated
    | Iterable<FooNode>
    // Evaluated
    | ProtoNode
    // Rendered to string
    | string
    | number
    // Ignored
    | boolean
    | null 
    | undefined
;



/*
Important to seperate:
The TOM (which has elements and nodes), imperative API
Product of JSX -> Simple objects with kind, key, props, etc.



Also: trying to replicate the DOM is annoying.
But also highly necessary, for education purposes.



elements:
    div :: block element, general purpose
    span :: inline element, general purpose
    
inputs:
    button
    radio
    checkbox


*/
