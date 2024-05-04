import {Component, PropsWithChildren, ReactNode} from "react";
import {formatThrowable} from "@wkronemeijer/system";

const NO_ERROR = Symbol("no error");

interface ErrorBoundary_Props extends PropsWithChildren<{}> {
    readonly children: ReactNode;
}

interface ErrorBoundary_State {
    readonly error: unknown | typeof NO_ERROR;
}

export class ErrorBoundary extends Component<ErrorBoundary_Props, ErrorBoundary_State> {
    constructor(props: ErrorBoundary_Props) {
        super(props);
        this.state = {error: NO_ERROR};
    }
    
    static getDerivedStateFromError(error: unknown): Partial<ErrorBoundary_State> {
        return { error };
    }
    
    componentDidCatch(_error: unknown, _errorInfo: unknown) {
        // React already logs the stack, so we don't have to.
    }
    
    render() {
        const {error} = this.state;
        if (error !== NO_ERROR) {
            const name = error instanceof Error ? error.name : "error";
            const description = formatThrowable(error);
            return <div className="CErrorBoundary">
                <h1 className="Title">Uncaught {name}</h1>
                <pre className="Message"><code>
                    {description}
                </code></pre>
            </div>
        } else {
            return this.props.children;
        }
    }
}
