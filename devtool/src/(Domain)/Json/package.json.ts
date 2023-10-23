import { NodeName, NodeScriptName } from "../NodeName";
import { GeneratedJson } from "./GeneratedJson";

export interface PackageJson 
extends GeneratedJson {
    readonly "name": string;
    readonly "private": true; 
    
    // Stuff I don't really care about, but it doesn't hurt either.
    readonly "version"?: string;
    readonly "description"?: string;
    readonly "author"?: string;
    readonly "license"?: string;
    
    readonly "dependencies"?: Record<NodeName, string>;
    readonly "devDependencies"?: Record<NodeName, string>;
    readonly "optionalDependencies"?: Record<NodeName, string>;
    readonly "peerDependencies"?: Record<NodeName, string>;
    
    readonly "scripts"?: Record<NodeScriptName, string>;
}
