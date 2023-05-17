import { Printable } from "../Traits/Printable";
import { ensures } from "../Assert";
import { Falsy } from "../Types/Truthy";

// TODO: Support restore points? 
// That would go so complicated, but it would also be extremely cool
// Use case: estimating if things fit on a single line (for json-formatter)

///////////////////// 
// StringBuildable //
///////////////////// 

// TODO: Come up with a new name
// mind the stringBuild(foo) = foo.buildString(new Builder) symmetry
export interface StringBuildable<
    TArgs extends readonly any[] = [],
> extends Printable {
    // method name is hard
    // it is analogous to Serialize(Serializer)
    buildString: (result: StringBuilder, ...args: TArgs) => void;
    // Property and not a method as to make it contravariant
    // fix from https://stackoverflow.com/a/68873722
}

///////////////////
// StringBuilder //
///////////////////
// In the same file because both are mutually recursive types

// TODO: makes (some of) this configurable
const defaultTabSize = 4;
const newline        = '\n';
const space          = ' ';

/** Accumulates many strings efficiently to form one long string. */
export interface StringBuilder
extends StringBuildable {
    /////////////////
    // Information //
    /////////////////
    
    /** 
     * Size of a single indent. 
     * Not to be confused with {@link getCurrentIndentationSize}. 
     */
    readonly tabSize: number;
    /** 
     * Total length of segments in the buffer. 
     * 
     * Useful if you want to see how many characters were added after an operation.
     */
    readonly length: number;
    
    /////////////////
    // Indentation //
    /////////////////
    
    /** Increases the indent by 1 level. */
    indent(): void;
    
    /** Decreases the indent by 1 level. */
    dedent(): void;
    
    /** Resets the indent to 0. */
    resetIndentation(): void;
    
    ///////////////
    // Appending //
    ///////////////
    
    /** 
     * Appends the given string, while ignoring falsy values.
     * 
     * To append another {@link StringBuildable}, use `.include`. 
     */
    append(string: string | Falsy): void;
    
    /** 
     * Appends the given string and a newline, while ignoring falsy values.
     * 
     * To append another {@link StringBuildable}, use `.includeLine`. 
     */
    appendLine(string?: string | Falsy): void;
    
    /**
     * Includes a {@link StringBuildable} in the buffer.
     */
    include<TArgs extends readonly any[] = []>(
        buildable: StringBuildable<TArgs>,
        ...args: TArgs
    ): void;
    
    /**
     * Includes a {@link StringBuildable} in the buffer and appends a newline.
     */
    includeLine<TArgs extends readonly any[] = []>(
        buildable: StringBuildable<TArgs>, 
        ...args: TArgs
    ): void;
}

export interface StringBuilderConstructor {
    new(tabSize?: number): StringBuilder;
    stringify<TArgs extends readonly any[] = []>(this: unknown,
        buildable: StringBuildable<TArgs>,
        ...args: TArgs
    ): string;
}

export const StringBuilder
:            StringBuilderConstructor = 
class        StringBuilderImpl 
implements   StringBuilder            {
    constructor(
        readonly tabSize: number = defaultTabSize
    ) { }
    
    private readonly segments = new Array<string>;
    private currentLevel = 0;
    private primedForIndent = true;
    
    length = 0;
    
    private pushSegment(segment: string): void {
        this.segments.push(segment);
        this.length += segment.length;
    }
    
    private getIndentation(): string {
        return space.repeat(this.tabSize * this.currentLevel);
    }
    
    private scanForNewlines(s: string) {
        if (s.includes(newline)) {
            this.primedForIndent = true;
        }
    }
    
    ////////////////////////////
    // implements Indentation //
    ////////////////////////////
    
    /** Increases indentation by 1. */
    indent(): void {
        this.currentLevel++;
    }
    
    /** Decreases indentation by 1. */
    dedent(): void {
        this.currentLevel--;
        ensures(this.currentLevel >= 0, "Too many dedents.");
    }
    
    /** Resets to indentation to 0. */
    resetIndentation(): void {
        this.currentLevel = 0;
    }
    
    //////////////////////////
    // implements Appending //
    //////////////////////////
    
    append(string: string | Falsy): void {
        if (string) {
            const isIndented = this.currentLevel > 0;
            if (isIndented && this.primedForIndent) { 
                this.pushSegment(this.getIndentation());
                this.primedForIndent = false;
            }
            this.pushSegment(string);
            this.scanForNewlines(string);
        }
    }
    
    appendLine(string?: string | Falsy): void {
        if (string) {
            this.append(string);
        }
        this.append(newline);
    }
    
    include<ExtraArgs extends readonly any[] = []>(
        buildable: StringBuildable<ExtraArgs>, 
        ...args: ExtraArgs
    ): void {
        buildable.buildString(this, ...args);
    }
    
    includeLine<ExtraArgs extends readonly any[] = []>(
        buildable: StringBuildable<ExtraArgs>, 
        ...args: ExtraArgs
    ): void {
        buildable.buildString(this, ...args);
        this.appendLine();
    }
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    buildString(result: StringBuilder): void {
        for (const seg of this.segments) {
            result.append(seg);
        }
    }
    
    toString(): string {
        return this.segments.join("");
    }
    
    /**
     * Builds a string from a buildable using a new builder.
     */
    static stringify<TArgs extends readonly any[] = []>(
        this: unknown,
        buildable: StringBuildable<TArgs>, 
        ...args: TArgs
    ): string {
        const result = new StringBuilder();
        buildable.buildString(result, ...args);
        return result.toString();
    }
}

// Note that buildString function would overlap with buildString method 
// which messes with IntelliSense
export const stringBuild = StringBuilder.stringify;
