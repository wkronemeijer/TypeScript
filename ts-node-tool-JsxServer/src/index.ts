import { pathToFileURL } from "url";

import { getLocalIp } from "@wkronemeijer/system-node";
import { terminal } from "@wkronemeijer/system";

import { configureServer } from "./Domain/ConfigureServer";
import { resolve } from "path";

const PORT = 8080;
const ROOT = resolve(".");

export async function main(): Promise<void> {
    configureServer(ROOT).listen(PORT);
    
    terminal.log(`Now hosting ${pathToFileURL(ROOT).href} on ${getLocalIp("IPv4")}:${PORT}`);
    terminal.log(`\n>>> Connect to http://localhost:${PORT}/ <<<\n`);
}
