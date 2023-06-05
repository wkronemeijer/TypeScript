
import { FooNode } from "../TerminalObjectModel/Node";
import { jsx } from "../jsx-runtime";

export const MyApp = (props: {    
}): JSX.Element => {
    return <>
        Hello, world!
        <button>Press me!</button>
    </>;
}

const Strong = (props: {
    readonly children: FooNode;
}): JSX.Element => {
    return <span class="Strong" bold>
        {props.children}
    </span>
}

const motd = <Strong>Hello, world!</Strong>

