// lstat().ctime
// date + triple
/*
FIXME: delet tis
Normally I would say do a proper setup
But you can wing this

*/

interface CachedSheaveInfo {
    readonly path?: string;
    readonly ctime?: number;
    readonly noteCount?: number;
    readonly lineCount?: number;
    readonly wordCount?: number;
}

interface CachedNotebookInfo {
    readonly sheaves?: readonly CachedSheaveInfo[];
}
