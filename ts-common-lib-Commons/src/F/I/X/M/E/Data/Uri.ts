import {EquatableObject} from "../Traits/Eq/Equatable";
import {Printable} from "../Printable";

interface UriComponents {
    /**
     * The whole URL.
     * 
     * @example
     * "https://racecar:hunter2@some.domain.com:1028/path/to/file?query=fig&res=fog#references"
     */
    readonly href: string;
    
    /** 
     * @example 
     * "https:"
     */
    readonly protocol: string;
    
    /**
     * @example
     * "racecar"
     */
    readonly username: string;
    
    /**
     * @example
     * "hunter2"
     */
    readonly password: string;
    
    /**
     * @example 
     * "some.domain.com:1028"
     */
    readonly host: string;
    
    /**
     * @example
     * "some.domain.com"
     */
    readonly hostname: string;
    
    /**
     * @example
     * "1028"
     */
    readonly port: string;
    
    /**  
     * @example
     * "/path/to/file"
     */
    readonly pathname: string;
    
    /** 
     * @example
     * "?query=fig&res=fog"
     */
    readonly search: string;
    
    /** 
     * @example
     * #references
     */
    readonly hash: string;
}

/**
 * Immutable replacement for URL. 
 * 
 * All doc comments are based on `https://racecar:hunter2@some.domain.com:1028/path/to/file?query=fig&res=fog#references`.
 */
interface Uri 
extends UriComponents, EquatableObject, Printable {
    /**
     * @example
     * "https://some.domain.com:1028"
     */
    readonly origin: string;
    
    with(partial: Partial<UriComponents>): Uri;
    
    toUrl(): URL;
    toJSON(): string;
}

type UriLike = string | {readonly href: string};
type UriFactoryParameters = readonly [
    url: UriLike,
    base?: UriLike,
];

interface UriConstructor {
    new(...args: UriFactoryParameters): Uri;
    
    canParse(...args: UriFactoryParameters): boolean;
    parse(...args: UriFactoryParameters): Uri | null;
}

type  $move = typeof $move;
const $move = Symbol("move");

// IDEA: Use a proxy to block setting
// SearchParams remains however...

export const Uri
:            UriConstructor 
= class      UriImpl 
implements   Uri {
    readonly #url: URL;
    
    constructor(url: UriLike, base?: UriLike);
    constructor(_: $move, url: URL);
    constructor(url: UriLike | typeof $move, base?: UriLike) {
        if (url === $move && base instanceof URL) {
            this.#url = base;
        } else {
            this.#url = new URL(url.toString(), base?.toString());
        }
    }
    
    static canParse(url: UriLike, base?: UriLike): boolean {
        return URL.canParse(url.toString(), base?.toString());
    }
    
    static parse(url: UriLike, base?: UriLike): Uri | null {
        if (this.canParse(url, base)) {
            return new this(url, base);
        } else {
            return null;
        }
    }
    
    ////////////////////
    // Forward to URL //
    ////////////////////
    
    get href()    : string {return this.#url.href    }
    get hash()    : string {return this.#url.hash    }
    get host()    : string {return this.#url.host    }
    get hostname(): string {return this.#url.hostname}
    get password(): string {return this.#url.password}
    get pathname(): string {return this.#url.pathname}
    get port()    : string {return this.#url.port    }
    get protocol(): string {return this.#url.protocol}
    get search()  : string {return this.#url.search  }
    get username(): string {return this.#url.username}
    get origin()  : string {return this.#url.origin  }
    
    toJSON()  : string {return this.#url.toJSON()  }
    toString(): string {return this.#url.toString()}
    
    //////////////
    // Original //
    //////////////
    
    toUrl(): URL {
        return new URL(this.#url);
    }
    
    with(partial: Partial<UriComponents>): Uri {
        const newUrl = this.toUrl();
        for (const key in partial) {
            (newUrl as any)[key] = (partial as any)[key];
        }
        return new UriImpl($move, newUrl);
    }
    
    //////////////////////////
    // implements Equatable //
    //////////////////////////
    
    equals(other: this): boolean {
        return this.href === other.href;
    }
}
