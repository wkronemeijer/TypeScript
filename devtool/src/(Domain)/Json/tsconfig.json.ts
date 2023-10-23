import { RelativePath } from "../../(Commons)/Path";

import { NodeName } from "../NodeName";
import { GeneratedJson } from "./GeneratedJson";

type TsConfigLibrary = (
    | "ES2022"
    | "DOM"
    | "DOM.Iterable"
    | "ScriptHost"
    // Node uses the types option
);

// Reminder that this is the tsconfig for (sub)projects, 
// not the one in the root folder (which they all extend).
interface TsConfigCompilerOptions {
    readonly "rootDir"?: RelativePath;
    readonly "outDir"?: RelativePath;
    
    readonly "declaration"?: boolean;
    readonly "declarationDir"?: RelativePath;
    
    readonly "types"?: readonly NodeName[];
    
    readonly "module"?: "commonjs"; // esbuild works with "commonjs" module setting
    
    readonly "target"?: "ES2022";
    readonly "lib"?: readonly TsConfigLibrary[];
}

export interface TsConfigJson 
extends GeneratedJson {
    readonly "$schema"?: string;
    readonly "extends"?: string;
    readonly "compilerOptions"?: TsConfigCompilerOptions;
}
