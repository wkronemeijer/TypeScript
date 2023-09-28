// Cant find what makes a terminal different from a console
// so sorry people, but im using terminal to refer to a custom console implementation.
// but terminal is larger than a console, and we are extending the built-in console to do some cool tricks

// TODO: Untangle the giant mess that is this file
// TODO: Make this an interface thing, so both WebSytem and NodeSystem can implement it 

import { inspect, InspectOptions } from "util";

import { LogMessageFormatter, LogMessageFormatter_getDefault } from "../Text/Console/LogMessageFormatter";
import { Function_includeProperties } from "../Data/Function";
import { Record_toPartialFunction } from "../Collections/Record";
import { TimingReport_toString } from "../Text/Console/TimingReportFormatter";
import { ArrayMember, Member } from "../Data/Enumeration";
import { StringBuildable } from "../Text/StringBuildable";
import { StringTarget } from "../Text/StringTarget";
import { stringBuild } from "../Text/StringBuilder";
import { StringEnum } from "../Data/Textual/StringEnum";
import { Dictionary } from "../Collections/Dictionary";
import { AnsiColor } from "../Text/Console/TextDecoration";
import { from } from "../Collections/Sequence";

// FEATURE: terminal.indent() and terminal.dedent() support, for making groups easier to make pretty.

const { stdin, stdout, stderr } = process;
const hasColorDisplay = stdout.isTTY;
const inspectOptions: InspectOptions = {
    colors: hasColorDisplay,
    showHidden: false,
    showProxy: false,
    depth: 0,
};

/////////////////////////////////////
// >>>                         <<< // 
// >>> Add new log levels here <<< //
// >>>            \/           <<< // 
/////////////////////////////////////

export type  UserLogChannel = Member<typeof UserLogChannel>;
export const UserLogChannel = StringEnum([
    "info",  // non-essential log
    "log",   // primary user-facing output.
    "warn",  // warning (duh)
    "error", // error (duh)
] as const).withDefault("log");

export type  DeveloperLogChannel = Member<typeof DeveloperLogChannel>;
export const DeveloperLogChannel = StringEnum([
    "trace", // println debugging
    "perf",  // performance
    "meta", // everything else
] as const).withDefault("meta");

// >>> Add a custom color here <<<
const colorByChannel = Record_toPartialFunction<LogChannel, AnsiColor>({
    warn : "yellow",
    error: "red",
    info : "black", // info should be SGR 90, that one is faded in both 
    trace: "magenta",
    perf : "blue",
    meta : "green",
    // Cyan is unused
});

/////////////////////////////////////
// >>>            /\           <<< // 
// >>> Add new log levels here <<< //
// >>>                         <<< // 
/////////////////////////////////////

export type  LogChannel = Member<typeof LogChannel>;
export const LogChannel = StringEnum([
    ...UserLogChannel.values,
    ...DeveloperLogChannel.values,
] as const).withDefault(UserLogChannel.default);

/////////////////////////
// Internal operations //
/////////////////////////

type Target = NodeJS.WriteStream;

const newline = '\n';
const bufferEncoding: BufferEncoding = "utf-8";

function __write(target: Target, value: string) {
    target.write(value, bufferEncoding);
}

function __writeLine(target: Target, value?: string) {
    // We access using the key, so console can be patched.
    if (value !== undefined) {
        __write(target, value);
    } 
    __write(target, newline);
}

// creats a representation of non-string arguments. String arguments are undisturbed.
function __repr(value: unknown): string {
    if (typeof value === "string") {
        return value;
    } else {
        return inspect(value, inspectOptions);
    }
}

// used for symmetry
const __build = stringBuild;

////////////////////////////////
// Basic terminal interaction //
////////////////////////////////

/** Reads a single line from `stdin`. */
function readLine(prompt?: string): Promise<string> {
    return new Promise(resolve => {
        if (prompt !== undefined) {
            stdout.write(prompt);
        }
        stdin.resume();
        stdin.once("data", buffer => {
            stdin.pause();
            resolve(buffer.toString(bufferEncoding));
        });
    });
}

/////////////
// Logging //
/////////////

function LogChannel_getInitialTarget(self: LogChannel): Target {
    return self !== "error" ? stdout : stderr;
}

function LogChannel_getInitialIsEnabled(self: LogChannel): boolean {
    // TODO: Add a check for DEV_MODE
    return true;
}

function LogChannel_getInitialHasLabel(self: LogChannel): boolean {
    return DeveloperLogChannel.hasInstance(self);
}

const maxChannelWidth = from(LogChannel.values).max(channel => channel.length);

/////////////////////
// LoggingFunction //
/////////////////////

export interface LoggingFunction {
    /** Logs the given value to the appropriate standard output, and a newline. */
    (value: unknown): void;
}

interface TargetFunctionality extends StringTarget {
    /** Output of this channel is redirected to this {@link NodeJS.WriteStream}. */
    target: Target;
    
    /** Prints its argument to this channel. */
    write(value: unknown): void;
    
    /** Prints its argument to this channel, and appends a newline. */
    writeLine(value?: unknown): void;
    
    /** Includes a {@link StringBuildable} in this channel. */
    include<TArgs extends readonly any[] = []>(
        buildable: StringBuildable<TArgs>,
        ...args: TArgs
    ): void;
    
    /** Includes a {@link StringBuildable} in this channel, and appends a newline. */
    includeLine<TArgs extends readonly any[] = []>(
        buildable: StringBuildable<TArgs>, 
        ...args: TArgs
    ): void;
}

interface ChannelFunctionality {
    readonly channel: LogChannel;
    
    /** Whether this channel is currently enabled (i.e. print to stdout when called). */
    readonly isEnabled: boolean;
    /** Whether this channel is currently labeled. */
    readonly hasLabel: boolean;
    
    /** Enable this channel. */
    enable(): void;
    /** Disable this channel, suppressing all messages. */
    disable(): void;
    /** Attaches a label to all messages from this channel. */
    attachLabel(): void;
    /** Detaches the label from all messages from this channel. */
    detachLabel(): void;
}

interface BonusFunctionality {
    /** 
     * Logs the properties of the given object to this channel, with 1 line for each property. 
     * ~~Useful to dump local vars with printLine debugging.~~ 
     */
    dumpLocals(value: Dictionary<unknown>): void;
    
    measureTime<T>(label: string, func: () => T): T;
    measureTime_async<T>(label: string, func: () => Promise<T>): Promise<T>;
    
    passthrough<T>(x: T): T;
}

interface Augmented
extends TargetFunctionality, ChannelFunctionality, BonusFunctionality { }

export interface AugmentedLoggingFunction
extends Augmented, LoggingFunction { }

const formatMessage: LogMessageFormatter = LogMessageFormatter_getDefault({ useColor: hasColorDisplay });

function AugmentedLoggingFunction_create(channel: LogChannel): AugmentedLoggingFunction {
    let target    = LogChannel_getInitialTarget(channel);
    let isEnabled = LogChannel_getInitialIsEnabled(channel);
    let hasLabel  = LogChannel_getInitialHasLabel(channel);
    
    // Logging functionality
    const logger: LoggingFunction = (value: unknown): void => {
        // Check level
        if (isEnabled) {
            __writeLine(target, formatMessage({
                channel, 
                moment: new Date,
                message: __repr(value),
                color: colorByChannel(channel),
                maxChannelLength: maxChannelWidth,
                showLabel: hasLabel,
            }));
        }
    };
    
    const augment: Augmented = {
        //////////////////////////
        // Target functionality //
        //////////////////////////
        
        get target()          { return target             },
        set target(newTarget) {        target = newTarget },
        
        write(value) {
            if (isEnabled) {
                __write(target, __repr(value));
            }
        },
        writeLine(value) {
            if (isEnabled) {
                __writeLine(target, __repr(value));
            }
        },
        
        append(string) {
            if (string) {
                this.write(string);
            }
        },
        
        appendLine(string) {
            this.append(string);
            this.writeLine();
        },
        
        include(buildable, ...args) {
            if (isEnabled) {
                __write(target, __build(buildable, ...args));
            }
        },
        includeLine(buildable, ...args) {
            if (isEnabled) {
                __writeLine(target, __build(buildable, ...args));
            }
        },
        
        ///////////////////////////
        // Channel functionality //
        ///////////////////////////
        
        get channel()   { return channel    },
        get isEnabled() { return isEnabled  },
        get hasLabel()  { return hasLabel   },
        
        enable     : () => isEnabled = true,
        disable    : () => isEnabled = false,
        attachLabel: () => hasLabel = true,
        detachLabel: () => hasLabel = false,
        
        /////////////////////////
        // Bonus functionality //
        /////////////////////////
        
        dumpLocals(table) {
            for (let key in table) {
                logger(`${key} = ${table[key]}`);
            }
        },
        measureTime(label, func) {
            const start  = Date.now();
            const result = func();
            const end    = Date.now();
            logger(TimingReport_toString({ label, start, end }));
            return result;
        },
        async measureTime_async(label, func) {
            const start  = Date.now();
            const result = await func();
            const end    = Date.now();
            logger(TimingReport_toString({ label, start, end }));
            return result;
        },
        passthrough(x) {
            logger(x);
            return x;
        },
    };
    
    return Function_includeProperties(logger, augment);
}

function createLoggers<SelectedChannels extends readonly LogChannel[]>(
    channels: SelectedChannels,
): Record<ArrayMember<SelectedChannels>, AugmentedLoggingFunction> {
    const result: Dictionary<AugmentedLoggingFunction> = {};
    for (const channel of channels) {
        result[channel] = AugmentedLoggingFunction_create(channel);
    }
    return result as any;
}

///////////////////////////////////
// Creation the terminal objects //
///////////////////////////////////

const userLoggers = createLoggers(UserLogChannel     .values);
const devLoggers  = createLoggers(DeveloperLogChannel.values);

const bonus: BonusFunctionality = {
    dumpLocals: devLoggers.trace.dumpLocals,
    measureTime: devLoggers.perf.measureTime,
    measureTime_async: devLoggers.perf.measureTime_async,
    passthrough: userLoggers.log.passthrough,
};

/** 
 * Dedicated developer console. 
 * @deprecated Use the developer channels on {@link terminal} instead.
 */
export const devTerminal = {
    ...devLoggers,
    ...bonus,
} as const;

/** Custom console. */
export const terminal = {
    ...userLoggers,
    ...devLoggers,
    ...bonus,
    write    : userLoggers.log.write,
    writeLine: userLoggers.log.writeLine,
    readLine,
} as const;
