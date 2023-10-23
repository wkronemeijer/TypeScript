import { dirname, join } from "path";
import { readFileSync } from "fs";

import { isObject } from "../../(Commons)/TypeGuard";
import { collect } from "../../(Commons)/Collect";
import { swear } from "../../(Commons)/Assert";

import { DependencyKind, ExternalPackage } from "./ExternalPackage";
import { InternalPackage } from "../Internal/InternalPackage";
import { NodeName } from "../NodeName";

const dependencyKindByKey = {
    "dependencies"   : "dependency"   ,
    "devDependencies": "devDependency",
} as const satisfies Record<string, DependencyKind>;

type DependencyKey = keyof typeof dependencyKindByKey;

function* getPackages(packageObject: object, key: DependencyKey): Iterable<ExternalPackage> {
    let packages;
    
    if (
        key in packageObject && 
        isObject(packages = (packageObject as any)[key])
    ) {
        for (const rawName in packages) {
            const name = NodeName(rawName);
            const kind = dependencyKindByKey[key];
            yield new ExternalPackage(name, kind);
        }
    }
};

export const InternalPackage_getAllPossibleDependencies = collect(function* (
    self: InternalPackage
): Iterable<ExternalPackage> {
    let packageJson: unknown;
    
    const packageDir      = dirname(self.path);
    const packageJsonPath = join(packageDir, "package.json");
    
    try {
        packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        swear(isObject(packageJson), `package.json must be an object.`);
        yield* getPackages(packageJson, "dependencies");
        yield* getPackages(packageJson, "devDependencies");
    } catch (cause) {
        throw new Error(`Failed to parse package.json of ${packageDir}.`, { cause });
    }
});
