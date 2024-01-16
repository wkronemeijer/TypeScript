import { Directory } from "@wkronemeijer/system-node";
import { from } from "@wkronemeijer/system";

import { NoteSheaf } from "./NoteSheaf";

export class NoteBook
implements Iterable<NoteSheaf> {
    readonly sheaves: readonly NoteSheaf[];
    
    constructor(sheaves: Iterable<NoteSheaf>) {
        this.sheaves = (
            from(sheaves)
            .ordered()
            .toArray()
        );
    }
    
    static async new_async(dir: Directory): Promise<NoteBook> {        
        return new NoteBook(
            from(await dir.recursiveGetAllFiles_async())
            .selectWhere(file => NoteSheaf.new(dir, file))
        );
    }
    
    /////////////////////////
    // implements Iterable //
    /////////////////////////
    
    [Symbol.iterator](): Iterator<NoteSheaf> {
        return this.sheaves[Symbol.iterator]();
    }
}
