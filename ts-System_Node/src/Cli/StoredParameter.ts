import { Thunk, panic } from "@wkronemeijer/system";
import { CliParameter } from "./Parameters/Parameter";
import { CliParameterLabel } from "./Parameters/ParameterLabel";

////////////////////
// Implementation //
////////////////////

export interface StoredCliParameter<T> {
    readonly name: string;
    readonly label: CliParameterLabel;
    readonly key: string | number;
    readonly index: number | undefined;
    readonly allNames: readonly string[];
    readonly description: string;
    readonly isRequired: boolean;
    readonly isPositional: boolean;
    readonly hasArgument: boolean;

    getValue(argument?: string): T;
}

interface StoredParameterConstructor {
    new<T>(key: string | number, param: CliParameter<T>): StoredCliParameter<T>;
}

export const StoredCliParameter
:            StoredParameterConstructor 
= class      StoredParameterImplementation<T>
implements   StoredCliParameter<T> {
    readonly label: CliParameterLabel;
    readonly name: string;
    readonly index: number | undefined;
    readonly allNames: readonly string[];
    readonly description: string;
    readonly isRequired: boolean;
    readonly hasArgument: boolean;
    
    get isPositional(): boolean {
        return this.index !== undefined;
    }
    
    private readonly innerParse: (string: string) => T;
    private readonly validate: (x: T) => void;
    private readonly getDefault: Thunk<T> | undefined;
    
    constructor(readonly key: string | number, param: CliParameter<T>) {
        const name = this.name = key.toString();
        this.label = CliParameterLabel(name);
        
        this.description = param.description;
        this.hasArgument = param.hasArgument;
        this.allNames    = [name, ...param.aliases];
        this.name = name;
        
        this.getDefault = param.getDefault;
        this.innerParse = param.parse;
        this.validate = param.validate;

        this.isRequired = this.getDefault !== undefined;
    }
    
    getValue(argument?: string): T {
        let value: T;
        if (argument !== undefined) {
            value = this.innerParse(argument);
        } else if (this.getDefault !== undefined) {
            value = this.getDefault();
        } else {
            panic(`No default for paramater '${this.name}'.`);
        }
        this.validate(value);
        return value;
    }
};
