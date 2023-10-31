import { check } from "../../Modules.generated";
import { StringEnum } from "./StringEnum";

describe("StringEnum", () => {
    describe("create()", () => {
        it("accepts string array", () => {
            const Alignment = StringEnum([
                "start", 
                "center",
                "end",
            ]);
            check.same(Alignment.getOrdinal("start"), 0);
            check.same(Alignment.getOrdinal("center"), 1);
            check.same(Alignment.getOrdinal("end"), 2);
        });
        it("accepts number dictionary", () => {
            const SI = StringEnum({
                black: 0,
                kilo: 1_000,
                mega: 1_000_000, 
                giga: 1_000_000_000,
            });
            check.same(SI.getOrdinal("giga"), 1_000_000_000);
        });
        it("auto increments placeholders", () => {
            const Colors = StringEnum({
                black: "iota",
                red: true,
                green: "iota",
                yellow: "iota",
                blue: true,
                magenta: true,
                cyan: "iota",
                white: "iota",
            });
            
            check.same(Colors.getOrdinal("black"), 0);
            check.same(Colors.getOrdinal("magenta"), 5);
            check.same(Colors.getOrdinal("white"), 7);
        });
        it("rejects empty initializers", () => {
            check.throws(() => StringEnum([]));
            check.throws(() => StringEnum({}));
        });
        it("rejects NaN values", () => {
            check.throws(() => StringEnum({ member: NaN }));
        });
    });
    
    /*
    TODO: Complete StringEnum tests
    SE is used everywhere, so testing will pay off;
    Things to test:
    
    - values isa array
    - SE is iterable
    - SE iterates in ascending order of ordinal
    
    - default is #0
    - unless #0 doesn't exist, then it is the least;
    - withDefault replaces default, creates NEW instance
    
    - hasInstance checks membership
    - hasInstance does not throw when given random stuff
    - check /does/ throw when given random stuff
    
    - minimum is least
    - maximum is greatest
    - min works
    - max works
    - compare compares by ordinal
    
    - getOrdinal works (constructor already uses it)
    - fromOrdinal works (constructor already uses it)
    - getOrdinal throws for non-members
    - fromOrdinal doesn't throw
    
    - maxLength is >= every other value
    - toString includes every member
    */
})
