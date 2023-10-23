import { GeneratedJson } from "../GeneratedJson";

interface BaseVscLaunchConfiguration {
    readonly "request": "launch";
    readonly "name": "Launch Program";
    
}

interface VscNodeLaunchConfiguration 
extends BaseVscLaunchConfiguration {
    readonly "type": "node";
    readonly "skipFiles": readonly ["<node_internals>/**"];
    readonly "program": "${workspaceFolder}\\server\\index.mjs";
    readonly "outFiles": readonly ["${workspaceFolder}/**/*.js"];
}

type VscLaunchConfiguration = (
    | VscNodeLaunchConfiguration
);

export interface VscLaunchJson
    extends GeneratedJson {
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    readonly "version": "0.2.0";
    readonly "configurations": readonly VscLaunchConfiguration[];
}
