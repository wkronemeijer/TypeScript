import { StringBuildable, StringBuilder, stringBuild } from "@local/system";
import { TokenKind } from "./TokenKind";

function possibleContinuationChars(
    tokens: Iterable<string>,
    lexemeSoFar: string,
): Iterable<string> {
    const result = new Set<string>;
    let nextChar;
    for (const token of tokens) {
        if (token.startsWith(lexemeSoFar)) {
            if (nextChar = token[lexemeSoFar.length]) {
                result.add(nextChar);
            }
        }
    }
    return result;
}

//////////////////////
// TokenMatcherNode //
//////////////////////

// Why do I do these split interface things...
// well it forces you to keep your objects minimal
// stops them from accumulating tens of "helper" methods
interface TokenMatcherNode_Base
extends StringBuildable {
    accept(char: string): TokenMatcherNode | false;
    willAccept(char: string): boolean;
}


interface TokenMatcherNode_Terminal
extends TokenMatcherNode_Base {
    readonly isComplete: true;
    readonly lexeme: string;
}

interface TokenMatcherNode_NonTerminal
extends TokenMatcherNode_Base {
    readonly isComplete: false;
    readonly lexeme: unknown;
}

interface TokenMatcherNode_Intersection // for the impl (can't implement a union)
extends TokenMatcherNode_Base {
    readonly isComplete: boolean;
    readonly lexeme: string;
}

export type TokenMatcherNode = 
    | TokenMatcherNode_Terminal
    | TokenMatcherNode_NonTerminal
;

interface TokenMatcherNode_Constructor {
    from(tokens: Iterable<string>): TokenMatcherNode;
}

export const TokenMatcherNode
:            TokenMatcherNode_Constructor =
class        TokenMatcherNode_Impl
implements   TokenMatcherNode_Intersection {
    readonly isComplete: boolean;
    
    readonly connections = new Map<string, TokenMatcherNode>;
    
    constructor(
        tokens: readonly string[],
        readonly lexeme: string,
    ) {
        this.isComplete = tokens.includes(lexeme);
        
        for (const continueChar of possibleContinuationChars(tokens, lexeme)) {
            const nextLexeme = lexeme + continueChar;
            const nextNode   = new TokenMatcherNode_Impl(tokens, nextLexeme);
            this.connections.set(continueChar, nextNode);
        }
    }
    
    ////////////////////////////////////////
    // implements TokenMatcherNode_Common //
    ////////////////////////////////////////
    
    accept(char: string): TokenMatcherNode | false {
        return this.connections.get(char) ?? false;
    }
    
    willAccept(char: string): boolean {
        return this.accept(char) && true;
    }
    
    /////////////////////////////////////////////
    // implements TokenMatcherNode_Constructor //
    /////////////////////////////////////////////
    
    static from(this: unknown, tokens: Iterable<string>): TokenMatcherNode {
        const tokenArray = Array.from(tokens);
        return new TokenMatcherNode_Impl(tokenArray, "");
    }
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    buildString(result: StringBuilder): void {
        result.append(this.isComplete ? "Terminal" : "Non-terminal");
        result.append(" ");
        result.append(this.connections.size ? "node" : "leaf");
        result.append(" \"");
        result.append(this.lexeme);
        result.append("\"");
        
        result.indent();
        for (const [char, sequent] of this.connections) {
            result.appendLine();
            result.append(char)
            result.append(" --> ");
            result.include(sequent);
        }
        result.dedent();
    }
    
    toString(): string {
        return stringBuild(this);
    }
}
