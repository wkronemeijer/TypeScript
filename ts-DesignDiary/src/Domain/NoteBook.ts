import { Directory, collect } from "@wkronemeijer/system";
import { NoteSheafPath_hasInstance } from "./NoteSheafPath";
import { NoteSheaf } from "./NoteSheaf";

///////////////////
// Finding notes //
///////////////////

export const Notebook_compose = collect(function* (
    sourceDir: Directory
): Iterable<NoteSheaf> {
    for (const file of sourceDir.recursiveGetAllFiles()) {
        if (NoteSheafPath_hasInstance(sourceDir.to(file))) {
            yield new NoteSheaf(sourceDir, file);
        }
    }
});


export interface NoteBook {
    analyze(): NotebookInsights;
}

interface NoteBookConstructor {
    new(sheaves: Iterable<NoteSheaf>): NoteBook;
    fromDirectory(dir: Directory): NoteBook;
}

export const NoteBook
:            NoteBookConstructor
= class      NoteBookImpl
implements   NoteBook {
    
};
