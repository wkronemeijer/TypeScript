import { MediumAttributeMap, MediumAttributeMap_from } from "./AttributeMap";
import { MediumFileExtension, MediumUri_getExtension } from "../FileExtension";
import { AudioUri, ImageUri, MediumUri } from "../Uri";
import { swear } from "@wkronemeijer/system";

const AttributesByExtension = new Map<MediumFileExtension, MediumAttributeMap>;

export function MediumFileExtension_addAssociation(
    extension: MediumFileExtension, 
    attributes: MediumAttributeMap,
): void {
    swear(!AttributesByExtension.has(extension), () =>
        `attributes for extension '${extension}' have already been defined`
    );
    AttributesByExtension.set(extension, attributes);
}

interface AttributeWrapper {
    readonly canBe: MediumAttributeMap;
}

export function MediumUri_getAttributes(
    self: MediumUri,
    base?: string,
): AttributeWrapper | undefined {
    let extension, map;
    if (extension = MediumUri_getExtension(self, base)) {
        if (map = AttributesByExtension.get(extension)) {
            return { canBe: map };
        }
    }
}

export const isImageUrl = (file: MediumUri): file is ImageUri => MediumUri_getAttributes(file)?.canBe.image ?? false;
export const isAudioUrl = (file: MediumUri): file is AudioUri => MediumUri_getAttributes(file)?.canBe.audio ?? false;

//////////////////////
// Filling database //
//////////////////////

function register(rawExtension: string, rawAttributes: string): void {
    const extension  = MediumFileExtension(rawExtension.trim());
    const attributes = MediumAttributeMap_from(rawAttributes);
    MediumFileExtension_addAssociation(extension, attributes);
}

// Good source: https://en.wikipedia.org/wiki/Container_format#Multimedia_container_formats
// NB: If 95%+ of a certain format are static (like webp), 
// then it is considered static,
// even if webp can technically contain multiple frames.

register(".jpg" , "image");
register(".jpeg", "image");
register(".jfif", "image");
register(".png" , "image");
register(".webp", "image");
register(".svg" , "image");

register(".gif" , "dynamic image");
register(".apng", "dynamic image");

register(".mp3" , "audio");
register(".m4a" , "audio");
register(".wav" , "audio");
register(".flac", "audio");

register(".mp4", "audio video");
register(".ogg", "audio video");

register(".webm", "video");

// ...this is actually a tagging system 
// TODO: introduce @wkronemeijer/taggert
