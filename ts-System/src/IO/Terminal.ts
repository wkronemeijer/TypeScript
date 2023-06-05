// Cant find what makes a terminal different from a console
// so sorry people, but im using terminal to refer to a custom console implementation.
// but terminal is larger than a console, and we are extending the built-in console to do some cool tricks

// TODO: Untangle the giant mess that is this file
// TODO: Make this an interface thing, so both WebSytem and NodeSystem can implement it 

import { inspect, InspectOptions } from "util";

import { LogMessageFormatter, LogMessageFormatter_Powerline, LogMessageFormatter_Simple } from "../Text/Console/LogMessageFormatter";
import { StringEnum_create, StringEnum_Member } from "../Data/Textual/StringEnum";
import { Function_includeProperties } from "../Function";
import { Map_fromPartialDictionary } from "../Collections/Map";
import { TimingReport_toString } from "../Text/Console/TimingReportFormatter";
import { ArrayMember } from "../Data/Enumeration";
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

export type  UserLogChannel = StringEnum_Member<typeof UserLogChannel>;
export const UserLogChannel = StringEnum_create([
    "info",  // non-essential log
    "log",   // primary user-facing output.
    "warn",  // warning (duh)
    "error", // error (duh)
] as const).withDefault("log");

export type  DeveloperLogChannel = StringEnum_Member<typeof DeveloperLogChannel>;
export const DeveloperLogChannel = StringEnum_create([
    "trace", // println debugging
    "perf",  // performance
    "meta", // everything else
] as const).withDefault("meta");

// >>> Add a custom color here <<<
const colorByChannel = Map_fromPartialDictionary<LogChannel, AnsiColor>({
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

export type  LogChannel = StringEnum_Member<typeof LogChannel>;
export const LogChannel = StringEnum_create([
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

function getInitialTarget(channel: LogChannel): Target {
    return channel !== "error" ? stdout : stderr;
}

function getInitialIsEnabled(channel : LogChannel): boolean {
    // TODO: Add a check for DEV_MODE
    return true;
}

function getInitialHasLabel(channel : LogChannel): boolean {
    return DeveloperLogChannel.hasInstance(channel);
}

const maxChannelWidth = from(LogChannel.values).max(channel => channel.length);

/////////////////////
// LoggingFunction //
/////////////////////

export interface LoggingFunction {
    /** Logs the given value to the appropriate standard output, and a newline. */
    (value: unknown): void;
}

interface TargetFunctionality {
    /** Output of this channel is redirected to this {@link NodeJS.WriteStream}. */
    target: Target;
    
    /** Prints its argument to this channel. */
    write(value: unknown): void;
    /** Prints its argument to this channel, and appends a newline. */
    writeLine(value?: unknown): void;
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
    measureTimeAsync<T>(label: string, func: () => Promise<T>): Promise<T>;
    
    passthrough<T>(x: T): T;
}

interface Augmented
extends TargetFunctionality, ChannelFunctionality, BonusFunctionality { }

export interface AugmentedLoggingFunction
extends Augmented, LoggingFunction { }

const formatMessage: LogMessageFormatter = hasColorDisplay ? 
    LogMessageFormatter_Powerline : 
    LogMessageFormatter_Simple
;

function AugmentedLoggingFunction_create(channel: LogChannel): AugmentedLoggingFunction {
    let target    = getInitialTarget(channel);
    let isEnabled = getInitialIsEnabled(channel);
    let hasLabel  = getInitialHasLabel(channel);
    
    // Logging functionality
    const logger: LoggingFunction = (value: unknown): void => {
        // Check level
        if (isEnabled) {
            __writeLine(target, formatMessage({
                channel, 
                moment: new Date,
                message: __repr(value),
                color: colorByChannel.get(channel),
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
        
        write:       value => isEnabled && __write    (target, __repr(value)),
        writeLine:   value => isEnabled && __writeLine(target, __repr(value)),
        
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
        async measureTimeAsync(label, func) {
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
    measureTimeAsync: devLoggers.perf.measureTimeAsync,
    passthrough: userLoggers.log.passthrough,
};

/** Dedicated developer console. */
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
