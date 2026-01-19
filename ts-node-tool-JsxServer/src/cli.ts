import {parseArgumentList} from "@wkronemeijer/clap";
import {guard, isInteger} from "@wkronemeijer/system";
import {DirectoryObject} from "@wkronemeijer/system-node";

import type {bin as packageBin} from "../package.json";

export const COMMAND_NAME = "rasp" satisfies keyof typeof packageBin;
const        RASP_HOME    = "RASP_HOME";
const        DefaultRoot  = ".";
const        DefaultPort  = "8080";

type SharedOptions = {
    readonly root: DirectoryObject;
    readonly port: number;
};

type CliBuildCommand = SharedOptions & {
    readonly kind: "build";
};

type CliServeCommand = SharedOptions & {
    readonly kind: "serve";
};

type CliCommand = (
    | CliBuildCommand
    | CliServeCommand
);

export function parseArgs(args: readonly string[]): CliCommand {
    const {positionalArguments, namedArguments} = parseArgumentList(args);
    const rawPort = namedArguments["port"];
    
    const positionals = positionalArguments[Symbol.iterator]();
    
    const port = +(rawPort ?? DefaultPort);
    
    let maybeKind = positionals.next().value;
    
    let kind: CliCommand["kind"];
    if (maybeKind === "serve" || maybeKind === "build") {
        kind      = maybeKind;
        maybeKind = undefined;
    } else {
        kind = "serve";
    }
    
    let maybeDirectory = maybeKind ?? positionals.next().value;
    
    const hasSurplus = positionals.next() !== undefined;
    
    const root = new DirectoryObject(
        maybeDirectory ||
        process.env[RASP_HOME] ||
        DefaultRoot
    );

    guard(hasSurplus,
        `too many arguments`
    );
    guard(root.exists(), () => 
        `directory '${root.path}' does not exist`
    );
    // Port 0 is used to dynamically assign an unused port
    guard(isInteger(port) && port >= 0, () => 
        `'${rawPort}' is not a valid port number`
    );
    return {kind, root, port};
}
