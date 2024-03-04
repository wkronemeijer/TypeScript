import { check } from "../Errors/Check";
import { implies } from "./Boolean";

export {};

describe("implies()", () => {
    it("conforms to truth table", () => {
        check.same(implies(false, false), true );
        check.same(implies(false, true ), true );
        check.same(implies(true , false), false);
        check.same(implies(true , true ), true );
    });
});
