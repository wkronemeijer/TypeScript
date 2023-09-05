import { collect } from "../Collections/Iterable";

interface NameAndAliases {
    readonly name: string;
    readonly alias?: string;
    readonly aliases?: readonly string[];
}

export const getAllNames = collect(function* (options: NameAndAliases): Iterable<string> {
    const { name, alias, aliases } = options;
    
    yield name;
    if (alias) {
        yield alias;
    }
    if (aliases) {
        yield* aliases;
    }
});
