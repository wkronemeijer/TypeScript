import { Directory, File, Path_Seperator, Path_join, Path_toUrl, Printable, RelativePath_toString, StringBuildable, StringBuilder, Text_getDimensions, neverPanic, requires, stringBuild } from "@wkronemeijer/system";
import { DiagnosticDisplayMode } from "./Diagnostics/DiagnosticDisplayMode";

export class SourceCode implements StringBuildable<[DiagnosticDisplayMode]> {
    readonly maxLocationSize: number;
    
    private constructor(
        readonly blockName: string,
        readonly inlineName: string,
        readonly text: string, 
        // As an exercise, we are going to try and save memory by freeing the file contents when we are done with it.
        // TODO: was String.slice ever fixed?
        // Answer: sort of? I dont remember
    ) {
        requires(blockName.length >= inlineName.length, "not so short huh?");
        
        this.maxLocationSize = Text_getDimensions(text).maxLocationLength;
    }
    
    static fromFile(file: File): SourceCode {
        const relativeName = RelativePath_toString(Directory.cwd.to(file));
        // const fullName  = Path_toUrl(file.path);
        const blockName  = relativeName;
        const inlineName = relativeName;
        const text       = file.readText()
        return new SourceCode(blockName, inlineName, text);
    }
    
    static fromSnippet(snippet: string, name = "(snippet)") {
        return new SourceCode(`snippet:${name}`, name, snippet);
    }
    
    ///////////////////////////
    // implements SourceCode // 
    ///////////////////////////
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    buildString(result: StringBuilder, mode: DiagnosticDisplayMode): void {
        if (mode === "inline") {
            result.append(this.inlineName);
            // result.append(this.fullName);
        } else if (mode === "block") {
            result.append(this.blockName);
        } else {
            neverPanic(mode);
        }
    }
    
    toString(mode = DiagnosticDisplayMode.default): string {
        return stringBuild(this, mode);
    }
}
