import { InspectOptions, inspect } from "util";

import { AnsiTextStyle_use, Object_entries, Set_hasAny, StringBuilder } from "@wkronemeijer/system";

import { AstNode, AstNode_hasInstance, BlockNode } from "./AstNode";

const { 
    apply: setNodeStyle, 
    unset: unsetNodeStyle,
} = AnsiTextStyle_use({ fontWeight: "bold" });
// bold does not interfere with log channel colors

const inspectOptions: InspectOptions = {
    colors: true,
    showHidden: false,
    showProxy: false,
    depth: 0,
};

const hiddenKeys = new Set<keyof AstNode>([
    "kind", 
    "location",
]);

const isHiddenKey = (x: unknown) => Set_hasAny(hiddenKeys, x);

function appendArray(self: StringBuilder, array: readonly unknown[]): void {
    if (array.length > 0) {
        self.appendLine('[');
        self.increaseIndent();
        for (const item of array) {
            appendValue(self, item);
            self.appendLine();
        }
        self.decreaseIndent();
        self.append(']');
    } else {
        self.append("[]");
    }
}

function appendNodeHeader(self: StringBuilder, node: AstNode): void {
    self.append(setNodeStyle);
    self.append(node.kind);
    self.append(unsetNodeStyle);
}

function appendNode(self: StringBuilder, node: AstNode): void {
    appendNodeHeader(self, node);
    self.appendLine(" {")
    self.increaseIndent();
    for (const [key, value] of Object_entries(node)) {
        if (!isHiddenKey(key)) {
            self.append(key);
            self.append(": ");
            appendValue(self, value);
            self.appendLine();
        }
    }
    self.decreaseIndent();
    self.append("}")
}

// Shortcut for block nodes, to reduce indentation
function appendBlockNode(self: StringBuilder, blockNode: BlockNode): void {
    appendNodeHeader(self, blockNode);
    self.append(' ');
    appendArray(self, blockNode.stmts);
}

function appendValue(self: StringBuilder, value: unknown): void {
    if (AstNode_hasInstance(value)) {
        if ("stmts" in value) {
            appendBlockNode(self, value);
        } else {
            appendNode(self, value);
        }
    } else if (value instanceof Array) {
        appendArray(self, value);
    } else {
        self.append(inspect(value, inspectOptions));
    }
}

export function AstNode_buildString(self: AstNode, result: StringBuilder): void {
    appendValue(result, self);
}

export function AstNode_toString(self: AstNode): string {
    const result = new StringBuilder;
    AstNode_buildString(self, result);
    return result.toString();
}
