import { CompileResult, Diagnostic, DiagnosticCollection, DiagnosticKind, SourceCode, SourceTextRange, TokenMatcherNode } from "@wkronemeijer/compiler-toolkit";
import { Predicate, requires, singularize, terminal } from "@wkronemeijer/system";

import { KeywordTokenKind, PunctionationTokenKind, TokenKind } from "../TokenKind";
import { Identifier_wordRegex } from "../../Domain/Identifier";
import { Token } from "../Token";

const rootMatcher = TokenMatcherNode.from(PunctionationTokenKind);

function createTester(regex: RegExp): (c: string) => boolean {
    requires(!regex.flags.includes("g"),
        "test regex should not be global.");
    return c => regex.test(c);
}

// TODO: What to do with unicode...
// at some point someone is going to pass a non-BMP string...

const isPunctuationChar = rootMatcher.willAccept;
const isWhitespaceChar  = createTester(/[ \t\r\n]/);
const isQualityChar     = (c: string) => c === "*";
const isWordChar        = createTester(/[A-Za-z\-']/);
const isDigit           = createTester(/[0-9]/);

const        isKeyword = KeywordTokenKind.hasInstance;
export const isWord    = createTester(Identifier_wordRegex);

const max = Math.max;

/////////////
// Scanner //
/////////////

class Scanner {
    readonly sourceText: string;
    
    readonly tokens      = new Array<Token>;
    readonly diagnostics = new DiagnosticCollection;
    
    currentStart = 0
    currentEnd   = 0
    
    constructor(
        readonly sourceCode: SourceCode,
    ) {
        this.sourceText = sourceCode.text;
    }
    
    indexInBounds(index: number): boolean {
        return (
            0     <= index && 
            index <  this.sourceText.length
        );
    }
    
    get previousEnd(): number {
        return max(0, this.currentEnd - 1);
    }
    
    get atEnd(): boolean {
        return !this.indexInBounds(this.currentEnd)
    }
    
    get pastSurrogate(): boolean {
        if (!this.atEnd) {
            const charCode  = this.sourceText.charCodeAt(this.previousEnd);
            const codePoint = this.sourceText.codePointAt(this.previousEnd);
            return charCode !== codePoint;
        } else {
            return false;
        }
    }
    
    get currentLexeme(): string {
        return this.sourceText.slice(this.currentStart, this.currentEnd);
    }
    
    get currentLocation(): SourceTextRange {
        return new SourceTextRange(this.sourceCode, this.currentStart, this.currentEnd);
    }
    
    addToken(kind: TokenKind): void {
        // terminal.trace(`ADD ${kind} token`);
        this.tokens.push(new Token(kind, this.currentLexeme, this.currentLocation));
    }
    
    report(kind: DiagnosticKind, message: string): void {
        this.diagnostics.add(new Diagnostic(kind, this.currentLocation, message));
    }
    
    get(index: number): string {
        return this.indexInBounds(index) ? this.sourceText.charAt(index) : '\0';
    }
    
    advance(): string {
        return this.get(this.currentEnd++);
    }
    
    peek(offset = 0): string {
        return this.get(this.currentEnd + offset);
    }
    
    match(expectedChar: string): boolean {
        if (this.peek() === expectedChar) {
            this.advance();
            return true;
        } else {
            return false;
        }
    }
    
    matchWhile(predicate: Predicate<string>): void {
        while (predicate(this.peek()) && !this.atEnd) {
            this.advance();
        }
    }
    
    /////////////////////
    // Matching tokens //
    /////////////////////
    
    scanInteger(): void {
        this.matchWhile(isDigit);
        this.addToken("<integer>");
    }
    
    scanString(): void {
        // We don't support string escapes
        // Nor multiline strings :^)
        this.matchWhile(c => c !== "\"" && c !== "\n");
        if (this.atEnd) {
            this.report("error", "String was not terminated.");
        }
        const closing = this.advance();
        if (closing !== "\"") {
            this.report("error", "String cannot occupy more than 1 line.");
        }
        this.addToken("<string>");
    }
    
    scanWordOrKeyword(): void {
        while (isWordChar(this.peek())) {
            this.advance();
        }
        
        const candidateWord = this.currentLexeme;
        
        if (isWord(candidateWord)) {
            this.addToken("<word>");
        } else if (isKeyword(candidateWord)) {
            this.addToken(candidateWord);
        } else {
            this.report("error", "Expected word or keyword (words start with a non-lowercase letter).");
        }
    }
    
    scanToken(): void {
        // Terminates because it always advances
        const c = this.advance();
        
        if (false) {
            // This space is intentially left blank
            // ...so you can re-order without layout troubles
        } else if (isWhitespaceChar(c)) {
            this.matchWhile(isWhitespaceChar); 
            // ^ is this actually faster? No idea.
            // We ignore whitespace
        } else if (c === "/" && this.match("/")) {
            this.matchWhile(c => c !== "\n");
        } else if (c === "\"") {
            this.scanString();
        } else if (isPunctuationChar(c)) {
            this.addToken(c as PunctionationTokenKind);
        } else if (isDigit(c)) {
            this.scanInteger();
        } else if (isWordChar(c)) {
            this.scanWordOrKeyword();
        } else {
            let char = c;
            if (this.pastSurrogate) {
                char += this.advance();
            }
            // TODO: Should this really be an error? We can just step over it...
            this.report("error", `Unexpected character '${char}'.`);
        }
    }
    
    scanAllTokens(): void {
        while(!this.atEnd) {
            this.scanToken();
            this.currentStart = this.currentEnd;
        }
        this.addToken("<eof>");
    }
    
    scan(): CompileResult<readonly Token[]> {
        this.scanAllTokens();
        return CompileResult(this.tokens, this.diagnostics);
    }
}

///////////////////
// Scan function //
///////////////////

export function scan(code: SourceCode): CompileResult<readonly Token[]> {
    const characterCount = code.text.length;
    return terminal.measureTime(`scan(${singularize(characterCount, "characters")})`, () => {
        return new Scanner(code).scan();
    });
}
