import { Selector, identity } from "@wkronemeijer/system";

import { DiagnosticCollection, ReadonlyDiagnosticCollection } from "./Diagnostics/DiagnosticCollection";

/* 
Short note: merger of WriterT and MaybeT (where Nothing is derived from the diagnostics...)
*/

interface CompileResultBase<T> {
    readonly diagnostics: ReadonlyDiagnosticCollection;
    then<U>(selector: Selector<T, CompileResult<U>>): CompileResult<U>
}

interface CompileResultOk<T>
extends CompileResultBase<T> {
    readonly ok: true;
    readonly value: T;
}

interface CompileResultErr<T>
extends CompileResultBase<T> {
    readonly ok: false;
    readonly value: unknown;
}

export type CompileResult<T> =
    | CompileResultOk<T>
    | CompileResultErr<T>
;

function then<T, U>(
    this: CompileResult<T>, 
    selector: Selector<T, CompileResult<U>>,
): CompileResult<U> {
    if (this.ok) {
        const newResult      = selector(this.value);
        const newDiagnostics = DiagnosticCollection.join(this.diagnostics, newResult.diagnostics);
        if (newResult.ok) {
            return CompileResult(newResult.value, newDiagnostics);
        } else {
            return CompileError(newDiagnostics);
        }
    } else {
        return CompileError(this.diagnostics);
    }
}

export function CompileResult<T>(
    value: T, 
    diagnostics: ReadonlyDiagnosticCollection,
): CompileResult<T> {
    const ok = diagnostics.ok;
    return { ok, value, diagnostics, then };
}

function CompileError(
    diagnostics: ReadonlyDiagnosticCollection
): CompileResult<never> {
    const ok    = false;
    const value = undefined;
    return { ok, value, diagnostics, then };
}

function lift<T, U>(
    func: (value: T) => U
):        (value: T) => CompileResult<U> {
    return value => CompileResult(func(value), new DiagnosticCollection);
}

const pure = lift(identity);

CompileResult.error = CompileError;
CompileResult.lift  = lift;
CompileResult.pure  = pure;
