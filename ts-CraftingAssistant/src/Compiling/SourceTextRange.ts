import { StringBuildable, StringBuilder, TextLocation, getTextLocation, getTextPreview, requires, stringBuild, Array_firstElement, clamp, Array_lastElement } from "@wkronemeijer/system";

import { DiagnosticDisplayMode } from "./Diagnostics/DiagnosticDisplayMode";
import { SourceCode } from "./SourceCode";

const { min, max } = Math;

function includeLocation(
    self: StringBuilder, 
    textLocation: TextLocation, 
    desiredSize = 0,
) {
    const oldLength = self.length;
    self.include(textLocation);
    const actualAdded = self.length - oldLength;
    const missing     = max(desiredSize - actualAdded, 0);
    self.append(' '.repeat(missing));
}

export interface HasLocation {
    readonly location: SourceTextRange;
}

export class SourceTextRange
implements StringBuildable<[DiagnosticDisplayMode]> {
    readonly start : number;
    readonly end   : number;
    readonly length: number;
    
    constructor(
        readonly sourceCode: SourceCode,
        start: number,
        end: number,
    ) {
        const srcLength = sourceCode.text.length;
        this.start  = start = clamp(    0, start, srcLength);
        this.end    = end   = clamp(start, end  , srcLength);
        this.length = end - start; // Thanks Dijkstra
    }
    
    static spanning(
        this: unknown,
        ...items: HasLocation[]
    ): SourceTextRange {
        const first = Array_firstElement(items);
        const last  = Array_lastElement(items);
        requires(first && last, "argument list should not be empty.");
        
        const src   = first.location.sourceCode;
        const start = first.location.start;
        const end   = last.location.end;
        return new SourceTextRange(src, start, end);
        
        // What would the iterative version look like?
        /*
        for item in items:
            if (item.end > end) end = item.end
        */
    }
    
    /////////////////////////
    // implements Location //
    /////////////////////////
    
    private getStartLocation(): TextLocation {
        return getTextLocation(this.sourceCode.text, this.start);
    }
    
    private getEndLocation(): TextLocation {
        return getTextLocation(this.sourceCode.text, this.end);
    }
    
    getPreview(): string {
        return getTextPreview({
            source: this.sourceCode.text,
            errorStart: this.start,
            errorEnd: this.end,
        });
    }
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    private getDesiredSize(mode: DiagnosticDisplayMode): number | undefined {
        if (mode ==="inline") {
            return this.sourceCode.maxLocationSize;
        } 
    }
    
    buildString(result: StringBuilder, mode: DiagnosticDisplayMode): void {
        result.include(this.sourceCode, mode);
        result.append(':');
        
        const desiredSize = this.getDesiredSize(mode);
        includeLocation(result, this.getStartLocation(), desiredSize);
        // if (this.length > 0) {
        result.append(" - ");
        includeLocation(result, this.getEndLocation(), desiredSize);
        // }
    }
    
    toString(mode = DiagnosticDisplayMode.default): string {
        return stringBuild(this, mode);
    }
}
