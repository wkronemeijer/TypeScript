import { ReactNode } from "react";

export const HtmlRoot = (props: {
    readonly title: string;
    readonly children: ReactNode;
}): JSX.Element => {
    const { title, children } = props;
    
    return <html>
        <head>
            <meta charSet="utf-8"/>
            <title>{title}</title>
            <link rel="stylesheet" href="Style.css"/>
            <link rel="icon"       href="Favicon.png"/>
        </head>
        <body>
            {children}
        </body>
    </html>
};
