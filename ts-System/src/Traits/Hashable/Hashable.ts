//custom hash codes for js...

import { primitive_t } from "../../Types/Primitive";
import { EquatableObject } from "../Equatable/Equatable";
import { HashCode } from "./HashCode";


export interface HashableObject
extends EquatableObject {
    /** 
     * Produces a i32 hashcode. 
     * Useful for hashmaps, not for security. 
     */
    getHashCode(): HashCode;
}

export type Hashable =
    | primitive_t
    | HashableObject
;
