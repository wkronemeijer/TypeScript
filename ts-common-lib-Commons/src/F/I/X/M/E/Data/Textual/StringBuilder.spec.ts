import { check } from "../../Debug/Check";
import { StringBuilder } from "./StringBuilder";

describe("StringBuilder", () => {
    it("empty string", () => {
        check.equals(new StringBuilder().toString().length, 0);
    });
    
    it("single line", () => {
        const builder = new StringBuilder;
        builder.append("a");
        builder.append("b");
        builder.append("c");
        
        check.equals(builder.toString(), "abc");
    });
    
    it("multi-line", () => {
        const builder = new StringBuilder;
        builder.appendLine("a");
        builder.appendLine("b");
        builder.appendLine();
        builder.appendLine("c");
        builder.appendLine("d");
        
        check.equals(builder.toString(), "a\nb\n\nc\nd\n");
    });
    
    it("default indentation", () => {
        const builder = new StringBuilder;
        builder.increaseIndent();
        builder.appendLine("a");
        builder.append("b");
        builder.increaseIndent();
        builder.append("c");
        builder.decreaseIndent();
        builder.appendLine("d");
        builder.decreaseIndent();
        builder.appendLine("e");
        
        check.equals(builder.toString(), "    a\n    bcd\ne\n");
    });
    
    it("custom indentation", () => {
        const builder = new StringBuilder("\t");
        builder.appendLine("a");
        builder.increaseIndent();
        builder.appendLine("b");
        builder.appendLine();
        builder.appendLine("c");
        builder.decreaseIndent();
        builder.appendLine("d");
        builder.increaseIndent();
        
        check.equals(builder.toString(), "a\n\tb\n\t\n\tc\nd\n");
    });
});
