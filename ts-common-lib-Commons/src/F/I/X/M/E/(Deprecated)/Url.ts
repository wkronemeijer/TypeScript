import { Satisfies } from "../Core/Types/Satisfies";

// NOTE: jsx-server uses this, so would be annoying when removed

// Yeah yeah, "URL" instead of "Url" is ugly
// But expected for conformance with normal JS lib

/**
 * Readonly view of the standard {@link URL} class.
 * 
 * All doc comments are based on `https://racecar:hunter2@some.domain.com:1028/path/to/file?query=fig&res=fog#references`.
 */
export interface ReadonlyURL {
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
    
    ///////////////
    // Synthetic //
    ///////////////
    
    /**
     * @example
     * "https://some.domain.com:1028"
     */
    readonly origin: string;
    
    readonly searchParams: URLSearchParams;
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    toString(): string;
    
    /////////////////////////////////
    // implements JsonSerializable //
    /////////////////////////////////
    
    toJSON(): string;
}

type t0 = Satisfies<URL, ReadonlyURL>;
