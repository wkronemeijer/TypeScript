import { AnsiColor, AnsiTextStyle_use, StringBuildable, StringBuilder, stringBuild } from "@wkronemeijer/system";

import { DiagnosticKind, DiagnosticKind_getColor, DiagnosticKind_isFatal } from "./DiagnosticKind";
import { DiagnosticDisplayMode } from "./DiagnosticDisplayMode";
import { SourceTextRange } from "../SourceTextRange";

export class Diagnostic 
implements StringBuildable<[mode: DiagnosticDisplayMode]> {
    private readonly color: AnsiColor;
    
    readonly isFatal   : boolean;
    readonly isNotFatal: boolean;
    
    constructor(
        readonly kind: DiagnosticKind,
        readonly location: SourceTextRange,
        readonly message: string,
    ) {
        this.color      = DiagnosticKind_getColor(kind);
        this.isFatal    = DiagnosticKind_isFatal(kind);
        this.isNotFatal = !this.isFatal;
    }
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    buildString(result: StringBuilder, mode: DiagnosticDisplayMode): void {
        const {
            apply: setColor,
            unset: unsetColor,
        } = AnsiTextStyle_use({ color: this.color });
        
        const {
            apply: setBold,
            unset: unsetBold,
        } = AnsiTextStyle_use({ fontWeight: "bold" });
        
        result.include(this.location, mode);
        result.append(setColor);
        if (mode === "inline") {
            result.append(" \u2503 ");
        } else {
            result.appendLine();
        }
        result.append(setBold);
        result.append(this.kind);
        result.append(unsetBold);
        result.append(": ");
        result.append(this.message);
        if (mode === "block") {
            result.appendLine();
            result.append(this.location.getPreview());
        }
        result.append(unsetColor);
    }
    
    toString(mode = DiagnosticDisplayMode.default): string {
        return stringBuild(this, mode);
    }
}
