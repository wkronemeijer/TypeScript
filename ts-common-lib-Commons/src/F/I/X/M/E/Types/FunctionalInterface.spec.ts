import { FunctionalInterface_createTypeGuard } from "./FunctionalInterface";
import { check } from "../Errors/Check";

describe("FunctionalInterface", () => {
    describe(".createTypeGuard()", () => {
        interface HasLength {
            getLength(): number;
        }
        
        const isLengthHaver = FunctionalInterface_createTypeGuard("getLength")<HasLength>(0);
        
        class Correct {
            readonly string: string = "some string";
            
            getLength(): number {
                return this.string.length;
            }
        }
        
        class Incorrect {
            readonly strings = ["some", "strings"];
            
            getLength(index: number): number {
                return this.strings[index]?.length ?? 0;
            }
        }
        
        it("rejects value types", () => {
            check.notOk(isLengthHaver(3));
            check.notOk(isLengthHaver("lel"));
            check.notOk(isLengthHaver(undefined));
        });
        
        it("rejects plain objects", () => {
            check.notOk(isLengthHaver({}));
        });
        
        it("rejects objects with extra parameters", () => {
            check.notOk(isLengthHaver(new Incorrect));
            check.notOk(isLengthHaver({
                getLength(_a: unknown, _b: unknown) {
                    return true;
                },
            }));
        });
        
        it("accepts equatable objects", () => {
            check.ok(new Correct);
            check.ok({
                getLength(other: unknown) {
                    return true;
                },
            });
        });
    });
});
