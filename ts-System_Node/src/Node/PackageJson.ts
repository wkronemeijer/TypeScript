import { ReadonlyRecord, RegExpNewtype, collect, ownStringKeys } from "@wkronemeijer/system";

export type  NodeName = ReturnType<typeof NodeName>;
export const NodeName = RegExpNewtype("NodeName", /(@[a-z-]+\/)?[a-z-]+/);

export type  NodeScriptName = ReturnType<typeof NodeScriptName>;
export const NodeScriptName = RegExpNewtype("NodeScriptName", /[a-z:_]+/);

type PackageJsonDependencyList = ReadonlyRecord<NodeName, string>;

export interface PackageJson {
    readonly "name"?: string;
    readonly "private"?: boolean; 
    
    readonly "version"?: string;
    readonly "description"?: string;
    readonly "author"?: string;
    readonly "license"?: string;
    
    readonly "dependencies"?: PackageJsonDependencyList;
    readonly "devDependencies"?: PackageJsonDependencyList;
    readonly "optionalDependencies"?: PackageJsonDependencyList;
    readonly "peerDependencies"?: PackageJsonDependencyList;
    
    readonly "scripts"?: Record<NodeScriptName, string>;
}

function enumerateDependencyList(list: PackageJsonDependencyList | undefined): Iterable<NodeName> {
    if (list) {
        return ownStringKeys(list).map(NodeName);
    } else {
        return [];
    }
}

export const PackageJson_getAllDependencies = collect(function* (
    self: PackageJson,
): Iterable<NodeName> {
    yield* enumerateDependencyList(self.dependencies);
    yield* enumerateDependencyList(self.devDependencies);
    yield* enumerateDependencyList(self.peerDependencies);
    yield* enumerateDependencyList(self.optionalDependencies);
});
