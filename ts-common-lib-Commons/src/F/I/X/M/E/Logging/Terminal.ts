// console but const and with some extra goodies.
// FEATURE: terminal.indent() and terminal.dedent() support, for making groups easier to make pretty.

import { LogChannel, DeveloperLogChannel, UserLogChannel } from "./LogChannel";
import { Function_includeProperties } from "../Data/Function/Function";
import { TimingReport_toString } from "../Text/TimingReportFormatter";
import { StringTargetLine } from "../Text/StringTarget";
import { LoggingFunction } from "./LoggingFunction";
import { stringBuild } from "../Text/StringBuilder";
import { Dictionary } from "../Collections/Dictionary";
import { LogMessage } from "./LogMessage";
import { Member } from "../Data/Enumeration";
import { __log } from "./Logger";

/////////////////////////
// Bonus functionality //
/////////////////////////

interface TargetFunctionality 
extends StringTargetLine {
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
    /** Prints the value and returns it. */
    passthrough<T>(x: T): T;
    
    /** Measures the time taken to execute the function, then returns its result. */
    measureTime<T>(label: string, func: () => T): T;
    /** Measures the time taken to execute the async function, then returns its result when resolved. */
    measureTime_async<T>(label: string, func: () => Promise<T>): Promise<T>;
    
}

interface AugmentedNonFunction
extends TargetFunctionality, ChannelFunctionality, BonusFunctionality { }

interface AugmentedLoggingFunction
extends AugmentedNonFunction, LoggingFunction { }

function AugmentedLoggingFunction(channel: LogChannel): AugmentedLoggingFunction {
    let isEnabled = true; // TODO: Add a check for DEV_MODE
    let hasLabel  = DeveloperLogChannel.hasInstance(channel);
    
    // Logging functionality
    const customLog: LoggingFunction = (value: unknown): void => {
        // Check level
        if (isEnabled) {
            __log(new LogMessage(value, channel, {
                showLabel: hasLabel,
                showTime: hasLabel,
            }));
        }
    };
    
    const augment: AugmentedNonFunction = {
        //////////////////////////
        // Target functionality //
        //////////////////////////
        
        writeLine: customLog, 
        appendLine: customLog,
        
        includeLine(buildable, ...args) {
            if (isEnabled && buildable) {
                customLog(stringBuild(buildable, ...args));
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
                customLog(`${key} = ${table[key]}`);
            }
        },
        measureTime(label, func) {
            const start  = Date.now();
            const result = func();
            const end    = Date.now();
            customLog(TimingReport_toString({ label, start, end }));
            return result;
        },
        async measureTime_async(label, func) {
            const start  = Date.now();
            const result = await func();
            const end    = Date.now();
            customLog(TimingReport_toString({ label, start, end }));
            return result;
        },
        passthrough(x) {
            customLog(x);
            return x;
        },
    };
    
    return Function_includeProperties(customLog, augment);
}

function createLoggers<SelectedChannels extends readonly LogChannel[]>(
    channels: SelectedChannels,
): Record<Member<SelectedChannels>, AugmentedLoggingFunction> {
    const result: Dictionary<AugmentedLoggingFunction> = {};
    for (const channel of channels) {
        result[channel] = AugmentedLoggingFunction(channel);
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
    passthrough: devLoggers.trace.passthrough,
};

/** Custom console. */
export const terminal = {
    ...userLoggers,
    ...devLoggers,
    ...bonus,
    writeLine: userLoggers.log.writeLine,
} as const;
