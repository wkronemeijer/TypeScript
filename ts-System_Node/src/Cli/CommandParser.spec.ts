import { StringEnum, swear } from "@wkronemeijer/system";
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
        // required flags for something like 
        //    rm mySecretFolder --YesIAmReallySure
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

///////////
// Usage //
///////////

const mode = parser.parse();
if (mode.kind === "default") {
    const dir = mode[0];
    dir;
} else if (mode.kind === "install") {
    mode
} else if (mode.kind === "sum") {
    mode
}

describe("CommandParser", () => {
    it("parses rest arguments", () => {
        const result = parser.parse(["sum"]);
        swear(result.kind === "sum");
    });
});
// very cool, BUT
// Problem: doesn't work for 
// Now technically you never import the tests 
// but how will you write the tests?

/*

Decision time!
How do we do tests?
Do we accept node:test runner?

Some facts:
- ts-System needs tests the most, but /technically/ can't rely on node being present. 
- Test classes belong in the same project, so @internal can be used to test internal classes.
- Store another projects tests?
- Run another projects tests?


- As for a centralized Tests.gen.ts, its not that I like as much as it is universal for both browser and node.

Maybe create a expected/actual split for runTests, which can support 
Only thing to fix is whether or not it support dynamic modules, and where to find them. 

Worst case, node can dynamically load, web has to toggle a comment.
Testing web stuff is really annoying...


 */
