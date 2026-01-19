import {getAddressPort, getLocalIp} from "@wkronemeijer/system-node";
import {parseArgs, COMMAND_NAME} from "./cli";
import {configureServer} from "./Domain/ConfigureServer";
import {powerlineLabel} from "@wkronemeijer/ansi-console";
import {StringBuilder} from "@wkronemeijer/system";

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
