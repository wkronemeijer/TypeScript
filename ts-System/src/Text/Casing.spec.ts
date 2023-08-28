import { swear } from "../Assert";
import { uppercase } from "./Casing";

export {};

describe("Casing", () => {
    describe("uppercase", () => {
        it("uppercases", () => {
            swear(uppercase("foo") === "FOO");
        });
    });
});
