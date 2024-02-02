import { ReactPagePattern } from "./Transforms/Server/ReactPage";

export function Link(props: {
    readonly href: string;
}): JSX.Element {
    const { href } = props;
    return <a href={href}>
        {decodeURIComponent(href).replace(ReactPagePattern, "")}
    </a>;
}
