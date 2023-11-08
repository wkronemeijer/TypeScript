import { ReactPagePattern } from "./Server/RenderServer";

export function Link(props: {
    readonly href: string;
}): JSX.Element {
    const { href } = props;
    return <a href={href}>{decodeURIComponent(href).replace(ReactPagePattern, "")}</a>;
}
