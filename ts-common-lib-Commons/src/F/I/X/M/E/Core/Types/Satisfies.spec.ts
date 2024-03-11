import { createChecker } from "./Satisfies";
import { Newtype } from "../Data/Nominal/Newtype";
import { check } from "../Debug/Check";

describe("createChecker()", () => {
    const pattern = /[Rr]/;
    
    function isStringSubset(value: string): value is StringSubset {
        return !pattern.test(value);
    }
    
    type  StringSubset = Newtype<string, "StringSubset">;
    const StringSubset = createChecker(isStringSubset);
    
    it("accepts values", () => {
        StringSubset("I")
        StringSubset("have")
        StringSubset("a")
    });
    it("rejects non-values", () => {
        check.throws(() => StringSubset("very"));
        check.throws(() => StringSubset("great"));
        check.throws(() => StringSubset("friend"));
        check.throws(() => StringSubset("from"));
        check.throws(() => StringSubset("rome"));
    });
    it("works with instanceof", () => {
        check.ok(("called" as any) instanceof StringSubset);
        check.ok(("Biggus" as any) instanceof StringSubset);
        check.notOk(("rapscallion" as any) instanceof StringSubset);
    });
})
