import { requires } from "../Assert";
import { panic } from "../Errors/ErrorFunctions";
import { Directory, File } from "../IO/FileSystem/Entity";
import { AnyPath, Path_Separator, RelativePath } from "../IO/FileSystem/Path";
import { Printable } from "../Traits/Printable";
import { getCallerFile } from "./Caller";


interface PathTransposer_Options {
    /** The alternate for the distribution root. Default to "dist". */
    readonly dist?: RelativePath;
    /** The alternate for the source root. Default to "src". */
    readonly src?: RelativePath;
    /** Offset used for caller reflection. */
    readonly offset?: number;
}

export class PathTransposer implements Printable {
    /** "**dist**rubition" root, aka where the JavaScript files reside. */
    readonly distRoot: Directory;
    /** "**s**ou**rc**e" root, aka where the TypeScript files reside. */
    readonly srcRoot: Directory;
    
    constructor(options: PathTransposer_Options = {}) {
        const {
            dist   = RelativePath("dist"),
            src    = RelativePath("src"),
            offset = 0, 
        } = options;
        
        requires(dist.split(Path_Separator).length === 1,
            "dist must have a single component.");
        requires(src.split(Path_Separator).length === 1,
            "src must have a single component.");        
        
        const searchRoot = getCallerFile(1 + offset);
        
        let current = searchRoot;
        while (true) {
            if (current.isRoot) {
                panic(`Expected '${dist}' path segment to appear in path starting in '${searchRoot}'.`);
            } else if (current.fullName === dist) {
                break;
            } else {
                current = current.parent;
            }
        }
        
        this.distRoot = current;
        this.srcRoot  = this.distRoot.parent.join(src);
    }
    
    translatePath(root: Directory, anyPath: AnyPath): File {
        const actualTarget   = root.join(anyPath);
        
        // Calculate delta from root and move to other root
        const delta          = this.distRoot.to(actualTarget);
        const intendedTarget = this.srcRoot.join(delta);
        
        return intendedTarget;
    }
    
    translateLocalPath(anyPath: AnyPath): File {
        const root = getCallerFile().parent;
        return this.translatePath(root, anyPath);
    }
    
    toString(): string {
        return `${PathTransposer.name}(dist=${this.distRoot},src=${this.srcRoot})`;
    }
}
