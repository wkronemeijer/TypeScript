import { StringBuildable } from "./StringBuildable";
import { Falsy } from "../Types/Truthy";

/** Same as {@link StringTarget}, but restricted to `xyzLine` methods. */
export interface StringTargetLine {
    /** 
     * Appends the given string and a newline.
     */
    appendLine(string?: string | Falsy): void;
    
    /**
     * Includes a {@link StringBuildable} in the buffer and appends a newline.
     */
    includeLine<TArgs extends readonly any[] = []>(
        buildable?: StringBuildable<TArgs> | Falsy, 
        ...args: TArgs
    ): void;
}

/**
 * Represents a target where strings and `StringBuildable`s can be go.
 */
export interface StringTarget 
extends StringTargetLine {
    /** 
     * Appends the given string, while ignoring falsy values.
     */
    append(string: string | Falsy): void;
    
    /**
     * Includes a {@link StringBuildable} in the buffer, while ignoring falsy values.
     */
    include<TArgs extends readonly any[] = []>(
        buildable: StringBuildable<TArgs> | Falsy,
        ...args: TArgs
    ): void;
    
}
