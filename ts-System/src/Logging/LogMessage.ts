import { LogChannel, LogChannel_getColor } from "./LogChannel";
import { AnsiColor } from "../Text/Console/TextDecoration";

// TODO: Unify, and strip escape codes when outputting to not isatty
// TODO: logmessageformatter selection should be an expect function
// Although...xterm.js does exist.
// Ehhh, the nesteddecoratedtext will be common, ansi is node-specific.

export interface LogMessage {
    readonly channel: LogChannel;
    readonly instant: Date;
    readonly value: unknown;
    readonly color: AnsiColor | undefined;
    readonly showLabel: boolean;
    readonly showTime: boolean;
    
    readonly isDecorated: boolean;
}

interface LogMessageOptions {
    readonly instant?: Date;
    readonly showLabel?: boolean;
    readonly showTime?: boolean;
}

interface LogMessageConstructor {
    new(value: unknown, channel?: LogChannel, options?: LogMessageOptions): LogMessage;
}

export const LogMessage
:            LogMessageConstructor
= class      LogMessageImpl
implements   LogMessage {
    readonly instant: Date;
    readonly color: AnsiColor| undefined;
    readonly showLabel: boolean;
    readonly showTime: boolean;
    
    get isDecorated(): boolean {
        return (
            this.color !== undefined || 
            this.showLabel || 
            this.showTime
        );
    }
    
    constructor(
        readonly value: unknown, 
        readonly channel = LogChannel.default, 
        options: LogMessageOptions = {},
    ) {
        this.instant   = options.instant ?? new Date;
        this.color     = LogChannel_getColor(channel);
        this.showLabel = options.showLabel ?? false;
        this.showTime  = options.showTime ?? false;
    }
}
