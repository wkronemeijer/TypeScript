import { Newtype } from "@wkronemeijer/system";
import { GeneratedJson } from "../GeneratedJson";

// See https://code.visualstudio.com/docs/editor/tasks-appendix

type VscTaskGroupKind = (
    | "build" 
    | "test" 
);

type VscTaskGroup = (
    | VscTaskGroupKind
    | {
        readonly kind: VscTaskGroupKind;
        readonly isDefault: boolean;
    }
);

interface VscTaskPresentationOptions {
    readonly "echo": boolean;
    readonly "reveal": (
        | "always"
        | "silent" 
        | "never" 
    );
    readonly "focus": false;
    readonly "panel": "dedicated";
    readonly "showReuseMessage": true;
    readonly "clear": true;
}

type VscTaskLabel = Newtype<string, "VscTaskLabel">;

type VscTaskProblemMatcherKind = (
    | "$tsc"
    | "$tsc-watch"
    | "$esbuild"
    | "$esbuild-watch"
    | "$node-sass"
    | "$sass-loader"
    | (string & {})
);

type VscTaskProblemMatcher = (
    | VscTaskProblemMatcherKind 
    | readonly VscTaskProblemMatcherKind[]
);

interface BaseVscTask {
    readonly label: VscTaskLabel;
    readonly "presentation": ;
    readonly "isBackground": true,
    readonly "problemMatcher": VscTaskProblemMatcher,
    readonly "dependsOn": readonly VscTaskLabel[];
}

interface VscShellTask 
extends BaseVscTask {
    
}

interface VscNpmTask 
extends BaseVscTask {
    "type": "npm",
    "script": "build",
    "group": VscTaskGroup;
    "problemMatcher": [
        "$tsc"
    ],
    "presentation": {
        "echo": true,
        "reveal": "silent",
        "focus": false,
        "panel": "dedicated",
        "showReuseMessage": true,
        "clear": true
    },
    "label": "npm: build",
    "detail": "esbuild ./src/index.tsx --bundle --outfile=dist/index.js"
}

interface VscBrowserTask 
extends BaseVscTask {
    
}

type VscTask = (
    | VscShellTask
    | VscBrowserTask
);

export interface VscTasksJson 
extends GeneratedJson {
    readonly "version": "2.0.0";
    readonly tasks: readonly VscTask[];
}
