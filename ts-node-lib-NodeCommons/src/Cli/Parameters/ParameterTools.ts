import { CliParameter, CliParameter_makeOptional, CliParameter_useAmbientDefault, CliEnumParameter, CliIntegerParameter, CliNumberParameter, CliStringParameter, CliFlagParameter, CliDirectoryParameter, CliFileParameter } from "./Parameter";
import { CliSubcommand_AcceptRestArguments } from "../CommandTree";

/** 
 * Re-exports useful members for creating a command specification. 
 */ 
export namespace CliParameterTools {
    export const parameter = CliParameter;
    export const nullable  = CliParameter_makeOptional;
    export const optional  = CliParameter_useAmbientDefault;
    
    export const enumeration = CliEnumParameter;
    export const integer     = CliIntegerParameter;
    export const number      = CliNumberParameter;
    export const string      = CliStringParameter;
    export const flag        = CliFlagParameter;
    
    export const directory = CliDirectoryParameter;
    export const file      = CliFileParameter;
    
    export const AcceptRestArguments: 
    typeof CliSubcommand_AcceptRestArguments 
    =      CliSubcommand_AcceptRestArguments;
    // ...and yet sometimes it decays to the plain "symbol".
    // Mysterious.
}
