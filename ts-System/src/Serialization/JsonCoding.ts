import { hasKey, couldBeInstanceOf, hasProperty } from "../Types/(deprecated) RuntimeTyping";
import { assert, requires, ensures } from "../Assert";
import { String_isWhitespace } from "../Text/String";
import { specify } from "../Testing/Testing";


//////////////
// Encoding //
//////////////

/** Function that converts from live to inert values. */
interface Encoder<TLive, TInert> { (live : TLive ): TInert; }
type AnyEncoder = Encoder<any, any>;

// Encoders are stored on the object itself (on the prototype, to be exact)
const  encoderFunction = Symbol("encoder function");
const encoderClassName = Symbol("encoder class name");

interface Encodable {
    [encoderClassName]: string;
    [encoderFunction]: AnyEncoder;
}

function isEncodable(value: unknown): value is Encodable {
    return (
        hasProperty(value, encoderClassName,   "string") &&
        hasProperty(value,  encoderFunction, "function")
    );
}

function encode(value: unknown): unknown {
    requires(isEncodable(value), `Value "${value}" is not encodable.`);
    const result: Decodable = {
        $class: value[encoderClassName],
        $value: value[encoderFunction](value),
    };
    ensures(isDecodable(result), `Result of encoding "${value}" is not decodable.`);
    return result;
}

//////////////
// Decoding //
//////////////

/** Function that converts from inert to live values. */
interface Decoder<TLive, TInert> { (inert: TInert): TLive ; }
type AnyDecoder = Decoder<any, any>;

// Decoders are indexed on the class name found in the JSON.
const decoderRegistry = new Map<string, AnyDecoder>();

interface Decodable {
    $class: string;
    $value: unknown;
}

const decodableClassKey: keyof Decodable = "$class";
const decodableValueKey: keyof Decodable = "$value";

function isDecodable(value: unknown): value is Decodable {
    return (
        hasProperty(value, decodableClassKey, "string") && 
        hasKey(value, decodableValueKey)
    );
}

function decode(value: unknown): unknown {
    requires(isDecodable(value), `Value "${value}" is not decodable.`);
    const className = value.$class;
    const decoder = decoderRegistry.get(className);
    assert(decoder, `No decoder found for class "${className}"`);
    const result = decoder(value.$value);
    ensures(isEncodable(result), `Result of a decoder is not encodable.`);
    return result; 
}


/////////////////////////////////////
// Combining encoders and decoders //
/////////////////////////////////////

/** Combines an encoder and a decoder into one object. */
interface Coder<TLive, TInert> {
    encode: Encoder<TLive, TInert>;
    decode: Decoder<TLive, TInert>;
}

interface NamedPrototypeOwner<T> {
    name: string;
    prototype: T;
}
// BUG: name is "" for anonymous functions, so have to check
// Also it is not a mechanism for qualified names

export function attachCoder<TLive, TInert>(
    constructor: NamedPrototypeOwner<TLive>, 
    coder: Coder<TLive, TInert>,
): void {
    const className = constructor.name;
    assert(!decoderRegistry.has(className), `A coder has already been registered for "${className}".`);
    
    // Attach encoder
    const base = constructor.prototype;
    
    Object.defineProperty(base, encoderClassName, { value: className    });
    Object.defineProperty(base, encoderFunction , { value: coder.encode });
    
    // Attach decoder
    decoderRegistry.set(className, coder.decode);
    
    ensures(isEncodable(base));
}

export function hasCoder(constructor: NamedPrototypeOwner<any>): boolean {
    return couldBeInstanceOf<Encodable>(constructor.prototype, encoderClassName, encoderFunction);
}

////////////////////
// Default coders //
////////////////////

// Map 
type  LiveMap = Map<unknown, unknown>;
type InertMap = readonly [unknown, unknown][];
attachCoder<LiveMap, InertMap>(Map, {
    encode: live  => Array.from(live.entries()),
    decode: inert => new Map(inert),
});

// FIXME: undefined entries cause problem, as JSON does omits undefined values.

// Set
type  LiveSet = Set<unknown>;
type InertSet = readonly unknown[];
attachCoder<LiveSet, InertSet>(Set, {
    encode: live  => Array.from(live),
    decode: inert => new Set(inert),
});

// Date
type  LiveDate = Date;
type InertDate = number; 
attachCoder<LiveDate, InertDate>(Date, {
    encode: live  => live.getTime(),
    decode: inert => new Date(inert),
});

// BigInt was removed, because you cannot check if it is encodable or not.
// (`in` only works on objects)

///////////////////////////////
// Custom revive and replace //
///////////////////////////////

/** Used when stringifying. `undefined` values dissappear in the result. */
type Replacer = (key: string, value: unknown) => unknown;
/** Used when parsing Json.  */
type Reviver = (key: string, value: unknown) => unknown;

const replacer: Replacer = (_, value) => isEncodable(value) ? encode(value) : value;
const  reviver: Reviver  = (_, value) => isDecodable(value) ? decode(value) : value;

/////////////////////////////
// Putting it all together //
/////////////////////////////

/** 
 * Stringifies a value, whilst encoding any codable objects. 
 * Returns `undefined` if the encoding fails. 
 * @deprecated Really needs the io-ts treatment.
 */
export function encodeJson(value: unknown, spaces?: 1 | 2 | 3 | 4): string | Error {
    try {
        return JSON.stringify(value, replacer, spaces);
    } catch (error) {
        if (error instanceof Error) {
            return error;
        } else throw error;
    }
}

/** 
 * Parses a JSON string, whilst decoding any codable objects. Returns `defaultResult` (an otherwise invalid JSON value) when decoding fails. 
 * @deprecated Really needs the io-ts treatment. 
 */
export function decodeJson<T = never>(json: string): T | undefined | Error {
    try {
        if (!String_isWhitespace(json)) {
            return JSON.parse(json, reviver);
        } else {
            return undefined;
        } 
    } catch (error) {
        if (error instanceof Error) {
            return error;
        } else throw error;
    }
}

/////////////
// Testing //
/////////////

specify("JsonCoding", it => {
    
    specify("Default coding", it => {
        it("supports Map", () => {
            assert(isEncodable(new Map));
        });
        
        it("supports Set", () => {
            assert(isEncodable(new Set));
        });
        
        it("supports Date", () => {
            assert(isEncodable(new Date));
        });
        
        it("does not support Array", () => {
            assert(!isEncodable(new Array));
        });
    });
    
    specify("Recoding", it => {
        const key1 = "hello";
        const key2 = "goodbye";
        const key3 = "there"
        const value1 = 42;
        const value2 = 69;
        const value3 = 420;
        
        
        const fidget = new Map<any, any>([
            [key1, new Map([
                [key1, value1],
                [key2, value2],
                [key3, value3],
            ])],
            [key2, new Set([
                value1,
                value2,
                value3,
            ])],
            [key3, {
                x: value1,
                y: value2,
                z: value3,
            }]
        ]);
        let encoded!: string;
        it("encodes a normal value", () => {
            const result = encodeJson(fidget);
            assert(!(result instanceof Error), result.toString());
            encoded = result;
        });
        
        let recoded!: typeof fidget;
        it("decodes the encoded value", () => {
            const result = decodeJson(encoded!) as any;
            assert(!(result instanceof Error), result.toString());
            recoded = result;
        });
        
        it("contains the same values", () => {
            let iota = 1;
            
            assert(recoded.get(key1)!.get(key1) === value1, (iota++).toString());
            assert(recoded.get(key1)!.get(key2) === value2, (iota++).toString());
            assert(recoded.get(key1)!.get(key3) === value3, (iota++).toString());
            
            assert(recoded.get(key2)!.has(value1), (iota++).toString());
            assert(recoded.get(key2)!.has(value2), (iota++).toString());
            assert(recoded.get(key2)!.has(value3), (iota++).toString());
            
            assert(recoded.get(key3)!.x === value1, (iota++).toString());
            assert(recoded.get(key3)!.y === value2, (iota++).toString());
            assert(recoded.get(key3)!.z === value3, (iota++).toString());
        });
    });
});
