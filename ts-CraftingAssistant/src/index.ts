import { File, guard, terminal } from "@local/system";

import { CompilerHost } from "./Compiling/Compiler";
import { SourceCode } from "./Compiling/SourceCode";

export function main(args = process.argv.slice(2)): void {
    const filePath = args[0];
    guard(filePath, "usage: crafty <file>");
    const host   = new CompilerHost;
    
    const file   = new File(filePath);
    const source = SourceCode.fromFile(file);
    const result = host.compile(source);
    
    if (result.ok) {
        terminal.log("Compilation succeeded.");
    } else {
        terminal.log("Compilation failed.");
    }
    
    if (result.diagnostics.length > 0) {
        terminal.log(result.diagnostics.toString());
    }
}
