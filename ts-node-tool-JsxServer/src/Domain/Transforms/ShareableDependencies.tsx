import {dependencies} from "../../../package.json";
import {swear} from "@wkronemeijer/system";

type OwnDependency = keyof typeof dependencies;

// FIXME: Maybe make it so any absolute import is shared by default?
const shareableDependencies: readonly string[] = [
    "@wkronemeijer/system",
    "@wkronemeijer/system-node",
    "@wkronemeijer/react-server-page-provider",
] satisfies OwnDependency[];

const requiredDependency = (
    "@wkronemeijer/react-server-page-provider"
) satisfies OwnDependency;

const badDependency = (
    "@wkronemeijer/react-server-page"
) satisfies OwnDependency;

swear(shareableDependencies.includes(requiredDependency), () => 
    `${requiredDependency} MUST be shared.`
);
swear(!shareableDependencies.includes(badDependency), () => 
    `${badDependency} MUST NOT be shared.`
);

export function getShareableDependencies(): string[] {
    return shareableDependencies.slice();
}
