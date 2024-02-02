import { RaspGlobalDefines, RaspRequestInfo } from "@wkronemeijer/react-server-page";
import { stringifyJson } from "@wkronemeijer/system";

import { ESBuildDefines } from "./BuildResult";

const RequestKey = "__REQUEST_INFO" satisfies keyof RaspGlobalDefines;

export function prepareRequestInfo(info: RaspRequestInfo): ESBuildDefines {
    return { [RequestKey]: stringifyJson(info) };
}
