import { CliSubcommandTree, CliCommandTree } from "./CommandTree";
import { CliParameter } from "./Parameters/Parameter";

// TODO: How to give meaningful names to these type functions?

type TranslateParameter<T> = T extends CliParameter<infer R> ? R : never;

type TranslateSubcommandTree<T extends CliSubcommandTree> = {
    readonly [P in keyof T]: TranslateParameter<T[P]>;
};

type SubcommandResult<T extends CliCommandTree, P extends keyof T> = {
    readonly kind: P;
    readonly rest: readonly string[];
} & TranslateSubcommandTree<T[P]>;

export type CliCommandTree_Translate<T extends CliCommandTree> = {
    [P in keyof T]: SubcommandResult<T, P>;
}[keyof T];

export interface CliParseResult {
    readonly kind: string;
    readonly rest: readonly string[];
}

export interface ExtendedCliParseResult
extends CliParseResult {
    [s: string]: unknown;
}
