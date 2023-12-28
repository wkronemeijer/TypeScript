import { FileEntityKind } from "./EntityKind";

export interface FileEntityStats {
    readonly kind: FileEntityKind;
    readonly lastModifiedMs: number;
}
