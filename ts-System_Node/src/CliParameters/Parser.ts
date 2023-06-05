import { ExpandType, panic } from "@wkronemeijer/system";






type Field<K extends string, V> = { readonly [P in K]: V }

type ParameterKind = 
    | "flag"
    | "value"
;

interface Parameter_ConfigurableProperties {
    readonly isRequired: boolean;
    readonly alias: string;
    readonly aliases: string[];
    readonly shortName: string;
    readonly description: string;
}

interface Parameter_Base<K extends ParameterKind, T>
extends   Parameter_ConfigurableProperties {
    readonly name: string;
    readonly kind: K;
    readonly arity: number;
    readonly isPositional: boolean;
    readonly default: T;
}

interface FlagParameter extends Parameter_Base<"flag", boolean> {
    readonly arity: 0;
}

interface ValueParameter extends Parameter_Base<"value", string> {
    readonly arity: 1;
}

type Parameter =
    | FlagParameter
    | ValueParameter
;

interface OptionParser<P extends object> {
    addPositional<K extends string>(key: K, options?: Parameter_ConfigurableProperties): OptionParser<ExpandType<P & Field<K, string >>>;
    addOption    <K extends string>(key: K, options?: Parameter_ConfigurableProperties): OptionParser<ExpandType<P & Field<K, string >>>;
    addFlag      <K extends string>(key: K, options?: Parameter_ConfigurableProperties): OptionParser<ExpandType<P & Field<K, boolean>>>;
    
    parseArgs(args: string[]): P;
}


declare const p: OptionParser<{}>;



interface SubcommandField<K extends string, P> { 
    readonly subcommand: K;
    readonly parsedArguments: P;
};

interface CommandParser<PU extends SubcommandField<string, any>> {
    addDefaultSubcommand<P extends object>(options: OptionParser<P>): CommandParser<PU | SubcommandField<"default", P>>;
    addSubcommand<K extends string, P extends object>(name: K, options: OptionParser<P>): CommandParser<PU | SubcommandField<K, P>>;
    
    parseArgs(args: string[]): PU;
}



interface OptionParserConstructor {
    new(): OptionParser<{}>;
}

interface CommandParserConstructor {
    new(): CommandParser<never>;
}


const defaultSubcommandName = "default";

const CommandParser
:             CommandParserConstructor 
= class       CommandParserImpl<PU extends SubcommandField<string, any>> 
implements    CommandParser<PU> {
    
    private subcommands = new Map<string, OptionParser<{}>>;
    
    constructor() {
        
    }
    
    
    
    
    addDefaultSubcommand<P extends object>(options: OptionParser<P>): CommandParser<PU | SubcommandField<typeof defaultSubcommandName, P>> {
        
        
        
        return this;
    }
    
    addSubcommand<K extends string, P extends object>(name: K, options: OptionParser<P>): CommandParser<PU | SubcommandField<K, P>> {
        
        
        return this;
    }
    
    parseArgs(args: string[]): PU {
        const actualSubcmd = args[0];
        
        for (const [subcommand, parser] of this.subcommands) {
            if (subcommand === actualSubcmd) {
                const parsedArguments = parser.parseArgs(args.slice(1));
                
                return { subcommand, parsedArguments } as PU;
            }
        }
        
        panic();
    }
};

