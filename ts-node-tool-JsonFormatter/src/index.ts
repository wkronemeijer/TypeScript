import { pathToFileURL } from "url";

import { File, StringEnum, requires, terminal } from "@wkronemeijer/system";

import { formatJson_HaskellStyle } from "./Formatter";

export function main(args: string[]) {
    const inputPath = args[0];
    requires(inputPath, "There should be 1 input file.");
    const rawLength = Number(args[1]);
    
    const lineLengthLimit = rawLength >= 40 ? rawLength : undefined;
    
    const inputFile  = new File(inputPath);
    const outputFile = inputFile.changeExtension(".hsfmt.json") // "(H)a(s)kell (f)or(m)a(t)"
    
    const inputUri = pathToFileURL(inputPath);
    
    const input  = inputFile.readText();
    const output = terminal.measureTime(`format(${inputUri})`, () => 
        formatJson_HaskellStyle(input, { lineLengthLimit })
    );
    
    outputFile.writeText(output);
}
