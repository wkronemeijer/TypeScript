import { RelativePath } from "../../../(Commons)/Path";
import { GeneratedJson } from "../GeneratedJson";

export interface VscSettingsJson
extends GeneratedJson {
    readonly "typescript.tsdk": RelativePath;
}
