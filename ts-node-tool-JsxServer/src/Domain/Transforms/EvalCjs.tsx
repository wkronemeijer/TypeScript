import {BuildResult_getOutputFile, ESTarget} from "../Extensions/BuildResult";
import {getShareableDependencies} from "./ShareableDependencies";
import {FileTransformRequest} from "./FileTransform";
import {prepareRequestInfo} from "../Extensions/DefineMap";
import {requireString} from "../RequireString";
import {esbuild} from "../../lib";

function doMinify(
    {url}: FileTransformRequest,
): esbuild.BuildOptions["minify"] {
    return !url.searchParams.has("debug");
}

function doIncludeSourceMap(
    {url}: FileTransformRequest,
): esbuild.BuildOptions["sourcemap"] {
    return url.searchParams.has("debug") && "inline";
}

export async function buildIife_async(
    req: FileTransformRequest,
): Promise<string> {
    const filePath = req.file.path;
    return BuildResult_getOutputFile(await esbuild.build({
        entryPoints: [filePath],
        bundle: true,
        write: false,
        jsx: "automatic",
        charset: "utf8",
        
        minify: doMinify(req),
        sourcemap: doIncludeSourceMap(req),
        keepNames: true,
        
        platform: "browser",
        target: [ESTarget],
    }));
}

async function buildCjs_async(
    req: FileTransformRequest,
): Promise<string> {
    const filePath = req.file.path;
    return BuildResult_getOutputFile(await esbuild.build({
        entryPoints: [filePath],
        bundle: true,
        write: false,
        jsx: "automatic",
        charset: "utf8",
        
        minify: doMinify(req),
        sourcemap: doIncludeSourceMap(req),
        keepNames: true,
        
        platform: "node",
        target: [ESTarget],
        format: "cjs",
        
        external: getShareableDependencies(),
        define: prepareRequestInfo(req),
    }));
}

export async function buildAndRunCjs_async(
    req: FileTransformRequest,
): Promise<NodeModule> {
    const filePath = req.file.path;
    const sourceCode = await buildCjs_async(req);
    const result = requireString(filePath, sourceCode);
    return result;
}
