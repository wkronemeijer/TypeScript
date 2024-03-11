import { check } from "../../Debug/Check";
import { char } from "./Char";

export {};

// test strings:
// "𠮷𠮶"
// a🅱c
describe("char", () => {
    describe(".constructor()", () => {
        it("rejects empty string", () => {
            check.throws(() => char(""));
        });
        it("accepts ascii", () => {
            char("a");
            char("\x1B");
            char("\n");
        });
        it("rejects long strings", () => {
            check.throws(() => char("abc"));
            check.throws(() => char("Hello, world!"));
        });
        it("accepts emoji", () => {
            char("🍷");
            char("😂");
            char("🐉");
        });
        it("accepts normalized accents", () => {
            char("é");
        });
        it("rejects grapheme clusters ", () => {
            check.throws(() => char("s̴̛̛͈̞̩̻̙̼̣͇͌̒̀̾̈́̄̏̓͂͘͝͝"));
        });
    });
    describe("[@@hasInstance]()", () => {
        it("returns membership", () => {
            check.ok(("\t" as any) instanceof char);
            check.ok(("🤩" as any) instanceof char);
            check.notOk(("" as any) instanceof char);
            check.notOk(("\r\n" as any) instanceof char);
        });
    });
});
