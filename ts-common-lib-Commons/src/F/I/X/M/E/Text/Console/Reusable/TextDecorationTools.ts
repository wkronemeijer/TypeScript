import { consoleLikeFormat } from "../../Formatting/Inspect";
import { DecoratedString, DecoratedString_new, DecorationStyle } from "./DecoratedString";

const decorate = DecoratedString_new;

function createTool(style: DecorationStyle): (...args: unknown[]) => DecoratedString {
    return (...args) => decorate(style, consoleLikeFormat(args))
}

export namespace TextDecorationTools {
    export const red     = createTool({ foreground: { kind: "4bit", name: "red"     }});
    export const green   = createTool({ foreground: { kind: "4bit", name: "green"   }});
    export const blue    = createTool({ foreground: { kind: "4bit", name: "blue"    }});
    export const cyan    = createTool({ foreground: { kind: "4bit", name: "cyan"    }});
    export const magenta = createTool({ foreground: { kind: "4bit", name: "magenta" }});
    export const yellow  = createTool({ foreground: { kind: "4bit", name: "yellow"  }});
    export const black  = createTool({ foreground: { kind: "4bit", name: "black"  }});;
    export const white  = createTool({ foreground: { kind: "4bit", name: "white"  }});;
    
    export const bold           = createTool({ });;
    export const italic         = __NOT_IMPLEMENTED;
    export const reversed       = __NOT_IMPLEMENTED;
    export const underlined     = __NOT_IMPLEMENTED;
    export const strikethrough  = __NOT_IMPLEMENTED;
}
