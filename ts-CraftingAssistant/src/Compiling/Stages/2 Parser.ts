import { Array_firstElement, Array_lastElement, ExpandType, panic, requires, singularize, terminal } from "@wkronemeijer/system";

import { AstNodeKind, AstNodeMap, Decl, ImportStmt, NamespaceDecl, QuantifiedItemExpr, QuantifiedQualifiedItemExpr, QuantityExpr, QuantityRangeExpr, SourceNode, Stmt } from "../../Ast/AstNode";
import { HasLocation, SourceTextRange } from "../SourceTextRange";
import { Quality, Quality_default } from "../../Domain/Quality";
import { DiagnosticCollection } from "../Diagnostics/DiagnosticCollection";
import { DiagnosticKind } from "../Diagnostics/DiagnosticKind";
import { CompileResult } from "../CompileResult";
import { Diagnostic } from "../Diagnostics/Diagnostic";
import { Identifier } from "../../Domain/Identifier";
import { SourceCode } from "../SourceCode";
import { TokenKind } from "../TokenKind";
import { Quantity } from "../../Domain/Quantity";
import { Token } from "../Token";

function extractSourceCode(tokens: readonly Token[]): SourceCode {
    const eof = Array_lastElement(tokens);
    requires(eof, "Tokens must include EOF.");
    return eof.location.sourceCode;
}

const startSynchronization = new Object;

type NodeComposer<K extends AstNodeKind> = 
    (props: ExpandType<Omit<AstNodeMap[K], "kind" | "location">>) => AstNodeMap[K]
;

class Parser {
    readonly sourceCode: SourceCode;
    readonly diagnostics = new DiagnosticCollection;
    
    current: number = 0;
    
    constructor(
        readonly tokens: readonly Token[],
    ) {
        this.sourceCode = extractSourceCode(tokens);
    }
    
    //////////////////////
    // Error processing //
    //////////////////////
    
    report(kind: DiagnosticKind, location: SourceTextRange, message: string): void {
        this.diagnostics.add(new Diagnostic(kind, location, message));
    }
    
    error(message: string): never {
        this.report("error", this.currentToken.location, message);
        throw startSynchronization;
    }
    
    
    ////////////////
    // Text range //
    ////////////////
    
    get currentToken(): Token {
        return this.tokens[this.current] ?? panic("out of bounds");
    }
    
    get previousToken(): Token {
        return this.tokens[this.current - 1] ?? panic("out of bounds");
    }
    
    spanning(...locations: HasLocation[]): SourceTextRange {
        if (locations.length > 0) {
            return SourceTextRange.spanning(...locations);
        } else {
            return SourceTextRange.spanning(this.currentToken, this.previousToken);
        }
    }
    
    //////////////////////
    // Token processing //
    //////////////////////
    
    get atEnd(): boolean {
        return this.currentToken.kind === "<eof>";
    }
    
    advance(): Token {
        if (!this.atEnd) {
            this.current++;
        }
        return this.previousToken;
    }
    
    checkOne(kind: TokenKind): boolean {
        if (!this.atEnd) {
            return this.currentToken.kind === kind;
        } else {
            return false;
        }
    }
    
    check(...kinds: TokenKind[]): boolean {
        for (const kind of kinds) {
            if (this.checkOne(kind)) {
                return true;
            }
        }
        return false;
    }
    
    matchOne(kind: TokenKind): Token | false {
        if (this.checkOne(kind)) {
            return this.advance();
        }
        return false;
    }
    
    match(...kinds: TokenKind[]): Token | false {
        let match;
        for (const kind of kinds) {
            if (match = this.matchOne(kind)) {
                return match;
            }
        }
        return false;
    }
    
    consume(
        kind: TokenKind,
        errorMessage = `Expected token <${kind}>.`,
    ): Token {
        if (this.checkOne(kind)) {
            return this.advance();
        } else {
            this.error(errorMessage);
        }
    }
    
    synchronize(): void {
        this.advance(); // skip the problematic token
        
        while (!this.atEnd) {
            if (this.previousToken.canSynchronizeAfter) {
                return;
            } else if (this.currentToken.canSynchronizeBefore) {
                return;
            } else {
                this.advance();
            }
        }
    }
    
    /** @deprecated */
    recordPosition(): () => SourceTextRange {
        const start = this.currentToken;
        return () => {
            const end  = this.previousToken;
            return spanning(start, end);
        }
    }
    
    /** @deprecated */
    finishRecordPosition(): () => SourceTextRange {
        const start = this.previousToken;
        return () => {
            const end  = this.previousToken;
            return spanning(start, end);
        }
    }
    
    composeNode<K extends AstNodeKind>(
        kind: K,
        start = this.currentToken,
    ): NodeComposer<K> {
        return otherProps => {
            const end      = this.previousToken;
            const location = this.spanning(start, end);
            return { kind, location, ...otherProps } as AstNodeMap[K];
        }
    }
    
    finishComposingNode<K extends AstNodeKind>(kind: K): NodeComposer<K> {
        return this.composeNode(kind, this.previousToken);
    }
    
    ///////////
    // Atoms //
    ///////////
    
    identifier(): Identifier {
        const words = new Array<string>;
        let match;
        while (match = this.match("<word>")) {
            words.push(match.lexeme);
        }
        return Identifier(words.join(' '));
    }
    
    string(): string {
        const token = this.consume("<string>");
        const label = token.lexeme.slice(1, -1);
        // TODO: Escaping?
        // TODO: assert(result) somehow
        return label; // Slice off ""
    }
    
    finishQuantity(): Quantity {
        const token = this.previousToken;
        const count = Number(token.lexeme);
        return Quantity(count);
    }
    
    quantity(): Quantity {
        this.consume("<integer>");
        return this.finishQuantity();
    }
    
    quality(): Quality {
        const token = this.consume("<quality>");
        const tier = token.lexeme.length;
        return Quality(tier);
    }
    
    /////////////////
    // Expressions //
    /////////////////
    
    itemQuantityExpr(): QuantifiedItemExpr {
        let item, quantity;
        const span = this.recordPosition();
        {
            quantity = this.quantity();
            item     = this.identifier();
        }
        const location = span();
        return { kind: "QuantifiedItemExpr", location, item, quantity };
    }
    
    itemQuantityQualityExpr(): QuantifiedQualifiedItemExpr {
        let item, quantity, quality;
        const span = this.recordPosition();
        {
            const subExpr  = this.itemQuantityExpr();
            item     = subExpr.item;
            quantity = subExpr.quantity;
            quality  = this.checkOne("<quality>") ? this.quality() : Quality_default;
        }
        const location = span();
        
        return { kind: "QuantifiedQualifiedItemExpr", item, location, quantity, quality };
    }
    
    finishQuantityRangeExpr(): QuantityRangeExpr {
        let minQuantity, maxQuantity;
        const span = this.finishRecordPosition();
        {
            minQuantity = this.finishQuantity();
            this.consume("~");
            maxQuantity = this.quantity();
        }
        const location = span();
        return { kind: "QuantityRangeExpr", location, minQuantity, maxQuantity };
    }
    
    quantityExpr(): QuantityExpr {
        let quantity;
        const span = this.recordPosition();
        {
            quantity = this.quantity();
            if (this.checkOne("~")) {
                // Note: if you ever switch to a push/pop position situation
                // then you should not have cross-inline returns.
                return this.finishQuantityRangeExpr();
            }
        }
        const location = span();
        return { kind: "FixedQuantityExpr", location, quantity }
    }
    
    //////////////////
    // Declarations //
    //////////////////
    
    innerStmts(): Stmt[] {
        const stmts = new Array<Stmt>;
        let stmt;
        while (!this.atEnd) {
            if (stmt = this.syncStmt()) {
                stmts.push(stmt);
            }
        }
        return stmts;
    }
    
    namespaceDecl(): NamespaceDecl {
        const $ = this.composeNode("NamespaceDecl");
        this.consume("namespace");
        const identifier = this.identifier();
        
        
        return $({name, contents});
        
    }
    
    
    decl(): Decl {
        if (this.check("item")) {
            
        } else {
            this.error(`Unexpected token <${this.currentToken}>.`);
        }
    }
    
    ////////////////
    // Statements //
    ////////////////
        
    importStmt(): ImportStmt {
        const $ = this.composeNode("ImportStmt");
        this.consume("import");
        const path = this.string();
        return $({ path });
    }
    
    stmt(): Stmt {
        if (false) {
        } else if (this.checkOne("import")) {
            return this.importStmt();
        } else {
            return this.decl();
        }
    }
    
    syncStmt(): Stmt | undefined {
        try {
            return this.stmt();
        } catch (e) {
            if (e === startSynchronization) {
                this.synchronize();
                return;
            } else {
                throw e;
            }
        }
    }
    
    //////////
    // Root //
    //////////
    
    source(): SourceNode {
        // We know where it is before we parsed lol
        const start    = Array_firstElement(this.tokens) ?? panic();
        const end      = Array_lastElement(this.tokens)  ?? panic();
        const location = this.spanning(start, end);
        
        const stmts = new Array<Stmt>;
        let stmt;
        while (!this.atEnd) {
            if (stmt = this.syncStmt()) {
                stmts.push(stmt);
            }
        }
        
        return { kind: "BlockStmt", location, stmts };
    }
    
    parse(): CompileResult<SourceNode> {
        return CompileResult(this.source(), this.diagnostics);
    }
}

export function parse(tokens: readonly Token[]) {
    return terminal.measureTime(`parse(${singularize(tokens.length, "tokens")})`, () => {
        return new Parser(tokens).parse();
    });
}
