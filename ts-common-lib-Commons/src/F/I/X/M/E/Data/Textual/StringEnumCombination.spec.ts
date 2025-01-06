import { StringEnum_combine } from "./StringEnumCombination";
import { StringEnum } from "./StringEnum";
import { check } from "../../Debug/Check";

describe("StringEnum", () => {
    describe("combine()", () => {
        const Horizontal = StringEnum([
            "left",
            "center",
            "right",
        ]);
        
        const Vertical = StringEnum([
            "top",
            "middle",
            "bottom",
        ]);
        
        const Position = StringEnum_combine(
            [Horizontal, Vertical, Vertical], 
            (h         , v       , b       ) =>`${h}.${v}/${b}`,
        );
        
        it("includes the combinations", () => {
            check.ok(Position.hasInstance("center.top/middle"));
            check.ok(Position.hasInstance("right.bottom/bottom"));
        });
        
        it("members ordered in lexicograhpical order", () => {
            check.ok(Position.getOrdinal("left.top/top") < Position.getOrdinal("right.bottom/bottom"));
            check.ok(Position.getOrdinal("left.top/top") < Position.getOrdinal("left.top/middle"));
        })
    });
});
