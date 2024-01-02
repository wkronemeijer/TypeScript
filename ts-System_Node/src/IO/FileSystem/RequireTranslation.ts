// require("MyBitmap.png")
// WHOOPS! You are using TS, which means its somewhere else entirely
// Which is what this function is for. A wrapper around require.resolve

import { panic, requires } from "@wkronemeijer/system";

import { AnyPath, Path_Separator, RelativePath } from "./Path";
import { Directory, File } from "./FileObject";
import { getCallerFile } from "../../Reflection/Caller";

interface PathTranslator_Options {
    /** Location of JS files. */
    readonly dist: RelativePath;
    /** Location of TS source files. */
    readonly src: RelativePath;
}

export function PathTranslator_create(options: PathTranslator_Options): (path: AnyPath) => File {
    const { dist, src } = options;
    requires(dist.split(Path_Separator).length === 1,
        "dist must have a single component.");
    requires(src.split(Path_Separator).length === 1,
        "src must have a single component.");
    
    return anyPath => {
        const distFile = getCallerFile();
        
        // Search for roots
        let current: Directory = distFile;
        while (true) {
            if (current.isRoot) {
                panic(`Expected '${dist}' path segment to appear in path starting in '${distFile}'.`);
            } else if (current.fullName === dist) {
                break;
            } else {
                current = current.parent;
            }
        }
        
        const distRoot = current;
        const srcRoot  = distRoot.parent.join(src);
        
        // Calculate delta from root and move to other root
        const actualTarget   = distFile.parent.join(anyPath);
        const delta          = distRoot.to(actualTarget);
        const intendedTarget = srcRoot.join(delta);
        
        return intendedTarget;
    }
}

/** Resolves to files using (my standard) `dist` and `src` folders. */
// as for why not use the default args? because now this is 1 instance shared by (all of my) code.
export const requireFile = PathTranslator_create({
    dist: RelativePath("dist"),
    src: RelativePath("src"),
});
