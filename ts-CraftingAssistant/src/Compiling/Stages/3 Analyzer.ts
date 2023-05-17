import { singularize, terminal } from "@local/system";

import { AstNode_getNodes } from "../../Ast/AstVisitor";
import { CompileResult } from "../CompileResult";
import { SourceNode } from "../../Ast/AstNode";


export function analyze(root: SourceNode): CompileResult<SourceNode> {
    const nodeCount = AstNode_getNodes(root).length;
    return terminal.measureTime(`resolve(${singularize(nodeCount, "nodes")})`, () => {
        return CompileResult.pure(root);
    });
}
