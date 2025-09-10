// Error boundary
// Unlike react-error-boundary, this always shows a retry fallback
// For a versatile fallback, 

import {Component, ReactNode} from "react";
import {formatThrowable} from "@wkronemeijer/system";

type  $ok = typeof $ok;
const $ok = Symbol("ok");

interface Props {
    readonly children: ReactNode;
}

interface State {
    // Reminder that in ES, /any/ value can be thrown
    readonly error: $ok | unknown;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {error: $ok};
    }
    
    static getDerivedStateFromError(error: unknown): Partial<State> {
        return {error};
    }
    
    componentDidCatch(_error: unknown, _info: unknown) {
        // React already logs the stack, so we don't have to.
    }
    
    reset = () => void this.setState({error: $ok});
    
    render(): ReactNode {
        const {error} = this.state;
        if (error === $ok) {return this.props.children}
        const name = error instanceof Error ? error.name : "error";
        const description = formatThrowable(error);
        return <div className="CErrorBoundary">
            <h1 className="Title">Uncaught {name}</h1>
            <button onClick={this.reset}>Retry</button>
            <pre className="Message"><code>{description}</code></pre>
        </div>
    }
}
