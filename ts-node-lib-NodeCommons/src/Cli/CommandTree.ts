import { CliParameter } from "./Parameters/Parameter";

/////////////////////
// Tree definition //
/////////////////////

export type  CliSubcommand_AcceptRestArguments = typeof CliSubcommand_AcceptRestArguments;
export const CliSubcommand_AcceptRestArguments = Symbol("AcceptRestArguments");

export interface CliSubcommandTree {
    [CliSubcommand_AcceptRestArguments]?: boolean;
    [s: string | number]: CliParameter<any>;
}

export interface CliCommandTree {
    [s: string]: CliSubcommandTree;
    readonly default: CliSubcommandTree;
}
