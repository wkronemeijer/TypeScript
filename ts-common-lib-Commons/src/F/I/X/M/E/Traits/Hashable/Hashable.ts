//custom hash codes for js...

import { value_t } from "../../Types/Primitive";
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
    | value_t
    | HashableObject
;
