import { guard, terminal } from "@wkronemeijer/system";
import { File } from "@wkronemeijer/system-node";

import { SourceCode } from "@wkronemeijer/compiler-toolkit";

import { CompilerHost } from "./Compiling/Compiler";

export function main(args: string[]): void {
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
