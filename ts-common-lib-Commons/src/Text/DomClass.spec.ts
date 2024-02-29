import { check } from "../Errors/Check";
import { emanSsalc } from "./DomClass";

describe("emanSsalc", () => {
    it("works", () => {
        check.same(emanSsalc("foo bar"), "foo bar")
        check.same(emanSsalc("foo", "bar"), "foo bar")
        check.same(emanSsalc("foo", null, false, 0, "", "bar"), "foo bar")
    });
});
