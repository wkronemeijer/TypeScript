// Future might hold some cool media-query like function
// For now a simple boolean function will suffice.

export function isRunAsNodeCjs(): boolean {
    return "process" in globalThis;
}
