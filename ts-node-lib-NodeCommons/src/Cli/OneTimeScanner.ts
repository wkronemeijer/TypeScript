import {  swear } from "@wkronemeijer/system";
import { StoredCliParameter } from "./StoredParameter";
import { CliParameterLabel, CliParameterLabel_tryParseArgument } from "./Parameters/ParameterLabel";
import { CliParseResult, ExtendedCliParseResult } from "./ParseResult";

interface OneTimeScanner_Options {
    readonly kind: string;
    readonly args: readonly string[];
    readonly useRestArguments: boolean;
    readonly parametersByIndex: ReadonlyArray<StoredCliParameter<any>>;
    readonly parametersByLabel: ReadonlyMap<CliParameterLabel, StoredCliParameter<any>>;
}

/** @internal */
export class CliSubcommand_OneTimeScanner {
    private readonly result: ExtendedCliParseResult;
    private readonly rest = new Array<string>; // NB: Mutable list
    private readonly useRest: boolean;
    private readonly parametersByIndex: OneTimeScanner_Options["parametersByIndex"];
    private readonly parametersByLabel: OneTimeScanner_Options["parametersByLabel"];
    private readonly paramsVisited = new Set<string | number>;
    
    private currentIndexedParameter = 0;
    private currentArgument = 0;
    
    /** Set when a lone "--" is encountered. */
    private verbatimEnabled = false;
    
    readonly args: readonly string[];
    
    constructor(options: OneTimeScanner_Options) {
        this.parametersByIndex = options.parametersByIndex;
        this.parametersByLabel = options.parametersByLabel;
        this.useRest           = options.useRestArguments;
        this.args              = options.args;
        
        this.result = {
            kind: options.kind,
            rest: this.rest,
        };
    }
    
    private addField<T>(
        key: string | number,
        param: StoredCliParameter<T>,
        argument?: string | undefined
    ): void {
        swear(!this.paramsVisited.has(key), () => 
            `Already set parameter '${key}'.`);
        this.result[key] = param.getValue(argument);
        this.paramsVisited.add(key);
    }
    
    private get isAtEnd(): boolean {
        return this.currentArgument >= this.args.length;
    }
    
    private advance(): string | undefined {
        const result = this.args[this.currentArgument++];
        console.log("advance: ", result);
        return result;
    }
    
    private pushRestArgument(arg: string): void {
        swear(this.useRest, 
            "This subcommand does not accept rest arguments.");
        this.rest.push(arg);
    }
    
    private scanArgument(): void {
        const word = this.advance();
        let label: CliParameterLabel | undefined;
        
        if (word === undefined) {
            return;
        } else if (word === "--") {
            this.verbatimEnabled = true;
            return;
        } else if (this.verbatimEnabled) {
            this.pushRestArgument(word);
        } else if (label = CliParameterLabel_tryParseArgument(word)) {
            const param = this.parametersByLabel.get(label);
            swear(param, () => 
                `Unknown parameter '${label}'.`);
            let arg: string | undefined = "";
            // Nullary parameters receive "", not undefined.
            // Passing undefined retrieves the default.
            if (param.hasArgument) {
                arg = this.advance();
                swear(arg !== undefined, () => 
                    `Parameter '${param.name}' requires an argument.`);
            }
            this.addField(word, param, arg);
        } else { // positional
            const index = this.currentIndexedParameter++;
            const param = this.parametersByIndex[index];
            if (param) {
                this.addField(index, param, word);
            } else {
                this.pushRestArgument(word);
            }
        }
    }
    
    private addMissingParameters(): void {
        for (const [index, param] of this.parametersByIndex.entries()) {
            if (!this.paramsVisited.has(index)) {
                this.addField(index, param);
            }
        }
        
        for (const [label, param] of this.parametersByLabel) {
            if (!this.paramsVisited.has(label)) {
                this.addField(label, param);
            }
        }
    }
    
    run(): CliParseResult {
        while (!this.isAtEnd) {
            this.scanArgument();
        }
        this.addMissingParameters();
        return this.result;
    }
}
