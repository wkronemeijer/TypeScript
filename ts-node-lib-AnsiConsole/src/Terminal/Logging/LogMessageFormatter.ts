import {AnsiTextStyle_set, AnsiTextStyle_use, SgrCommand_ResetAll} from "../Console/TextDecoration";
import {Date_toHHmm, doOnce, StringBuilder} from "@wkronemeijer/system";
import {stripAnsiSequences} from "../Console/Ansi/Strip";
import {inspectValue} from "../Inspect";
import {LogMessage} from "./LogMessage";
import {LogChannel} from "./LogChannel";

// Formatter feels more of a problem for the implementor
// Can still provide the type and a default tho.
export interface LogMessageFormatter {
    (req: LogMessage): string;
}

const PowerlineArrow = "\uE0B0";
const ChannelWidth   = LogChannel.maxLength;

////////////////
// Plain text //
////////////////

export const LogMessageFormatter_PlainText: LogMessageFormatter = message => {
    const {
        channel,
        instant,
        showLabel,
        showTime,
        value,
    } = message;
    
    const result = new StringBuilder;
    
    if (showTime) {
        result.append("[");
        result.append(Date_toHHmm(instant));
        result.append("] ");
    }
    
    if (showLabel) {
        result.append("[");
        result.append(channel.padEnd(ChannelWidth));
        result.append("] ");
    }
    
    result.append(inspectValue(value) || " "); // reminder: !!"" == false
    
    return result.toString();
};
// Powerline //
export const PowerlineLogMessageFormatter: LogMessageFormatter = message => {
    const {
        channel, 
        instant, 
        color, 
        showLabel, 
        showTime,
        value,
    } = message;
    const result = new StringBuilder;
    
    if (showTime || showLabel) {
        const {
            apply: setBg, unset: unsetBg,
        } = AnsiTextStyle_use({background: color ?? "white"});
        
        const {
            apply: setBold, unset: unsetBold,
        } = AnsiTextStyle_use({fontWeight: "bold"});
        
        result.append(setBg);
        result.append(" ");
        
        if (showTime) {
            result.append(Date_toHHmm(instant));
            result.append(" ");
        }
        
        ///////////
        // Label //
        ///////////
        if (showLabel) {
            result.append(setBold);
            result.append(channel.padEnd(ChannelWidth));
            result.append(" ");
            result.append(unsetBold);
        }

        result.append(unsetBg);
    }
    
    result.append(AnsiTextStyle_set({color}));
    if (showLabel) {
        result.append(PowerlineArrow);
        result.append(" ");
    }
    result.append(inspectValue(value) || " "); // reminder: !!"" == false
    result.append(SgrCommand_ResetAll); // don't taint the console
    
    return result.toString();
};

////////////////////
// Non-VT version //
////////////////////

const matchArrow = /(.*)\uE0B0/;

export const LogMessageFormatter_Simple: LogMessageFormatter = req => {
    const ansiArrowText = PowerlineLogMessageFormatter(req);
    const arrowText = stripAnsiSequences(ansiArrowText);
    const text = arrowText.replace(matchArrow, (_, label: string) => `[${label}]`);
    return text;
}

export const formatLogMessage = PowerlineLogMessageFormatter;

//////////////////
// Plain helper //
//////////////////

export function powerlineLabel(text: string): string {
    doOnce(powerlineLabel, () => {
        const current = "@wkronemeijer/system";
        const future = "@wkronemeijer/terminal";
        console.warn(
            `'powerlineLabel' will be moved from ${current} to ${future} soon`
        );
    });
    return `\x1b[7m ${text} \x1b[27m\uE0B0`;
}
