import { HasLocation, SourceTextRange } from "@wkronemeijer/compiler-toolkit";
import { ExpandType} from "@wkronemeijer/system";

import { Identifier } from "../Domain/Identifier";
import { Quantity } from "../Domain/Quantity";

/*
Real talk: the divisions of expressions, declarations and statements makes little sense for this language
// TODO: how would you group your nodes?
Open question

*/

type NewAstNode<
    Kind       extends string, 
    Properties extends object,
> = ExpandType<{
    readonly kind: Kind;
} & HasLocation & Properties>;

/////////////////
// Expressions //
/////////////////

export type QuantifiedItemExpr = NewAstNode<"QuantifiedItemExpr", { 
    readonly item: Identifier; 
    readonly quantity: Quantity; 
}>;

export type FixedQuantityExpr = NewAstNode<"FixedQuantityExpr", {
    readonly quantity: Quantity;
}>;

export type QuantityRangeExpr = NewAstNode<"QuantityRangeExpr", {
    readonly minQuantity: Quantity;
    readonly maxQuantity: Quantity;
}>;

export type QuantityExpr = 
    | FixedQuantityExpr
    | QuantityRangeExpr
;

export type Expr = 
    | QuantifiedItemExpr
    | FixedQuantityExpr
    | QuantityRangeExpr
;

//////////////////
// Declarations //
//////////////////

export type ReagentDecl = NewAstNode<"ReagentDecl", { 
    readonly item: Identifier; 
    readonly isTarget?: boolean;
}>;

export type RecipeDecl = NewAstNode<"RecipeDecl", {
    readonly product: Identifier; 
    readonly resources: readonly QuantifiedItemExpr[];
    readonly outputRange?: QuantityExpr
    readonly isTarget?: boolean;
}>;

export type InventoryDecl = NewAstNode<"InventoryDecl", {
    readonly title: string;
    readonly contents: readonly QuantifiedItemExpr[];
}>;

export type NamespaceDecl = NewAstNode<"NamespaceDecl", {
    readonly name: Identifier;
    readonly contents: BlockStmt;
}>;

export type Decl = 
    | ReagentDecl
    | RecipeDecl  
    | InventoryDecl
    | NamespaceDecl
;

////////////////
// Statements //
////////////////

export type TargetStmt = NewAstNode<"TargetStmt", {
    readonly name: Identifier;
    readonly amount: Quantity;
}>;

// Block abstraction so we can have things like `target reagent` parse to a block with 2 substmts.
export type BlockStmt = NewAstNode<"BlockStmt", { 
    readonly stmts: readonly Stmt[]; 
}>;

export type ImportStmt = NewAstNode<"ImportStmt", {
    readonly path: string;
}>;

export type Stmt = 
    | BlockStmt 
    | ImportStmt 
    | TargetStmt
    | Decl
;

//////////////
// Assorted //
//////////////

export type SourceNode = BlockStmt;
export type BlockNode  = BlockStmt;

export type AstNodeKind = AstNode["kind"];
export type AstNode = 
    | Expr
    | Stmt
    | Decl
;

export type AstNodeMap = {
    [K in AstNodeKind]: ExpandType<AstNode & { readonly kind: K; }>
};

export function AstNode_hasInstance(x: unknown): x is AstNode {
    return (
        // Not null
        typeof x === "object" && x !== null &&
        // and has `kind: string` property
        "kind" in x && typeof x.kind === "string" &&
        // and has `location: Location` property
        "location" in x && x.location instanceof SourceTextRange
        // ...false positives should be very unlikely.
    );
}
