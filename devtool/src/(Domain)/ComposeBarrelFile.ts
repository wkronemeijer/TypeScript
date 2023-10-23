import { parse, relative } from "path";

import { removeExtension, getFiles_recursive } from "../(Commons)/FileSystem";
import { agree } from "../(Commons)/Agree";

import { GeneratedComment } from "./GenerationComment";
import { CodeFilePattern } from "../Manifest";

// TODO: When ESM comes, this part causes problems ↓
function exportModule(rootDir: string, file: string) {
    const stage1 = relative(rootDir, file);
    const stage2 = removeExtension(stage1);
    const stage3 = stage2.replace(/\\/g, "/"); // for windows
    const stage4 = "./" + stage3;
    return `export * from "${stage4}";`;
}

function exportAllModules(rootDir: string, files: string[]): string {
    const lines = [];
    lines.push(GeneratedComment.wasHere());
    lines.push(GeneratedComment(`Includes ${agree(files.length, "modules")}.`));
    lines.push(`export {};`); // force module, in case we have 0 results.
    for (const file of files) {
        lines.push(exportModule(rootDir, file));
    }
    return lines.join("\n");
}

function isCodeFile(fileName: string): boolean {
    return CodeFilePattern.test(fileName);
}

export function composeBarrelFile(rootDir: string): string {
    const exportedFiles = [];
    for (const srcFile of getFiles_recursive(rootDir)) {
        const srcFileName = parse(srcFile).base;
        if (isCodeFile(srcFileName)) {
            exportedFiles.push(srcFile);
        }
    }
    return exportAllModules(rootDir, exportedFiles);
}
