import { swear } from "../1 Core/Assert";
import { check } from "../Errors/Check";
import { uppercase } from "./Casing";

export {};

describe("Casing", () => {
    describe("uppercase", () => {
        it("uppercases", () => {
            check(uppercase("foo"), "FOO");
        });
    });
});
