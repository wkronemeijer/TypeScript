import { AnsiColor, AnsiTextStyle_set, AnsiTextStyle_use, SgrCommand_ResetAll } from "./TextDecoration";
import { LogChannel } from "../../IO/Terminal";
import { StringBuilder } from "../StringBuilder";

// TODO: Unify, and strip escape codes when outputting to not isatty

export interface LogMessage {
    readonly channel: LogChannel;
    readonly moment: Date;
    readonly message: string;
    readonly color?: AnsiColor;
    readonly showLabel?: boolean;
    readonly maxChannelLength: number;
}

export interface LogMessageFormatter {
    (req: LogMessage): string;
}

const arrow = '\uE0B0';

function clockDigit(number: number): string {
    return (
        number
        .toString()
        .padStart(2, '0')
    );
}

function Date_toHHmm(self: Date): string {
    return `${
        clockDigit(self.getHours())
    }:${
        clockDigit(self.getMinutes())
    }`;
}

export const LogMessageFormatter_Powerline: LogMessageFormatter = ({ 
    channel, 
    message, 
    moment,
    color, 
    maxChannelLength, 
    showLabel,
}) => {
    const result = new StringBuilder;
    
    if (showLabel) {
        const { 
            apply: setBg, 
            unset: unsetBg, 
        } = AnsiTextStyle_use({ background: color ?? "white" });
        
        const { 
            apply: setBold, 
            unset: unsetBold,
        } = AnsiTextStyle_use({ fontWeight: "bold" });
        
        result.append(setBg);
        result.append(' ')
        
        //////////
        // Time //
        //////////
        
        result.append(Date_toHHmm(moment));
        result.append(' ');
        
        ///////////
        // Label //
        ///////////
        
        result.append(setBold);
        result.append(channel.padEnd(maxChannelLength));
        result.append(' ')
        result.append(unsetBold);
        
        result.append(unsetBg);
    }
    
    result.append(AnsiTextStyle_set({ color }));
    if (showLabel) {
        result.append(arrow);
        result.append(' ');
    }
    result.append(message || ' '); // reminder: !!"" == false
    result.append(SgrCommand_ResetAll); // don't taint the console
    
    return result.toString();
}

///////////////////
// Without color //
///////////////////

const matchArrow = /(.*)\uE0B0/;
const matchSgr = /\x1B\[[\d,]+m/g; // g needed by replaceAll

export const LogMessageFormatter_Simple: LogMessageFormatter = req => {
    return (
        LogMessageFormatter_Powerline(req)
        .replaceAll(matchSgr, "")
        .replace(matchArrow, (_, label: string) => `[${label}]`)
    );
}
