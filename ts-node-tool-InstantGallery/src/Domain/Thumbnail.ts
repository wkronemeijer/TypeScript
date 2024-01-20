import { lstat } from "node:fs/promises";

import { Directory, File, Path_AppData } from "@wkronemeijer/system-node";
import { terminal } from "@wkronemeijer/system";

import { Router } from "express";
import * as sharp from "sharp";

import { Medium } from "./Medium";
import { Hash } from "./Hash";

const thumbDirectory = (
    new Directory(Path_AppData)
    .join("wkronemeijer")
    .join("InstantGallery")
);
terminal.meta(`Cache = ${thumbDirectory}`);
thumbDirectory.touchDirectory();

function Hash_getThumbFile(self: Hash): File {
    return thumbDirectory.join(`${self}.jpeg`);
}

export function Medium_getThumbFile(self: Medium): File {
    return Hash_getThumbFile(self.hash);
}

async function Medium_thumbExists(self: Medium): Promise<boolean> {
    try {
        await lstat(Medium_getThumbFile(self).path);
        return true;
    } catch (_) {
        return false;
    }
}

const thumbJpegSize = 300;
const thumbJpegOptions: sharp.JpegOptions = {
    quality: 90,
    chromaSubsampling: "4:2:0",
    force: true,
};

export async function Medium_createThumb(self: Medium): Promise<void> {
    if (self.kind !== "img") {
        return;
        // TODO: Use ffmpeg to extract thumbnails for videos.
    }
    
    
    if (await Medium_thumbExists(self)) {
        return;
    }
    
    terminal.trace(`Creating thumb for ${self.file}`);
    
    const inputPath  = self.file.path;
    const outputPath = Medium_getThumbFile(self).path;
    
    await (
        sharp(inputPath)
        .resize({
            width: thumbJpegSize,
            height: thumbJpegSize,
            fit: "cover",
        })
        // TODO: Investigate the .jpeg options.
        .jpeg(thumbJpegOptions)
        .toFile(outputPath)
    );
}

export async function Medium_processThumbs(media: Iterable<Medium>): Promise<void> {
    const copy = Array.from(media);
    for (const medium of copy) {
        await Medium_createThumb(medium);
    }
}

export function createThumbnailRouter(): Router {
    const router = Router();
    
    router.get("/:hash", (req, res) => {
        const file = Hash_getThumbFile(Hash(req.params.hash));
        res.sendFile(file.path);
    });
    
    return router;
}
