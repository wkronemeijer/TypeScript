import { swear } from "../../Errors/Assert";
import { check } from "../../Debug/Check";
import { uppercase } from "./Casing";

export {};

describe("Casing", () => {
    describe("uppercase", () => {
        it("uppercases", () => {
            check(uppercase("foo"), "FOO");
        });
    });
});
