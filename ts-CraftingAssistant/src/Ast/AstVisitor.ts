import { Object_values } from "@local/system";
import { AstNode, AstNode_hasInstance } from "./AstNode";

export interface AstVisitor {
    (node: AstNode): void;
}

function treewalkArray(self: AstVisitor, array: readonly unknown[]): void {
    for (const item of array) {
        treewalkValue(self, item);
    }
}

function treewalkNode(self: AstVisitor, branch: AstNode) {
    self(branch);
    for (const value of Object_values(branch)) {
        treewalkValue(self, value);
    }
}

function treewalkValue(self: AstVisitor, value: unknown) {
    if (AstNode_hasInstance(value)) {
        treewalkNode(self, value);
    } else if (value instanceof Array) {
        treewalkArray(self, value);
    } else {
        // You could check if arbitrary objects contain AstNodes
        // ...but that could lead to loops and is more complex in general
        // You could do this entire function by switching on kind too
        // ...but that is more work everytime a new node gets added.
        // besides, who would add nodes with a layer of indirection?
        // What would you gain?
    }
}

export function AstNode_visit(self: AstNode, visitor: AstVisitor): void {
    treewalkNode(visitor, self);
}

export function AstNode_getNodes(self: AstNode): AstNode[] {
    const result = new Array<AstNode>;
    treewalkNode(it => {
        result.push(it);
    }, self);
    return result;
}
