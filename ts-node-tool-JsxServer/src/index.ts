import "@wkronemeijer/system";
import "@wkronemeijer/system-node";
import "esbuild";
import "express";
import "react";
import "react-dom/server";
import "sass-embedded";

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
        "text/plain": ["dd"],
    });
    
    configureServer(ROOT).listen(PORT);
    
    terminal.log(`Root folder: ${pathToFileURL(ROOT).href}`);
    terminal.log(`Local address: ${getLocalIp("IPv4")}:${PORT}`);
    terminal.log(`\n>>> Connect to http://localhost:${PORT}/ <<<\n`);
}
