import * as Express from "express"
import { StrictMode } from "react";
import { renderToStaticMarkup } from "react-dom/server"

import { guard, requireFile, terminal } from "@wkronemeijer/system";

import { Medium_discoverFiles, Thumb_urlPattern } from "./Domain/Medium";
import { SortMode_applySort } from "./Domain/SortMode";
import { ProgramOptions } from "./Domain/ProgramOptions";
import { HtmlRoot } from "./Display/HtmlRoot";
import { CApp } from "./Display/App";
import { Medium_processThumbs, createThumbnailRouter } from "./Domain/Thumbnail";

function guardIsOk<T>(options: T | Error): asserts options is T {
    guard(!(options instanceof Error), () => String(options));
}

const staticFolder = requireFile("Static");

export async function main(args: string[]): Promise<void> {
    terminal.meta("Parsing arguments...");
    const options = ProgramOptions(args);
    
    guardIsOk(options);
    const { 
        targetDirectory, 
        mediaLimit, 
        port, 
        sort,
    } = options;
    
    ////////////////////
    // Discover files //
    ////////////////////
    
    const media = Medium_discoverFiles(targetDirectory);
    terminal.info(`Discovered ${media.length} media files.`);
    
    terminal.meta("Creating thumbnails...");
    await terminal.measureTime_async("thumbs", () => 
        Medium_processThumbs(media)
    );
    
    /////////////////////
    // Creating server //
    /////////////////////
    
    terminal.meta("Creating server...");
    const server = Express();
    
    server.use("/", Express.static(staticFolder.path));
    server.use("/", Express.static(targetDirectory.path));
    
    server.use(Thumb_urlPattern, createThumbnailRouter());
    
    const title = `${targetDirectory.name} - Instant Gallery`;
    
    server.get("/", (req, res) => terminal.measureTime(`get(${req.url})`, () => {
        // Sort mutates, which is why we re-render each request. 
        SortMode_applySort(sort, media);
        const html = "<!DOCTYPE html>" + renderToStaticMarkup(<StrictMode>
            <HtmlRoot {...{ title }}>
                <CApp {...{ media, mediaLimit }}/>
            </HtmlRoot>
        </StrictMode>);
        
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    }));
    
    /////////////////////
    // Starting server //
    /////////////////////
    
    server.listen(port);
    terminal.log(`\x1B[1m>>> Connect to http://localhost:${port}/ <<<\x1B[0m`);
}
