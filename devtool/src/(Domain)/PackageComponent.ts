import { RelativePath } from "../(Commons)/Path";
import { GeneratedJson } from "./Json/GeneratedJson";

interface BasePackageComponent {
    readonly filename: RelativePath;
    readonly isPlaceholder: boolean;
}

interface JsonPackageComponent 
extends BasePackageComponent {
    readonly kind: "json";
    readonly json: JsonObject;
};

interface TypeScriptPackageComponent 
extends BasePackageComponent {
    readonly kind: "typescript";
    readonly content: string;
    
};

export type PackageComponent = (
    | JsonPackageComponent
    | TypeScriptPackageComponent
);
