import { check } from "../Errors/Check";
import { TemplateString } from "./TemplateString";

describe("TemplateString()", () => {
    it("handles constant templates", () => {
        check(
            TemplateString`Hello, world!`,
            `Hello, world!`,
        )
    });
    
    it("handles normal templates", () => {
        check(
            TemplateString`2 + 2 = ${2+2}!`, 
            `2 + 2 = 4!`,
        );
        
        check(
            TemplateString`1 ${2} 3 ${4} 5 ${6}`, 
            `1 2 3 4 5 6`,
        );
    });
    
    it("accepts any value", () => {
        check(
            TemplateString`${undefined} ${null} ${true} ${false}`,
            `undefined null true false`,
        );
        check(
            TemplateString`${0} ${42} ${-2.7}`,
            `0 42 -2.7`,
        );
        check(
            TemplateString`Symbol = ${Symbol.hasInstance}`,
            `Symbol = Symbol(Symbol.hasInstance)`,
        );
    });
});
