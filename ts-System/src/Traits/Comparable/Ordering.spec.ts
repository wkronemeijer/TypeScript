import { Ordering, Ordering_Equal, Ordering_Greater, Ordering_Less } from "./Ordering";
import { check } from "../../Errors/Check";

describe("Ordering", () => {
    it("constants are invariant", () => {
        check.equals(Ordering(Ordering_Less), Ordering_Less);
        check.equals(Ordering(Ordering_Equal), Ordering_Equal);
        check.equals(Ordering(Ordering_Greater), Ordering_Greater);
    });
    it("NaN is normalized to EQ", () => {
        check.equals(Ordering(NaN), Ordering_Equal);
    });
});
