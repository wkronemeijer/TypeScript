import { check } from "../Errors/Check";
import { SameValueZero } from "./SameValueZero";

describe("SameValueZero()", () => {
    it("treats value types as equal", () => {
        check.ok(SameValueZero(undefined, undefined));
        check.ok(SameValueZero(null, null));
        check.ok(SameValueZero(true, true));
        check.ok(SameValueZero(5, 5));
        check.ok(SameValueZero("Hello", "Hello"));
        check.ok(SameValueZero(8n, 8n));
    });
    it("treats ±0 as equal", () => {
        check.ok(SameValueZero(+0, -0));
        check.ok(SameValueZero(0n, -0n));
    });
    it("treats NaN as equal", () => {
        check.ok(SameValueZero(NaN, NaN));
    });
    it("treats reference types as identical", () => {
        const o1 = {};
        const o2 = {};
        
        check.ok(SameValueZero(o1, o1));
        check.ok(SameValueZero(o2, o2));
        check.notOk(SameValueZero(o1, o2));
    });
    it("treats different types as unequal", () => {
        check.notOk(SameValueZero(false, 0));
        check.notOk(SameValueZero(0, "0"));
        check.notOk(SameValueZero(0, ""));
        check.notOk(SameValueZero(null, undefined));
        check.notOk(SameValueZero(new String("foo"), "foo"));
        check.notOk(SameValueZero(20, "20"));
        check.notOk(SameValueZero(42, 42n));
        check.notOk(SameValueZero(42, 42n));
    });
});
