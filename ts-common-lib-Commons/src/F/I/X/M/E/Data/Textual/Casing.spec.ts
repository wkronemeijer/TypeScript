import {uppercase} from "./Casing";
import {check} from "../../Debug/Check";

describe("Casing", () => {
    describe("uppercase", () => {
        it("uppercases", () => {
            check(uppercase("foo"), "FOO");
        });
    });
});
