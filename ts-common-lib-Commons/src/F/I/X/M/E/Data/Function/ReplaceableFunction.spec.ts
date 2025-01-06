import { ReplaceableFunction } from "./ReplaceableFunction";
import { check } from "../../Debug/Check";

describe("ReplaceableFunction", () => {
    it("uses initial initially", () => {
        const test = ReplaceableFunction(() => 1);
        check.same(test(), 1);
    });
    
    it("with replaces and then restores", () => {
        const test = ReplaceableFunction(() => 1);
        check.same(test(), 1);
        test.with(() => 2, () => {
            check.same(test(), 2);
        })
        check.same(test(), 1);
    });
    
    it("overwrite overwrites", () => {
        const test2 = ReplaceableFunction(() => 1);
        test2.overwrite(() => 3);
        check.same(test2(), 3);
    })
})
