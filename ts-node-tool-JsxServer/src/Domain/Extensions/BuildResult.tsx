import { swear } from "@wkronemeijer/system";
import * as esbuild from "esbuild";

export const ESTarget = "es2022";
// TODO: Find out whether esbuild takes this value from the nearest tsconfig.

export function BuildResult_getOutput<BR extends esbuild.BuildResult>(
    self: BR,
): string {
    let outFiles, bundle;
    swear(outFiles = self.outputFiles, "No ouput files.");
    swear(outFiles.length === 1, "More than 1 build result.");
    swear(bundle = outFiles[0]);
    return bundle.text;
}
