import { compareIterable } from "./CompareIterable";
import { Ordering } from "./Ordering";
import { check } from "../../Errors/Check";

const { Less, Equal, Greater } = Ordering;

describe("compareIterable()", () => {
    it("sorts empty equal", () => {
        check.same(compareIterable([], []), Equal);
    });
    it("sorts shorter first", () => {
        check.same(compareIterable([], [1]), Less);
        check.same(compareIterable([2, 10], [2]), Greater);
    });
    it("sorts equal, equal", () => {
        check.same(compareIterable([2, 10], [2, 10]), Equal);
    });
});
