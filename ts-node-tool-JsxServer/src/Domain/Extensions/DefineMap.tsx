import {RaspGlobalDefines, RaspRequestInfo} from "@wkronemeijer/react-server-page";
import {FileTransformRequest} from "../Transforms/FileTransform";
import {ESBuildDefines} from "./BuildResult";
import {stringifyJson} from "@wkronemeijer/system";

const RequestKey = "__REQUEST_INFO" satisfies keyof RaspGlobalDefines;

function FileTransformRequest_toInfo(req: FileTransformRequest): RaspRequestInfo {
    return {
        url: req.url.href,
        file: req.file.path,
    };
}

export function prepareRequestInfo(req: FileTransformRequest): ESBuildDefines {
    const info = FileTransformRequest_toInfo(req);
    return {[RequestKey]: stringifyJson(info)};
}
