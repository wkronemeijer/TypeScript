import { swear } from "../../(Commons)/Assert";

import { CodeExtension, InternalPackage, PackageArtifact, PackagePlatform } from "./InternalPackage";
import { GeneratedComment } from "../GenerationComment";
import { FileTemplate } from "../FileTemplate";
import { ComptimeFileName } from "./PlaceholderFileName";

declare function PackagePreset(
    ext: CodeExtension, 
    plat: PackagePlatform, 
    kind: PackageArtifact, 
    components: readonly ComptimeFileName[],
): void;

PackagePreset("tsx", "web", "site", [
    ".vscode/settings.json",
    "src/index.ts",
]);
