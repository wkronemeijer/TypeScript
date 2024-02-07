import { swear } from "@wkronemeijer/system";

import { dependencies } from "../../../../package.json";

type OwnDependency = keyof typeof dependencies;

export const ShareableDependencies: readonly string[] = [
    "@wkronemeijer/system",
    "@wkronemeijer/system-node",
    "@wkronemeijer/react-server-page-provider",
] satisfies OwnDependency[];

const BadDependency = "@wkronemeijer/react-server-page" satisfies OwnDependency;

swear(!ShareableDependencies.includes(BadDependency), () => 
    `${BadDependency} must NOT be shared.`
);
