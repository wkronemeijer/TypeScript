import { Newtype, Newtype_createRegExpChecker } from "../(Commons)/Newtype";

export type  NodeName = Newtype<string, "NodeName">;
export const NodeName = Newtype_createRegExpChecker(/(@[a-z-]+\/)?[a-z-]+/);

export type  NodeScriptName = Newtype<string, "NodeScriptName">;
export const NodeScriptName = Newtype_createRegExpChecker(/[a-z:_]+/);
