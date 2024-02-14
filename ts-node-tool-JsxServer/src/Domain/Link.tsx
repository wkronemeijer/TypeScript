import { ReactPagePattern } from "./Transforms/Server/Page";

export function Link(props: {
    readonly href: string;
}): JSX.Element {
    const { href } = props;
    return <a href={href}>
        {decodeURIComponent(href).replace(ReactPagePattern, "")}
    </a>;
}
