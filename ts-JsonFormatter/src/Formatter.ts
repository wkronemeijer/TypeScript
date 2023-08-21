import { StringBuilder } from "@wkronemeijer/system";

const { min, max } = Math;

// NB: We reformat, so we don't have to use toJSON methods or anything

type JsonPrimitive = 
    | null
    | boolean 
    | number 
    | string 
;

function JsonPrimitive_stringify(self: JsonPrimitive): string {
    return JSON.stringify(self); 
    // TODO: works, but is kind of a terrible hack
    // Future version could do it, itself
}

type JsonArray = readonly JsonValue[];

type JsonObject = { readonly [s: string]: JsonValue }

type JsonValue = 
    | JsonPrimitive
    | JsonArray
    | JsonObject
;

interface FormatterOptions {
    readonly lineLengthLimit?: number;
}

type Measure = 
    | number // specific size 
    | false  // definitely too long
    // (no element has size 0)
;

class Formatter {
    readonly result = new StringBuilder;
    
    readonly lengthLimit: number;
    
    private constructor(options: FormatterOptions) {
        this.lengthLimit = options.lineLengthLimit ?? 120;
    }
    
    /////////////////////
    // Size estimation //
    /////////////////////
    
    private estimatePrimitiveLineSize(prim: JsonPrimitive): number {
        return 1;
    }
    
    private estimateArrayLineSize(arr: JsonArray): number {
        let keyCount: number = 0;
        for (const item of arr) {
            keyCount += this.estimateSize(item);
        }
        return max(1, keyCount);
    }
    
    private estimateObjectSize(obj: JsonObject): number {
        let keyCount: number = 0;
        for (const key in obj) {
            keyCount += this.estimateSize(obj[key]!);
        }
        return max(1, keyCount);
        // if (isNotEmpty) {
        //     return total - 2; // strip trailing ", "
        // } else {
        //     return total;
        // }
        // NB: inline objects also have a space between the brace and the content;
        // 2 spaces == ", ".length
    }
    
    private estimateSize(val: JsonValue): number {
        if (typeof val === "object" && val !== null) {
            if (val instanceof Array) {
                return this.estimateArrayLineSize(val);
            } else {
                return this.estimateObjectSize(val);
            }
        } else {
            return this.estimatePrimitiveLineSize(val);
        }
    }
    
    isOneLiner(val: JsonValue): boolean {
        return this.estimateSize(val) === 1;
    }
    
    //////////////
    // Visitors // 
    //////////////
    
    visitPrimitive(prim: JsonPrimitive): void {
        this.result.append(JsonPrimitive_stringify(prim));
    }
    
    visitArray(arr: JsonArray): void {
        if (this.isOneLiner(arr)) {
            this.result.append("[ ");
            let isFirst = true;
            for (const item of arr) {
                if (!isFirst) {
                    this.result.append(", ");
                }
                this.visit(item);
                isFirst = false;
            }
            this.result.append(" ]");
        } else {
            this.result.appendLine();
            let isFirst = true;
            for (const item of arr) {
                this.result.append(isFirst ? "[ " : ", ");
                this.result.indent();
                this.visit(item);
                this.result.dedent();
                this.result.appendLine();
                isFirst = false;
            }
            this.result.append("]");
        }
    }
    
    visitObject(object: JsonObject): void {
        if (this.isOneLiner(object)) {
            this.result.append("{ ");
            let isFirst = true;
            for (const key in object) {
                const item = object[key]!;
                if (!isFirst) {
                    this.result.append(", ");
                }
                this.visit(key);
                this.result.append(": ");
                this.visit(item);
                isFirst = false;
            }
            this.result.append(" }");
        } else {
            this.result.appendLine();
            let isFirst = true;
            for (const key in object) {
                const item = object[key]!;
                this.result.append(isFirst ? "{ " : ", ");
                this.visit(key);
                this.result.append(": ");
                
                // Without this the 0 indent property values get 4 extra spaces
                // ...which shouldn't happen, because StringBuilder only indents when you include a newline.
                // TODO: Work out why this happens.
                if (this.isOneLiner(item)) {
                    this.visit(item);
                } else {
                    this.result.indent();
                    this.visit(item);
                    this.result.dedent();
                }
                
                this.result.appendLine();
                isFirst = false;
            }
            this.result.append("}");
        }
    }
    
    visit(val: JsonValue): void {
        if (typeof val === "object" && val !== null) {
            if (val instanceof Array) {
                this.visitArray(val);
            } else {
                this.visitObject(val);
            }
        } else {
            this.visitPrimitive(val);
        }
    }
    
    ////////////
    // Access //
    ////////////
    
    static stringify(
        this: unknown, 
        val: JsonValue, 
        options: FormatterOptions = {},
    ): string {
        const formatter = new Formatter(options);
        formatter.visit(val);
        return formatter.result.toString();
    }
}

export function formatJson_HaskellStyle(
    json: string, 
    options: FormatterOptions = {},
): string {
    const value = JSON.parse(json) as JsonValue;
    return Formatter.stringify(value, options).trim();
}
