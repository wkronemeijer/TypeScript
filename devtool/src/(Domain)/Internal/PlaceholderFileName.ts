import { StringEnum } from "../../(Commons)/StringEnum";
import { Member } from "../../(Commons)/Member";
import { Record_toFunction } from "@wkronemeijer/system";

export type  CompiledFileName = Member<typeof CompiledFileName>;
export const CompiledFileName = StringEnum([
    "src/bin.ts",
    "src/lib.ts",
    "src/index.ts", "src/index.tsx",
    "src/main.ts" , "src/main.tsx" ,
]);

export type  AsIsFileName = Member<typeof AsIsFileName>;
export const AsIsFileName = StringEnum([
    ".vscode/settings.json",
    ".vscode/tasks.json",
    ".vscode/launch.json",
    "package.json",
    "tsconfig.json",
]);

///////////////////
// Comptime file //
///////////////////

export type  ComptimeFileName = Member<typeof ComptimeFileName>;
export const ComptimeFileName = StringEnum([
    ...CompiledFileName,
    ...AsIsFileName,
]);

//////////////////
// Runtime file //
//////////////////

export const ComptimeFileName_canOverwrite = Record_toFunction<ComptimeFileName, boolean>({
    
});





// Also note:
type GetRuntimeFile<K extends ComptimeFileName> = 
    K extends `src/${infer R}.ts`  ? `dist/${R}.js` | `dist_t/${R}.d.ts` :
    K extends `src/${infer R}.tsx` ? `dist/${R}.js` | `dist_t/${R}.d.ts` :
    K
;

export type  RuntimeFileName = GetRuntimeFile<ComptimeFileName>;
export const RuntimeFileName = StringEnum([
    ...PlaceholderFileName,
    ...GeneratedFileName,
]);



// ComptimeFile -> RuntimeFile is not univalent
// Solution: 
// getCode : ComptimeFile -> RuntimeFile (never fails);
// getHeader : ComptimeFile -> RuntimeFile | undefined



/*
Actually we have a little diagram here

File is 
- created | created and overwritten
- Used as-is | compiled to a code and header file


*/





// Why can you do this
// 🤢
// Easier in TS than actually creating the code that does this.
const transformPattern = /^src\/(.+)\.tsx?$/;
const replacement1 = `dist/$1.js`;
const replacement2 = `dist_t/$1.d.ts`;
function ComptimeFileName_canBeCompiled<K extends ComptimeFileName>(self: K): boolean {
    return transformPattern.test(self);
}

function ComptimeFileName_getRuntimeFile(): Runtim;
function* tranform<K extends ComptimeFileName>(string: K): IterableIterator<GetRuntimeFile<K>> {
    if (ComptimeFileName_canBeCompiled(string)) {
        yield string.replace(transformPattern, replacement1) as string as any;
        yield string.replace(transformPattern, replacement2) as string as any;
    } else {
        yield string as string as any;
    }
}
const pattern = /src\/(.+).ts/;
function isCompilable(file: string): boolean {
    return pattern.test(file);
}
function getRuntimeFileName(file: string): string {
    if (isCompilable(file)) {



        return file.replaceAll(
            /src\/(.+).ts/g,
            (_, path): string => {
                return `dist/${path}.js`;
            }
        );
    }
}
function getDeclarationFileName(file: string): string {
    return file.replaceAll(
        /src\/(.+).ts/g,
        (_, path): string => {
            return `dist_t/${path}.d.ts`;
        }
    );
}
function* getCompiledVersion(file: string): Iterable<string> {
    if (isCompilable(file)) {
        yield getRuntimeFileName(file);
        yield getDeclarationFileName(file);
    } else {
        yield file;
    }
}
