import { getAllNames } from "./Aliases";
import { check } from "../Errors/Check";

describe("getAllNames()", () => {
    const namedObject = {
        name: "John",
        alias: "Johnny",
        aliases: ["Johnders", "Mr Thunder"],
    };
    
    it("enumerates all names", () => {
        check(getAllNames( namedObject).length, 4);
    });
    
    it("puts name first", () => {
        check(getAllNames(namedObject)[0], "John");
    });
    
    it("skips missing properties", () => {
        check(getAllNames({
            name: "James",
            aliases: ["Jimmy"],
        }).length, 2);
    })
})
