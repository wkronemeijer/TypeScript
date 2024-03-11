import { swear } from "../../Errors/Assert";
import { String_isEmpty, String_isWhitespace } from "./String";

describe("String", () => {
    describe("isEmpty", () => {
        it("true", () => {
            swear(String_isEmpty("") === true);
        });
        it("false", () => {
            swear(String_isEmpty(" ")   === false);
            swear(String_isEmpty("123") === false);
        });
    });
    
    describe("isWhitespace", () => {
        it("true", () => {
            swear(String_isWhitespace(""));
            swear(String_isWhitespace("    "));
            swear(String_isWhitespace("\n\n\n\n\t\n\t"));
        });
        it("false", () => {
            swear(!String_isWhitespace("Hello, world!"));
            swear(!String_isWhitespace("    Hello,\n there!\n"));
        });
    });
});
