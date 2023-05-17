import { assert, ensures, neverPanic, panic, StringBuilder } from "@local/system";

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
    
    estimatePrimitiveSize(prim: JsonPrimitive): Measure {
        switch (typeof prim) {
            case "object" : return 4
            case "boolean": return prim ? 4 : 5
            case "number" : return String(prim).length
            case "string" : return prim.length + 2 // ""
            default       : neverPanic(prim);
        }
    }
    
    estimateArraySize(arr: JsonArray): Measure {
        let total: ReturnType<typeof this.estimateArraySize> = 2;
        let isNotEmpty = false;
        for (const item of arr) {
            const itemSize = this.estimateSize(item)
            if (itemSize && total < this.lengthLimit) {
                total += itemSize + 2 // ", "
            } else {
                return false;
            }
            isNotEmpty = true;
        }
        if (isNotEmpty) {
            return total - 2; // strip trailing ", "
        } else {
            return total;
        }
    }
    
    estimateObjectSize(obj: JsonObject): Measure {
        let total: ReturnType<typeof this.estimateObjectSize> = 2;
        let isNotEmpty = false;
        for (const key in obj) {
            const item = obj[key] ?? panic();
            const keySize  = this.estimateSize(key);
            const itemSize = this.estimateSize(item);
            if (keySize && itemSize && total < this.lengthLimit) {
                total += keySize + 2 + itemSize + 2; // ": " and ", "
            } else {
                return false;
            }
            isNotEmpty = true;
        }
        return total;
        // if (isNotEmpty) {
        //     return total - 2; // strip trailing ", "
        // } else {
        //     return total;
        // }
        // NB: inline objects also have a space between the brace and the content;
        // 2 spaces == ", ".length
    }
    
    estimateSize(val: JsonValue): Measure {
        let result: Measure;
        if (typeof val === "object" && val !== null) {
            if (val instanceof Array) {
                result = this.estimateArraySize(val);
            } else {
                result = this.estimateObjectSize(val);
            }
        } else {
            result = this.estimatePrimitiveSize(val);
        }
        ensures(result !== 0, 
            () => `Size ${result} should be >0.`);
        return result;
    }
    
    isOneLiner(val: JsonValue): boolean {
        const contentSize = this.estimateSize(val);
        if (contentSize) {
            const actualSize = contentSize + this.result.getCurrentIndentationSize();
            return actualSize < this.lengthLimit;
        } else {
            return false;
        }
    }
    
    //////////////
    // Visitors // 
    //////////////
    
    visitPrimitive(prim: JsonPrimitive): void {
        this.result.append(JsonPrimitive_stringify(prim));
    }
    
    visitArray(arr: JsonArray): void {
        if (this.isOneLiner(arr)) {
            this.result.append("[");
            let isFirst = true;
            for (const item of arr) {
                if (!isFirst) {
                    this.result.append(", ");
                }
                this.visit(item);
                isFirst = false;
            }
            this.result.append("]");
        } else {
            this.result.appendLine();
            this.result.indent();
            let isFirst = true;
            for (const item of arr) {
                this.result.append(isFirst ? "[ " : ", ");
                this.visit(item);
                this.result.appendLine();
                isFirst = false;
            }
            this.result.append("]");
            this.result.dedent();
        }
    }
    
    visitObject(object: JsonObject): void {
        if (this.isOneLiner(object)) {
            this.result.append("{");
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
            this.result.append("}");
        } else {
            this.result.appendLine();
            this.result.indent();
            let isFirst = true;
            for (const key in object) {
                const item = object[key]!;
                this.result.append(isFirst ? "{ " : ", ");
                this.visit(key);
                this.result.append(": ");
                this.visit(item);
                this.result.appendLine();
                isFirst = false;
            }
            this.result.append("}");
            this.result.dedent();
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
    
    static stringify(val: JsonValue, options: FormatterOptions): string {
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
    return Formatter.stringify(value, options);
}
