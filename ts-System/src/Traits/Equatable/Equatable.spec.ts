import { EquatableObject_hasInstance } from "./Equatable";
import { check } from "../../Errors/Check";

describe("EquatableObject", () => {
    describe(".hasInstance()", () => {
        const hasInstance = EquatableObject_hasInstance;
        
        it("rejects value types", () => {
            check.notOk(hasInstance(3));
            check.notOk(hasInstance("lel"));
            check.notOk(hasInstance(undefined));
        });
        
        it("rejects plain objects", () => {
            check.notOk(hasInstance({}));
            check.notOk(hasInstance({ equalTo() { return true; } }));
        });
        
        it("rejects objects with extra parameters", () => {
            check.notOk(hasInstance({
                equals() { 
                    return true; 
                },
            }));
            check.notOk(hasInstance({
                equals(_a: unknown, _b: unknown) {
                    return true;
                },
            }));
        });
        
        it("accepts equatable objects", () => {
            check.ok({
                equals(other: unknown) {
                    return true;
                },
            });
        });
    });
});
