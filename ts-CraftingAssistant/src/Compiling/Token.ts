import { StringBuildable, StringBuilder, stringBuild } from "@wkronemeijer/system";

import { TokenKind, TokenKind_canSynchronizeAfter, TokenKind_canSynchronizeBefore } from "./TokenKind";
import { HasLocation, SourceTextRange } from "./SourceTextRange";

export class Token implements HasLocation, StringBuildable {
    constructor(
        readonly kind: TokenKind,
        readonly lexeme: string,
        readonly location: SourceTextRange,
    ) { }
    
    // Getters so the happy path does not incur any cost
    get canSynchronizeBefore(): boolean {
        return TokenKind_canSynchronizeBefore(this.kind);
    }
    
    get canSynchronizeAfter(): boolean {
        return TokenKind_canSynchronizeAfter(this.kind);
    }
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    buildString(result: StringBuilder): void {
        result.append(this.kind.padEnd(TokenKind.maxLength));
        result.append(" |");
        result.append(this.lexeme);
        result.append("| ");
    }
    
    toString(): string {
        return stringBuild(this);
    }
}
