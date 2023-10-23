function tryRemoveSuffix(string: string, suffix: string): string | false {
    if (string.endsWith(suffix)) {
        return string.slice(0, string.length - suffix.length);
    } else {
        return false;
    }
}

export function agree(count: number, string: string): string {
    return `${count} ${(count === 1 &&
        tryRemoveSuffix(string, "s") ||
        string
    )}`;
}
