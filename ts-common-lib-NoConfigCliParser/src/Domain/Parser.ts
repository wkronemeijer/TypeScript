const {has: raw_has, get: raw_get} = Reflect;
/** 
 * Placeholder value for named arguments without a value.
 * It is truthy, so you can use a simple `if` check. 
 */
export const NamedArgumentPlaceholder: string = '' + true;
const NamedArgumentPrefix = '-';
const LabelValueSeperator = '=';

/** 
 * Normalized name of parameter. 
 * Used for accessing the final results. 
 * 
 * Valid parameter names are never empty.
 */
type     ParameterName = string & {readonly ඞ_ParameterName: never};
function ParameterName(value: (
    | string 
    | symbol 
    | undefined
)): ParameterName | undefined {
    if (typeof value !== "string") {return}
    return ((
        value
        .toLowerCase()
        .replace(/[\-\_]/g, "")
    ) as ParameterName) || undefined;
}

type ArgumentDictionary = {readonly [s: string]: string | undefined};

const NormalizedGetHandler: ProxyHandler<ArgumentDictionary> = {
    get(target, property) {
        if (raw_has(target, property)) {
            return raw_get(target, property);
        } else {
            const parameter = ParameterName(property);
            if (parameter) {
                return raw_get(target, parameter);
            }
        }
    },
};

function proxifyMap(map: ReadonlyMap<ParameterName, string>): ArgumentDictionary {
    const object = {} as ArgumentDictionary;
    for (const [name, value] of map) {
        (object as any)[name] = value;
    }
    return new Proxy(object, NormalizedGetHandler);
}

function parseArgument(arg: string): [ParameterName, string] | undefined {
    let name: ParameterName | undefined;
    let value: string;
    
    const index = arg.indexOf(LabelValueSeperator);
    if (index >= 0) {
        name  = ParameterName(arg.slice(0, index));
        value = arg.slice(index + LabelValueSeperator.length);
    } else {
        name  = ParameterName(arg);
        value = NamedArgumentPlaceholder;
    }
    
    if (!name) {return}
    return [name, value]
}

interface ParsedArgumentList {
    readonly positionalArguments: readonly string[];
    readonly namedArguments: ArgumentDictionary;
}

export function parseArgumentList(argumentsIter: Iterable<string>): ParsedArgumentList {
    const positionalArguments = new Array<string>;
    const namedArguments = new Map<ParameterName, string>;
    
    for (const arg of argumentsIter) {
        if (arg.startsWith(NamedArgumentPrefix)) {
            const pair = parseArgument(arg);
            if (pair) {
                namedArguments.set(...pair);
            } else {
                // ignore
            }
        } else {
            positionalArguments.push(arg);
        }
    }
    
    return {
        positionalArguments, 
        namedArguments: proxifyMap(namedArguments),
    }
}
