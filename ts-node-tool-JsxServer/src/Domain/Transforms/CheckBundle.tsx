import {FileTransformRequest} from "./FileTransform";
import {terminal} from "@wkronemeijer/ansi-console";

const BundlePattern = /\.bundle\.\w+(\?|\#|$)/;

export function checkUsesBundleSuffix(req: FileTransformRequest): void {
    const uri = req.partialRequestUrl;
    if (!BundlePattern.test(uri)) {
        terminal.warn(
            `requesting '${uri}' without a .bundle suffix is deprecated`
        );
    }
}
