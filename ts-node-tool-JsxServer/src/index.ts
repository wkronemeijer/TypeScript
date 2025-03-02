import {DirectoryObject, getAddressPort, getLocalIp} from "@wkronemeijer/system-node";
import {terminal, powerlineLabel} from "@wkronemeijer/ansi-console";
import {parseArgumentList} from "@wkronemeijer/clap";
import {guard, isInteger} from "@wkronemeijer/system";
import {configureServer} from "./Domain/ConfigureServer";
import {express} from "./lib";

// Not sure where to put this...it should only run once.
function registerCustomFileTypes() {
    express.static.mime.define({
        "text/plain": ["dd"],
        "image/jpeg": ["jfif"],
        "image/avif": ["avif"],
    });
}

const RASP_HOME = "RASP_HOME";

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
    
    terminal.log(`${powerlineLabel("Root folder")} ${root.url.href}`);
    terminal.log(`${powerlineLabel("Local address")} ${getLocalIp("IPv4")}:${actualPort}`);
    terminal.log(`\n>>> Connect to http://localhost:${actualPort}/ <<<\n`);
}
