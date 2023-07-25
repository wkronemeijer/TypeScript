import { panic } from "@wkronemeijer/system";

import { CliSubcommandTree, CliSubcommand_AcceptRestArguments } from "./CommandTree";
import { CliSubcommand_OneTimeScanner } from "./OneTimeScanner";
import { StoredCliParameter } from "./StoredParameter";
import { CliParameterLabel } from "./Parameters/ParameterLabel";
import { CliParseResult } from "./ParseResult";
import { CliParameter } from "./Parameters/Parameter";

function isIndexedParameterLabel(name: string): boolean {
    return !isNaN(Number(name));
}

/** @internal */
export interface CliSubcommandParser {
    readonly subcommandName: string;
    readonly usesRestArguments: boolean;
    
    parse(args: readonly string[]): CliParseResult;
}

interface CliSubcommandParserConstructor {
    new(name: string, subtree: CliSubcommandTree): CliSubcommandParser;
}

/** @internal */
export const CliSubcommandParser
:            CliSubcommandParserConstructor 
= class      CliSubcommandParserImplementation
implements   CliSubcommandParser {
    readonly usesRestArguments: boolean;
    
    readonly numberedParameters = new Array<StoredCliParameter<any>>;
    readonly labeledParameters  = new Map<CliParameterLabel, StoredCliParameter<any>>;
    
    private registerNumberedParameter<T>(param: CliParameter<T>): void {
        const newIndex     = this.numberedParameters.length;
        const newParameter = new StoredCliParameter(newIndex.toString(), param);
        this.numberedParameters[newIndex] = newParameter;
    }
    
    private registerLabeledParameter<T>(name: string, param: CliParameter<T>): void {
        const targetToken       = CliParameterLabel(name);
        const existingParameter = this.labeledParameters.get(targetToken);
        if (existingParameter) {
            const storedName = existingParameter.name;
            panic(`Parameters named '${name}' and '${storedName}' conflict.`);
        }
        const newParameter = new StoredCliParameter(name, param);
        this.labeledParameters.set(targetToken, newParameter);
    }
    
    constructor(
        readonly subcommandName: string, 
        subtree: CliSubcommandTree,
    ) {
        this.usesRestArguments = subtree[CliSubcommand_AcceptRestArguments] ?? false;
        
        for (const name in subtree) {
            const param = subtree[name];
            if (param) {
                if (isIndexedParameterLabel(name)) {
                    this.registerNumberedParameter(param);
                } else {
                    this.registerLabeledParameter(name, param);
                }
            }
        }
    }
    
    parse(args: readonly string[]): CliParseResult {
        return new CliSubcommand_OneTimeScanner({
            kind: this.subcommandName,
            args, 
            useRestArguments: this.usesRestArguments,
            parametersByIndex: this.numberedParameters, 
            parametersByLabel: this.labeledParameters,
        }).run();
    }
}
