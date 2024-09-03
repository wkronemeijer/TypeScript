import {DirectoryObject, getLocalIp} from "@wkronemeijer/system-node";
import {configureServer} from "./Domain/ConfigureServer";
import {terminal} from "@wkronemeijer/system";
import {express} from "./lib";

// Not sure where to put this...it should only run once.
function registerCustomFileTypes() {
    express.static.mime.define({
        "text/plain": ["dd"],
    });
}

export async function main([dir]: readonly string[]): Promise<void> {
    if (dir) {
        process.chdir(dir);
    }
    const root = new DirectoryObject(".");
    const port = 8080;
    
    registerCustomFileTypes();
    
    configureServer(root).listen(port);
    
    terminal.log(`Root folder ▶ ${root.url.href}`);
    terminal.log(`Local address ▶ ${getLocalIp("IPv4")}:${port}`);
    terminal.log(`\n>>> Connect to http://localhost:${port}/ <<<\n`);
}
