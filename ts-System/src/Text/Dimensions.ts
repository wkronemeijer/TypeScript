import { from } from "../Collections/Sequence";
import { TextLocation } from "./Location1";

interface TextDimensions {
    readonly maxLn: number;
    readonly maxCol: number;
    readonly maxLnLength: number;
    readonly maxColLength: number;
    readonly maxLocationLength: number;
}

function strlen(x: unknown): number {
    return String(x).length;
}

export function Text_getDimensions(self: string): TextDimensions {
    const lines = self.split("\n");
    
    const maxCol = from(lines).max(line => line.length) + 1;
    const maxLn  = lines.length + 1;
    
    const maxColLength = strlen(maxCol);
    const maxLnLength  = strlen(maxLn);
    
    const maxLocationLength = strlen(
        new TextLocation(maxLn, maxCol)
    );
    
    return { 
        maxCol, maxColLength, 
        maxLn,  maxLnLength, 
        maxLocationLength,
    };
}
