import {BuildResult_getOutputFile, ESTarget} from "../../Extensions/BuildResult";
import {FileTransformRequest} from "../FileTransform";
import {prepareRequestInfo} from "../../Extensions/DefineMap";
import {requireString} from "../../RequireString";
import {dependencies} from "../../../../package.json";
import {esbuild} from "../../../lib";
import {swear} from "@wkronemeijer/system";

type OwnDependency = keyof typeof dependencies;

const shareableDependencies: readonly string[] = [
    "@wkronemeijer/system",
    "@wkronemeijer/system-node",
    "@wkronemeijer/react-server-page-provider",
] satisfies OwnDependency[];

const requiredDependency = "@wkronemeijer/react-server-page-provider" satisfies OwnDependency;
const badDependency      = "@wkronemeijer/react-server-page"          satisfies OwnDependency;

swear(shareableDependencies.includes(requiredDependency), () => 
    `${requiredDependency} MUST be shared.`
);
swear(!shareableDependencies.includes(badDependency), () => 
    `${badDependency} MUST NOT be shared.`
);

export async function buildAndRunCjs(
    req: FileTransformRequest,
): Promise<NodeModule> {
    const filePath = req.file.path;
    
    const buildResult = await esbuild.build({
        entryPoints: [filePath],
        bundle: true,
        write: false,
        jsx: "automatic",
        charset: "utf8", 
        
        platform: "node",
        format: "cjs",
        target: [ESTarget],
        
        minify: true,
        keepNames: true,
        // sourcemap: "inline",
        
        external: shareableDependencies.slice(),
        define: prepareRequestInfo(req),
    });
    
    const sourceCode = BuildResult_getOutputFile(buildResult);
    return requireString(filePath, sourceCode);
}
