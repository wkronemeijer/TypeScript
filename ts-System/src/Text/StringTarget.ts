import { StringBuildable } from "./StringBuildable";
import { Falsy } from "../Types/Truthy";

export interface StringTarget {
    /** 
     * Appends the given string, while ignoring falsy values.
     */
    append(string: string | Falsy): void;
    
    /** 
     * Appends the given string and a newline.
     */
    appendLine(string?: string): void;
    
    /**
     * Includes a {@link StringBuildable} in the buffer, while ignoring falsy values.
     */
    include<TArgs extends readonly any[] = []>(
        buildable: StringBuildable<TArgs> | Falsy,
        ...args: TArgs
    ): void;
    
    /**
     * Includes a {@link StringBuildable} in the buffer and appends a newline.
     */
    includeLine<TArgs extends readonly any[] = []>(
        buildable?: StringBuildable<TArgs>, 
        ...args: TArgs
    ): void;
}
