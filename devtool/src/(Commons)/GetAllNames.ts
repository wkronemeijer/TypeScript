interface NameAndAliases {
    readonly name: string;
    readonly alias?: string;
    readonly aliases?: readonly string[];
}

function* inner(options: NameAndAliases): Iterable<string> {
    const { name, alias, aliases } = options;
    yield name;
    if (alias) {
        yield alias;
    }
    if (aliases) {
        yield* aliases;
    }
}

export function getAllNames(options: NameAndAliases): string[] {
    return Array.from(inner(options));
}
