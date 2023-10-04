import { formatString } from "./FormattableString";
import { check } from "../Errors/Check";

describe("formatString()", () => {
    it("inserts arguments", () => {
        check.same(formatString("{0}", 1), "1");
        check.same(formatString("{0} {1} {2}", 1, 2, 3), "1 2 3");
        check.same(formatString("{0} {2} {1}", 1, 2, 3), "1 3 2");
        check.same(formatString("{0} x {2}", 1, 2, 3), "1 x 3");
    });
    it("accepts large arguments", () => {
        const args = new Array<string>(100);
        args[100] = "lol";
        check.same(formatString("{100}", ...args), "lol");
    });
    it("inserts symbols", () => {
        // Who decided that Symbol#toString would throw?
        check.same(formatString("{0}", Symbol.iterator), "Symbol(Symbol.iterator)");
    });
    it("leaves regular strings alone", () => {
        check.same(formatString("Hello", 1, 2, 3), "Hello");
    });
    it("ignores inserted insertion points", () => {
        check.same(formatString("{0}", "{1}", 0), "{1}");
    });
    it("inserts missing when underapplied", () => {
        check.ok(formatString("{0} {1} {2}", 1, 2).includes("missing"));
    });
});
