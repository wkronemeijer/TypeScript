import {Component, ReactNode} from "react";

interface Props {
    readonly children: ReactNode;
    readonly fallback: ReactNode;
}

interface State {
    readonly hadError: boolean;
}

export class Catch extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hadError: false};
    }
    
    static getDerivedStateFromError(_: unknown): Partial<State> {
        return {hadError: true};
    }
    
    componentDidCatch(_error: unknown, _info: unknown) {
        // React already logs the stack, so we don't have to.
    }
    
    render(): ReactNode {
        if (this.state.hadError) {
            return this.props.fallback;
        } else {
            return this.props.children;
        }
    }
}
