import { from, terminal } from "@wkronemeijer/system";

import { scan } from "./Stages/1 Scanner";
import { parse } from "./Stages/2 Parser";
import { analyze } from "./Stages/3 Analyzer";

import { AstNode_toString } from "../Ast/AstPrinter";
import { CompileResult } from "./CompileResult";
import { SourceNode } from "../Ast/AstNode";
import { SourceCode } from "./SourceCode";
import { Token } from "./Token";

const printTokens = CompileResult.lift((tokens: readonly Token[]): typeof tokens => {
    terminal.trace(from(tokens).toString("\n"));
    return tokens;
});

const printTree = CompileResult.lift((root: SourceNode): typeof root => {
    terminal.trace(AstNode_toString(root));
    return root;
});

export class CompilerHost {
    constructor() {}
    
    compile(sourceCode: SourceCode): CompileResult<SourceNode> {
        return terminal.measureTime(`compile(${sourceCode.inlineName})`, () => (
            CompileResult
            .pure(sourceCode)
            .then(scan)
            // .then(printTokens)
            .then(parse)
            .then(printTree)
            .then(analyze)
            // .then(printTree)
        ));
    }
}
