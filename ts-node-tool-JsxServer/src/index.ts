import {guard, isInteger, powerlineLabel, terminal} from "@wkronemeijer/system";
import {DirectoryObject, getLocalIp} from "@wkronemeijer/system-node";
import {parseArgumentList} from "@wkronemeijer/clap";
import {configureServer} from "./Domain/ConfigureServer";
import {express} from "./lib";

const RASP_HOME = "RASP_HOME";

// Not sure where to put this...it should only run once.
function registerCustomFileTypes() {
    express.static.mime.define({
        "text/plain": ["dd"],
        "image/jpeg": ["jfif"],
    });
}

export async function main(args: readonly string[]): Promise<void> {
    ////////////////
    // Parse args //
    ////////////////
    
    const {
        positionalArguments: [positionalRoot, ...surplus], 
        namedArguments: {
            root: rawRoot, 
            port: rawPort,
        },
    } = parseArgumentList(args);
    
    const root = new DirectoryObject(rawRoot || positionalRoot || process.env[RASP_HOME] || ".");
    const port = +(rawPort ?? "8080");
    
    guard(surplus.length === 0, "too many arguments");
    guard(rawRoot === undefined || positionalRoot === undefined, 
        "a positional and a named root can not be given at the same time"
    );
    guard(root.exists(), () => 
        `directory '${root.path}' does not exist`
    )
    guard(isInteger(port) && port > 0, () => 
        `'${rawPort}' is not a valid port number`
    );
    
    ///////////
    // Start //
    ///////////
    
    process.chdir(root.path);
    
    registerCustomFileTypes();
    
    configureServer(root).listen(port);
    
    terminal.log(`${powerlineLabel("Root folder")} ${root.url.href}`);
    terminal.log(`${powerlineLabel("Local address")} ${getLocalIp("IPv4")}:${port}`);
    terminal.log(`\n>>> Connect to http://localhost:${port}/ <<<\n`);
}
