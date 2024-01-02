import { StringEnum, Thunk, clamp, collect, panic, pass, swear, terminal } from "@wkronemeijer/system";

import { Directory, File } from "../../IO/FileSystem/FileObject";

//////////////////
// Capabilities //
//////////////////

type AliasCapability<T> = {
    readonly alias?: string;
    readonly aliases?: readonly string[];
};

type DescriptionCapability<T> = {
    readonly description?: string;
};

type ArityCapability<T> = {
    readonly isNullary?: boolean;
};

type ParseCapability<T> = {
    readonly parse: (x: string) => T;
    readonly stringify?: (x: T) => string;
};

type ValidateCapability<T> = {
    readonly validate?: (x: T) => void;
};

type AmbientValidateCapability<T> = {
    readonly ambientValidate?: (x: T) => void;
};

type AmbientDefaultCapability<T> = { 
    readonly getAmbientDefault?: Thunk<T> 
};

type BaseCapabilities<T> = (
    & AliasCapability<T>
    & DescriptionCapability<T>
);

type CommonCapabilities<T> = BaseCapabilities<T>;

// type ExtensionCapabilities<T> = 
//     & AliasCapability<T>
//     & DescriptionCapability<T>
//     & ArityCapability<T>
//     & ValidateCapability<T>
// ;
// Kinda of like: command-bound parameters, and type-bound parameters
// as the type is fixed for most tools.* functions

type AllCapabilities<T> = (
    & AliasCapability<T>
    & DescriptionCapability<T>
    & ArityCapability<T>
    & ValidateCapability<T>
    & ParseCapability<T>
    & AmbientDefaultCapability<T>
    & AmbientValidateCapability<T>
);

// Leads to a model of "last moment" and "already provided"

//////////////////
// CliParameter //
//////////////////

export interface CliParameter<T> {
    readonly description: string;
    readonly aliases: readonly string[];
    readonly hasArgument: boolean;
    readonly parse: (string: string) => T;
    readonly validate: (x: T) => void;
    readonly stringify: (x: T) => string;
    readonly getDefault: Thunk<T> | undefined;
    readonly getAmbientDefault: Thunk<T> | undefined;
}

const getAllAliases = collect(function* (
    options: AliasCapability<unknown>,
): Iterable<string> {
    if (options.alias) {
        yield options.alias;
    }
    if (options.aliases) {
        yield* options.aliases;
    }
});

export function CliParameter<T>(
    options: AllCapabilities<T>,
): CliParameter<T> {
    const description = options.description ?? "(no description)";
    const hasArgument = !options.isNullary;
    const aliases     = getAllAliases(options);
    
    const getAmbientDefault = options.getAmbientDefault;
    const getDefault        = undefined;
    const stringify         = options.stringify ?? String;
    const validate          = options.validate  ?? pass;
    const parse             = options.parse;
    
    return {
        description,
        aliases,
        hasArgument,
        getDefault,
        getAmbientDefault,
        stringify,
        validate,
        parse,
    };
}

export function CliParameter_isRequired(
    self: CliParameter<unknown>,
): boolean {
    return self.getDefault === undefined;
}

// maybe an extend version?
// and the other ones defined as 
// const CliDirectoryParameter = CliParameter_createDerived
// you wouldn't do 2 levels most of the time. 

//////////////////////////
// Combinator (sort-of) //
//////////////////////////

export function CliParameter_makeOptional<T>(
    self: CliParameter<T>
): CliParameter<T | undefined> {
    return {
        ...self,
        validate(x) {
            if (x !== undefined) {
                return self.validate?.(x);
            }
        },
        stringify(x) {
            if (x !== undefined) {
                return self.stringify?.(x);
            } else {
                return "undefined";
            }
        },
        getDefault() {
            return undefined;
        },
    };
}

type DefaultCapability<T> = 
    | { readonly default   : T        }
    | { readonly getDefault: Thunk<T> }
;

export function CliParameter_useAmbientDefault<T>(
    self: CliParameter<T>,
    overrideAmbientDefault?: DefaultCapability<T>,
): CliParameter<T> {
    let getDefault: Thunk<T> | undefined;
    if (overrideAmbientDefault !== undefined) {
        if ("default" in overrideAmbientDefault) {
            const value = overrideAmbientDefault.default;
            getDefault = () => value;
        } else {
            getDefault = overrideAmbientDefault.getDefault;
        }
    } else {
        swear(self.getDefault === undefined, "Default already set.");
        getDefault = self.getAmbientDefault;
    }
    
    return {
        ...self,
        getDefault,
    };
}

///////////////////////
// Common parameters //
///////////////////////

/** 
 * A simple boolean flag. 
 * 
 * **NB**: you must manually make it optional. 
 */
export function CliFlagParameter(options?:
    & BaseCapabilities<boolean>
): CliParameter<boolean> {
    return CliParameter<boolean>({
        ...options,
        isNullary: true,
        parse: () => true,
        getAmbientDefault: () => false,
    });
}
/*
RE: Always optional

all things can be required, some can implicitly be optional
flag is always optional, `optional(flag())` looks silly.
...but it does look consistent.

Although, a 
"I-know-what-I-am-doing": flag()
required flag makes a lot of sense...

Note that PS doesn't have this problem, because optional is the default
...because they spray `null` everywhere. 


*/

const { isFinite, isInteger } = Number;

type IntegralParameters = CommonCapabilities<number> & {
    readonly minimum?: number;
    readonly maximum?: number;
}

type RationalParameters = IntegralParameters & {
    readonly isInteger?: boolean;
    readonly isFinite?: boolean;
}

export function CliNumberParameter(options?: 
    & RationalParameters
): CliParameter<number> {
    const { 
        minimum: min = -Infinity, 
        maximum: max =  Infinity, 
        isFinite : shouldBeFinite ,
        isInteger: shouldBeInteger,
    } = options ?? {};
    
    return CliParameter<number>({
        ...options,
        parse: Number,
        validate(value) {
            swear(!isNaN(value), "Value should be a number.");
            if (shouldBeFinite) {
                swear(isFinite(value), "Value should be finite.");
            }
            if (shouldBeInteger) {
                swear(isInteger(value), "Value should be an integer.");
            }
            swear(min <= value, `Value should be atleast ${min}.`);
            swear(value <= max, `Value should be atmost ${max}.`);
        },
        getAmbientDefault() {
            return clamp(min, 0, max);
        },
    });
}

export function CliIntegerParameter(options?: 
    & IntegralParameters
): CliParameter<number> {
    return CliNumberParameter({ ...options, isInteger: true });
}

export function CliStringParameter(options?: 
    & CommonCapabilities<string>
): CliParameter<string> {
    return CliParameter<string>({
        ...options,
        parse: String,
        getAmbientDefault() {
            return "";
        },
    });
}

export function CliEnumParameter<const E extends string>(options: 
    & CommonCapabilities<E>
    & {
        readonly values: StringEnum<E>
    }
): CliParameter<E> {
    const { check, default: defaultValue } = options.values;
    
    return CliParameter<E>({
        ...options,
        parse: check,
        getAmbientDefault() {
            return defaultValue;
        },
    });
}

////////////////////////////
// File system parameters //
////////////////////////////
// Included because they are very common.

export function CliFileParameter(options: 
    & CommonCapabilities<File>
): CliParameter<File> {
    return CliParameter<File>({
        ...options,
        parse(path) {
            return new File(path);
        },
        validate(file) {
            swear(file.isFile(), "Path is not a file.");
        },
        stringify(file) {
            return file.path;
        },
    });
}

export function CliDirectoryParameter(options?: 
    & CommonCapabilities<Directory>
): CliParameter<Directory> {
    return CliParameter<Directory>({
        ...options,
        parse(path) {
            return new Directory(path);
        },
        validate(dir) {
            swear(dir.isDirectory(), "Path is not a directory.");
        },
        stringify(dir) {
            return dir.path;
        },
        getAmbientDefault: Directory.cwd,
    });
}
