import { parse, resolve } from "path";
import { pathToFileURL } from "url";
import { lstatSync } from "fs";

import { StringEnum } from "../../(Commons)/StringEnum";
import { implies } from "../../(Commons)/Implies";
import { Member } from "../../(Commons)/Member";
import { swear } from "../../(Commons)/Assert";
import { Newtype } from "../../(Commons)/Newtype";
import { check } from "../../(Commons)/Check";

import { InternalPackagePrefix } from "../../Manifest";
import { NodeName } from "../NodeName";

export type  CodeExtension = Member<typeof CodeExtension>;
export const CodeExtension = StringEnum([
    "ts",
    "tsx",
]);

export type  PackagePlatform = Member<typeof PackagePlatform>;
export const PackagePlatform = StringEnum([
    "common",
    "node",
    "web",
]);

export type  PackageArtifact = Member<typeof PackageArtifact>;
export const PackageArtifact = StringEnum([
    "lib",
    "tool",
    "site",
]);

const packageNamePattern = 
/^((?<extension>tsx?)\-)((?<platform>common|node|web)\-)?((?<artifact>lib|tool|site)\-)?(?<name>.+)$/;

const groupNameByEnum = new WeakMap<StringEnum<any>, string>;

const aspects     = [CodeExtension, PackagePlatform, PackageArtifact];
const aspectNames = ["extension"  , "platform"     , "artifact"     ];

const generatedPackageNamePattern = new RegExp(
    "^" +
    aspects.map((part, i) => 
        `((?<${aspectNames[i]}>${part.values.join("|")})\\-)?`
    ).join("") +
    "(?<name>.+)$"
)

export type     InternalPackageName = Newtype<string, "InternalPackageName">;
export function InternalPackageName(string: string): InternalPackageName {
    check.matches(string, packageNamePattern);
    return string as string as any;
}

interface InternalPackageName_Analysis {
    readonly extension: CodeExtension;
    readonly artifact: PackageArtifact;
    readonly platform: PackagePlatform;
    readonly naturalName: string;
}

export function InternalPackageName_analyze(self: InternalPackageName): InternalPackageName_Analysis {
    let match;
    
    swear(match = packageNamePattern.exec(self));
    swear(match.groups);
    const extension   = match.groups["extension"] ?? undefined;
    const platform    = match.groups["platform"]  ?? undefined;
    const artifact    = match.groups["artifact"]  ?? undefined;
    const naturalName = match.groups["name"];
    swear(CodeExtension.hasInstance(extension));
    swear(PackagePlatform.hasInstance(platform));
    swear(PackageArtifact.hasInstance(artifact));
    swear(naturalName);
    
    return {
        extension,
        platform,
        artifact,
        naturalName,
    };
}

export interface InternalPackage {
    /** e.g. `C:\Users\Gebruiker\Documents\Developer\Monorepos\TypeScript\ts-node-lib-TerminalDiagnosticTool` */
    readonly path: string;
    /** e.g. `file:///C:/Users/Gebruiker/Documents/Developer/Monorepos/TypeScript/ts-node-lib-TerminalDiagnosticTool` */
    readonly uriPath: URL;
    
    readonly kind: PackageKind | undefined;
    readonly platform: PackagePlatform | undefined;
    
    /** e.g. `TerminalDiagnosticTool` */
    readonly naturalName: string;
    /** e.g. `terminal-diagnostic-tool` */
    readonly nodeName: NodeName;
    
    toString(): string;
}

interface InternalPackageConstructor {
    new(path: string): InternalPackage;
}

// e.g. TerminalDiagnosticTool -> terminal-diagnostic-tool
function deriveUnscopedNodeName(naturalName: string): NodeName {
    return NodeName(
        naturalName
        .replace(/^[A-Z]/g, s => s.toLowerCase())
        .replace( /[A-Z]/g, s => '-' + s.toLowerCase())
    );
}

// e.g. TerminalDiagnosticTool -> @wkronemeijer/terminal-diagnostic-tool
function deriveNodeName(naturalName: string): NodeName {
    return NodeName(InternalPackagePrefix + deriveUnscopedNodeName(naturalName));
}

export const InternalPackage 
:            InternalPackageConstructor
= class      ExternalPackageImpl 
implements   InternalPackage {
    readonly kind: PackageKind | undefined;
    readonly platform: PackagePlatform | undefined;
    readonly naturalName: string;
    readonly nodeName: NodeName;
    readonly path: string;
    readonly uriPath: URL;
    
    constructor(path: string) {
        let match;
        path = resolve(path);
        
        swear(lstatSync(path).isDirectory(), 
            `'${path}' is not a directory.`);
        const { name } = parse(path);
        
        swear(match = packageNamePattern.exec(name), 
            `'${name}' does not match package naming scheme.`);
        swear(match.groups);
        const platform    = match.groups["platform"] ?? undefined;
        const kind        = match.groups["kind"]     ?? undefined;
        const naturalName = match.groups["name"];
        swear(platform === undefined || PackagePlatform.hasInstance(platform));
        swear(kind     === undefined || PackageKind.hasInstance(kind)        );
        swear(naturalName);
        
        // what would a web tool be like?
        swear(implies(kind === "tool", platform === "node"), 
            `Tools can only be run on node.`);
        swear(implies(kind === "site", platform === "web" ), 
            `Sites can only be run on the web.`);
        
        this.path    = path;
        this.uriPath = pathToFileURL(path);
        
        this.kind     = kind;
        this.platform = platform;
        
        this.naturalName = naturalName;
        this.nodeName    = deriveNodeName(naturalName);
    }
    
    toString(): string {
        return `InternalPackage(${this.uriPath})`;
    }
}
