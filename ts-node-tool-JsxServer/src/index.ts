import {DirectoryObject, getAddressPort, getLocalIp} from "@wkronemeijer/system-node";
import {guard, isInteger, StringBuilder} from "@wkronemeijer/system";
import type {bin as PackageBin} from "../package.json";
import {parseArgumentList} from "@wkronemeijer/clap";
import {configureServer} from "./Domain/ConfigureServer";
import {powerlineLabel} from "@wkronemeijer/ansi-console";

// Not sure where to put this...it should only run once.
function registerCustomFileTypes() {
    // Can't seem to find how to add MIME types for local extensions in 
    // Express v5
    // express.static.mime.define({
    //     "text/plain": ["dd"],
    //     "image/jpeg": ["jfif"],
    //     "image/avif": ["avif"],
    // });
}

const COMMAND_NAME = "rasp-server" satisfies keyof typeof PackageBin;
const RASP_HOME    = "RASP_HOME";

const DefaultRoot = ".";
const DefaultPort = "8080";

function parseArgs(args: readonly string[]) {
    const {
        positionalArguments: [positionalRoot, ...surplus], 
        namedArguments: {
            root: namedRoot, 
            port: rawPort,
        },
    } = parseArgumentList(args);
    
    const port = +(rawPort ?? DefaultPort);
    const root = new DirectoryObject(
        namedRoot              ||
        positionalRoot         ||
        process.env[RASP_HOME] ||
        DefaultRoot
    );
    
    guard(surplus.length === 0,
        `too many arguments`
    );
    guard(namedRoot === undefined || positionalRoot === undefined,
        `a positional and a named root can not be defined at the same time`
    );
    guard(root.exists(), () => 
        `directory '${root.path}' does not exist`
    );
    // Port 0 is used to dynamically assign an unused port
    guard(isInteger(port) && port >= 0, () => 
        `'${rawPort}' is not a valid port number`
    );
    return {root, port};
}

export async function main(args: readonly string[]): Promise<void> {
    const {root, port: desiredPort} = parseArgs(args);
    
    registerCustomFileTypes();
    process.chdir(root.path);
    const server = configureServer(root).listen(desiredPort);
    
    const actualPort = getAddressPort(server) ?? desiredPort;
    
    const openingMessage = new StringBuilder;
    
    openingMessage.append(powerlineLabel("Root folder"));
    openingMessage.append(' ');
    openingMessage.append(root.url.href);
    openingMessage.appendLine();
    
    openingMessage.append(powerlineLabel("Local address"));
    openingMessage.append(' ');
    openingMessage.append(getLocalIp("IPv4"));
    openingMessage.append(':');
    openingMessage.append(actualPort.toString());
    openingMessage.appendLine();
    
    openingMessage.append(`\x1B]0;${COMMAND_NAME}\x1B\\`);
    openingMessage.appendLine();
    
    openingMessage.append(`>>> Connect to http://localhost:${actualPort}/ <<<`);
    openingMessage.appendLine();
    
    console.log(openingMessage.toString());
}
