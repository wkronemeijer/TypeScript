import { RaspGlobalDefines, RaspRequestInfo } from "@wkronemeijer/react-server-page";
import { stringifyJson } from "@wkronemeijer/system";

import { ESBuildDefines } from "./BuildResult";
import { FileTransformRequest } from "../Transforms/FileTransform";

const RequestKey = "__REQUEST_INFO" satisfies keyof RaspGlobalDefines;

function FileTransformRequest_toInfo(req: FileTransformRequest): RaspRequestInfo {
    return {
        url: req.url.href,
        file: req.file.path,
    };
}

export function prepareRequestInfo(req: FileTransformRequest): ESBuildDefines {
    const info = FileTransformRequest_toInfo(req);
    return { [RequestKey]: stringifyJson(info) };
}
