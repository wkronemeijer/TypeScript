import { FooNode, FunctionComponent, ProtoNode, TomAttributesByTag, TomChildrenAttribute } from "./TerminalObjectModel/Node";

declare global {
    namespace JSX {
        type Element = ProtoNode;
        type ElementChildrenAttribute = TomChildrenAttribute;
        type IntrinsicElements = TomAttributesByTag;
    }
}

export function createElement<P>(
    tag: string | FunctionComponent<P>, 
    props: P | null, 
    ...children: FooNode[]
): JSX.Element {
    
    return { tag, props, children };
}

createElement.Fragment = (props: { 
    readonly children: readonly FooNode[];
}): FooNode => props.children;



