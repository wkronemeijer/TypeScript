import { Ordering, Ordering_Equal, Ordering_Greater, Ordering_Less } from "./Ordering";
import { check } from "../../Errors/Check";

const { Less, Equal, Greater } = Ordering;

describe("Ordering", () => {
    describe(".create()", () => {
        it("constants are invariant under create", () => {
            check.equals(Ordering(Less), Less);
            check.equals(Ordering(Equal), Equal);
            check.equals(Ordering(Greater), Greater);
        });
        it("NaN is normalized to EQ", () => {
            check.equals(Ordering(NaN), Equal);
        });
    });
    
    describe("#invert", () => {
        it("inverts", () => {
            check.equals(Ordering.invert(Less), Greater);
            check.equals(Ordering.invert(Equal), Equal);
            check.equals(Ordering.invert(Greater), Less);
        });
    });
});
