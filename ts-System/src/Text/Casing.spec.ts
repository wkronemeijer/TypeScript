import { swear } from "../Assert";
import {check} from "../Errors/ErrorFunctions"
import { uppercase } from "./Casing";

export {};

describe("Casing", () => {
    describe("uppercase", () => {
        it("uppercases", () => {
            check(uppercase("foo"), "FOO");
        });
    });
});
