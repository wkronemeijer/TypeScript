import { StringBuildable } from "./StringBuildable";
import { StringTarget } from "./StringTarget";
import { Falsy } from "../Types/Truthy";
import { max } from "../ReExport/Module/Math";

const defaultTabSize = 4;
const NEWLINE        = '\n';
const SPACE          = ' ';

/** Accumulates many strings efficiently to form one long string. */
export interface StringBuilder
extends StringBuildable, StringTarget {
    /** 
     * A single indentation element.
     */
    readonly indentation: string;
    
    /** 
     * Total length of segments in the buffer. 
     * 
     * Useful if you want to see how many characters were added after an operation.
     */
    readonly length: number;
    
    /** Increases the indent by 1 level. */
    increaseIndent(): void;
    
    /** Decreases the indent by 1 level. */
    decreaseIndent(): void;
    
    /** Resets the indent to 0. */
    resetIndent(): void;
}

interface StringBuilderConstructor {
    new(indentation?: string | number): StringBuilder;
    
    stringify<TArgs extends readonly any[] = []>(
        this: unknown,
        buildable: StringBuildable<TArgs>,
        ...args: TArgs
    ): string;
}

function normalizeIndentation(
    indentation: string | number = defaultTabSize
): string {
    return (
        typeof indentation === "number" ?
        SPACE.repeat(indentation) :
        indentation
    );
}

export const StringBuilder
:            StringBuilderConstructor = 
class        StringBuilderImpl 
implements   StringBuilder            {
    private readonly segments = new Array<string>;
    private currentLevel = 0;
    private primedForIndent = true;
    
    readonly indentation: string;
    length = 0;
    
    constructor(indentation?: string | number) {
        this.indentation = normalizeIndentation(indentation);
    }
    
    private pushSegment(segment: string): void {
        this.segments.push(segment);
        this.length += segment.length;
    }
    
    private pushIndentation(): void {
        this.pushSegment(this.indentation.repeat(this.currentLevel));
    }
    
    private scanForNewlines(s: string) {
        if (s.includes(NEWLINE)) {
            this.primedForIndent = true;
        }
    }
    
    ////////////////////////////
    // implements Indentation //
    ////////////////////////////
    
    /** Increases indentation by 1. */
    increaseIndent(): void {
        this.currentLevel = this.currentLevel + 1;
    }
    
    /** Decreases indentation by 1. */
    decreaseIndent(): void {
        this.currentLevel = max(0, this.currentLevel - 1);
    }
    
    /** Resets to indentation to 0. */
    resetIndent(): void {
        this.currentLevel = 0;
    }
    
    //////////////////////////
    // implements Appending //
    //////////////////////////
    
    append(string: string | Falsy): void {
        if (string) {
            const isIndented = this.currentLevel > 0;
            if (isIndented && this.primedForIndent) { 
                this.pushIndentation();
                this.primedForIndent = false;
            }
            this.pushSegment(string);
            this.scanForNewlines(string);
        }
    }
    
    appendLine(string?: string | Falsy): void {
        this.append(string);
        this.append(NEWLINE);
    }
    
    include<TArgs extends readonly any[] = []>(
        buildable: StringBuildable<TArgs> | Falsy, 
        ...args: TArgs
    ): void {
        if (buildable) {
            buildable.buildString(this, ...args);
        }
    }
    
    includeLine<TArgs extends readonly any[] = []>(
        buildable?: StringBuildable<TArgs> | Falsy, 
        ...args: TArgs
    ): void {
        this.include(buildable, ...args);
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
