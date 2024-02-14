import { BuildResult_getOutputFile, ESTarget } from "../../Extensions/BuildResult";
import { FileTransformRequest } from "../FileTransform";
import { prepareRequestInfo } from "../../Extensions/DefineMap";
import { requireString } from "../../RequireString";
import * as esbuild from "esbuild";
import { swear } from "@wkronemeijer/system";

import { dependencies } from "../../../../package.json";

type OwnDependency = keyof typeof dependencies;

const shareableDependencies: readonly string[] = [
    "@wkronemeijer/system",
    "@wkronemeijer/system-node",
    "@wkronemeijer/react-server-page-provider",
] satisfies OwnDependency[];

const badDependency = "@wkronemeijer/react-server-page" satisfies OwnDependency;

swear(!shareableDependencies.includes(badDependency), () => 
    `${badDependency} must NOT be shared.`
);

export async function buildAndRunCjs({ file, id, url }: FileTransformRequest): Promise<NodeModule> {
    const filePath = file.path;
    
    // The part that saves me an unbelievable amount of time
    // The thing that makes this whole stupid tool even work
    const buildResult = await esbuild.build({
        entryPoints: [filePath],
        bundle: true,
        write: false,
        jsx: "automatic",
        
        platform: "node",
        format: "cjs",
        target: [ESTarget],
        
        minifyWhitespace: true,
        sourcemap: "inline",
        
        external: shareableDependencies.slice(),
        define: prepareRequestInfo({
            id,
            url: url.href,
        }),
    });
    
    const sourceCode = BuildResult_getOutputFile(buildResult);
    return requireString(filePath, sourceCode);
}
