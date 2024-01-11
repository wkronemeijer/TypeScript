import { pathToFileURL } from "url";
import * as express from "express";

import { Path_resolve, getLocalIp } from "@wkronemeijer/system-node";
import { terminal } from "@wkronemeijer/system";

import { configureServer } from "./Domain/ConfigureServer";

const PORT = 8080;
const ROOT = Path_resolve(".");

export function main(): void {
    // Not sure where to put this...it should only run once.
    express.static.mime.define({
        "text/plain": ["dd"]
    });
    
    configureServer(ROOT).listen(PORT);
    
    terminal.log(`Now hosting ${pathToFileURL(ROOT).href} on ${getLocalIp("IPv4")}:${PORT}`);
    terminal.log(`\n>>> Connect to http://localhost:${PORT}/ <<<\n`);
}
