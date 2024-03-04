const matchSgr = /\x1B\[[\d,]+m/g; // g needed by replaceAll

export function stripAnsiSequences(string: string): string {
    return string.replaceAll(matchSgr, "");
}
