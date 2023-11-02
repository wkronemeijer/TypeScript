import { AnsiTextStyle_use, StringBuildable, StringBuilder, pluralize, stringBuild } from "@wkronemeijer/system";

import { DiagnosticKind, DiagnosticKind_getColor } from "./DiagnosticKind";
import { DiagnosticDisplayMode } from "./DiagnosticDisplayMode";
import { Diagnostic } from "./Diagnostic";

// Because plural is not different enough
// Exists for 
// 1. throwing if there is an error
// 2. printing, grouped by file

export interface ReadonlyDiagnosticCollection
extends 
    Iterable<Diagnostic>, 
    StringBuildable<[DiagnosticDisplayMode]>
{
    readonly ok: boolean;
    readonly length: number;
    
    has(kind: DiagnosticKind): boolean;
    count(kind: DiagnosticKind): number;
    
    getSummary(): string;
    toString(mode?: DiagnosticDisplayMode): string;
}

export interface DiagnosticCollection 
extends ReadonlyDiagnosticCollection {
    add(item: Diagnostic): void;
    addAll(iterable: Iterable<Diagnostic>): void;
}

interface DiagnosticCollectionConstructor {
    new(initializer?: Iterable<Diagnostic>): DiagnosticCollection;
    join(...iterables: Iterable<Diagnostic>[]): DiagnosticCollection;
}

// ...isn't it beautiful?
export const DiagnosticCollection
:            DiagnosticCollectionConstructor = 
class        DiagnosticCollectionImpl 
implements   DiagnosticCollection            {
    private readonly store: Diagnostic[];
    
    constructor(
        initializer: Iterable<Diagnostic> = [],
    ) {
        this.store = Array.from(initializer);
    }
    
    get ok(): boolean {
        return !this.store.some(diag => diag.isFatal);
    }
    
    get length(): number {
        return this.store.length;
    }
    
    static join(this: unknown, ...iterables: Iterable<Diagnostic>[]): DiagnosticCollection {
        const diagnostics = new DiagnosticCollection;
        for (const iterable of iterables) {
            diagnostics.addAll(iterable);
        }
        return diagnostics;
    }
    
    /////////////////////////////////////////////
    // implements ReadonlyDiagnosticCollection //
    /////////////////////////////////////////////
    
    count(kind: DiagnosticKind): number {
        let total = 0;
        for (const diag of this) {
            if (diag.kind === kind) {
                total++;
            }
        }
        return total;
    }
    
    has(kind: DiagnosticKind): boolean {
        return this.count(kind) > 0;
    }
    
    getSummary(): string {
        const result = new StringBuilder;
        let isFirst = true;
        for (const kind of DiagnosticKind) {
            const {
                apply: setColor,
                unset: unsetColor,
            } = AnsiTextStyle_use({ color: DiagnosticKind_getColor(kind) });
            
            if (!isFirst) {
                result.append(", ");
            }
            
            const count = this.count(kind);
            if (count > 0) {
                result.append(setColor);
            }
            result.append(pluralize(count, kind));
            if (count > 0) {
                result.append(unsetColor);
            }
            
            isFirst = false;
        }
        return result.toString();
    }
    
    /////////////////////////////////////
    // implements DiagnosticCollection //
    /////////////////////////////////////
    
    add(item: Diagnostic): void {
        this.store.push(item);
    }
    
    addAll(iterable: Iterable<Diagnostic>): void {
        for (const item of iterable) {
            this.add(item);
        }
    }
    
    /////////////////////////
    // implements Iterable //
    /////////////////////////
    
    [Symbol.iterator](): Iterator<Diagnostic> {
        return this.store[Symbol.iterator]();
    }
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    buildString(result: StringBuilder, mode: DiagnosticDisplayMode): void {
        result.append(this.getSummary());
        for (const diag of this) {
            result.appendLine()
            result.include(diag, mode);
        }
        if (mode === "block") {
            // First summary is probably out of view
            result.appendLine()
            result.append(this.getSummary());
        }
    }
    
    private inferMode(): DiagnosticDisplayMode {
        return this.ok ? "inline" : "block";
    }
    
    toString(mode = this.inferMode()): string {
        return stringBuild(this, mode);
    }
}
