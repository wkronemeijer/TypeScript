import { StringEnum, check } from "@wkronemeijer/system";
import { CliParameterTools } from "./Parameters/ParameterTools";
import { CliCommandParser } from "./CommandParser";

const Align = StringEnum([
    "bottom",
    "middle",
    "top",
]).withDefault("middle");

const { 
    parameter, 
    optional, 
    nullable, 
    directory, 
    flag, 
    integer, 
    number, 
    enumeration, 
    string, 
    AcceptRestArguments, 
} = CliParameterTools;

describe("CommandParser", () => {
    const parser = new CliCommandParser({
        default: {
            0: optional(directory()),
            1: nullable(directory()),
            depth: optional(number({
                minimum: 0,
            }), {
                default: Infinity,
            }),
            repeat: optional(integer({
                minimum: 1,
                maximum: 1000,
            })),
            search: string(),
            recurse: optional(flag()),
            force: optional(flag()),
            bogus: optional(parameter({
                parse: String,
            }), {
                default: "Nameless map",
            }),
        },
        install: {
            target: string(),
            align: optional(enumeration({
                values: Align,
            })),
        },
        sum: {
            [AcceptRestArguments]: true,
            force: optional(flag()),
        },
    });
    
    it.skip("parses simple case", () => {        
        const mode = parser.parse(["--search", "some string"]);
        check.same(mode.kind, "default");
        check.ok(mode.search === "some string");
    });
    
    it.skip("parses rest arguments", () => {
        const mode = parser.parse(["sum", "--force", "foo"]);
        check.same(mode.kind, "sum");
        check.ok(mode.force);
        check.same(mode.rest[0], "foo");
    });
    
    it("does not validate defaults");
});
