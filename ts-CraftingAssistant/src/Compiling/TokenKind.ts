import { Member, StringEnum } from "@wkronemeijer/system";

// Meta note: "kind" discriminate their owner, "type" does not.

export type  KeywordTokenKind = Member<typeof KeywordTokenKind>;
export const KeywordTokenKind = StringEnum([
    "item",
    
    "recipe",
    
    "inventory",
    
    "order",
    
    "namespace",
    "import",
    "x", // as in "10x Apple"
] as const);

export type  PunctionationTokenKind = Member<typeof PunctionationTokenKind>;
export const PunctionationTokenKind = StringEnum([
    "(", ")",
    "[", "]",
    "{", "}",
    "~",
    "/",
    "==>",
    "<=>",
    // Problem with --> is that 
] as const);

export type  LiteralTokenKind = Member<typeof LiteralTokenKind>;
export const LiteralTokenKind = StringEnum([
    ...KeywordTokenKind,
    ...PunctionationTokenKind,
    // Others...if we re-implement the TokenMatcher from ts-Pine ^^
] as const);

// Non-literal tokens get angle brackets to make them easier to spot
export type  TokenKind = Member<typeof TokenKind>;
export const TokenKind = StringEnum([
    ...LiteralTokenKind,
    "<integer>",
    "<string>",
    "<word>",
    "<unknown>",
    "<eof>",
] as const);

function isMemberOf(
    ...kinds: TokenKind[]
): (kind: TokenKind) => boolean {
    const set = new Set(kinds);
    return kind => set.has(kind);
}

// NB: This should be hand-edited, so may be out-of-date (SORRY)

export const TokenKind_canSynchronizeAfter = isMemberOf(
    ")",
    "}",
);

export const TokenKind_canSynchronizeBefore = isMemberOf(
    "item",
    "recipe",
    "inventory",
    "order",
    "namespace",
    "import",
    "<integer>",
    // Yeah this language is easy on the compiler
);
