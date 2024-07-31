import {Path_resolve, getLocalIp} from "@wkronemeijer/system-node";
import {configureServer} from "./Domain/ConfigureServer";
import {pathToFileURL} from "url";
import {terminal} from "@wkronemeijer/system";
import {express} from "./lib";

const PORT = 8080;
const ROOT = Path_resolve(".");

// Not sure where to put this...it should only run once.
function registerCustomFileTypes() {
    express.static.mime.define({
        "text/plain": ["dd"],
    });
}

export function main(): void {
    registerCustomFileTypes();
    
    configureServer(ROOT).listen(PORT);
    
    terminal.log(`Root folder: ${pathToFileURL(ROOT).href}`);
    terminal.log(`Local address: ${getLocalIp("IPv4")}:${PORT}`);
    terminal.log(`\n>>> Connect to http://localhost:${PORT}/ <<<\n`);
}
