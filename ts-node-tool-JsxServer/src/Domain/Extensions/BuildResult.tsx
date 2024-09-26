import {esbuild} from "../../lib";
import {swear} from "@wkronemeijer/system";

export const ESTarget = "es2022";
// TODO: Find out whether esbuild takes this value from the nearest tsconfig.

export type ESBuildDefines = esbuild.BuildOptions["define"];

export function BuildResult_getOutputFile<BR extends esbuild.BuildResult>(
    self: BR,
): string {
    const outFiles = self.outputFiles;
    swear(outFiles, "no build results");
    swear(outFiles.length > 0, "no build results");
    swear(outFiles.length < 2, "more than 1 build result");
    const bundle = outFiles[0];
    swear(bundle);
    return bundle.text;
}
