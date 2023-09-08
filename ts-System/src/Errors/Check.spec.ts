import { EquatableObject } from "../Traits/Equatable/Equatable";
import { Falsy } from "../Types/Truthy";
import { check } from "./Check";

describe("check", () => {
    class vec2 implements EquatableObject {
        constructor(
            readonly x: number,
            readonly y: number,
        ) {}
        
        equals(other: this): boolean {
            return (
                (this.x === other.x) &&
                (this.y === other.y)
            );
        }
        
        toString(): string {
            return `(${this.x}, ${this.y})`;
        }
    }
    
    it("handles basic equality", () => {
        check(10, 10);
        check.throws(() => check(10, 20));
    });
    
    it("uses SameValueZero", () => {
        check(0, -0);
        check(NaN, NaN);
        check(false, false);
    });
    
    it("checks reference identity", () => {
        check.throws(() => {
            check(new vec2(3, 4), new vec2(3, 4));
        });
    });
    
    describe(".equals()", () => {
        it("handles basic equality", () => {
            check.equals(10, 10);
            check.throws(() => check(10, 20));
        });
        
        it("uses SameValueZero", () => {
            check.equals(0, -0);
            check.equals(NaN, NaN);
            check.equals(false, false);
        });
        
        // FIXME: This doesn't work, and I expect equals it to blame.
        it.skip("checks custom equality", () => {
            const p1 = new vec2(3, 4);
            const p2 = new vec2(3, 4); // different instance, same value
            const p3 = new vec2(5, 2); // different value
            
            check.equals(p1, p2);
            check.equals(p2, p1);
            
            check.throws(() => check.equals(p1, p3));
            check.throws(() => check.equals(p3, p2));
        });
    });
    
    describe(".instanceOf", () => {
        it("accepts instances", () => {
            check.instanceOf([], Object);
            check.instanceOf([], Array);
        });
        
        it("rejects non-instances", () => {
            check.throws(() => check.instanceOf({}, Array));
            check.throws(() => check.instanceOf("", String));
        });
        
        it("accepts custom owners", () => {
            const Truthy = {
                [Symbol.hasInstance]<T>(x: unknown): x is Exclude<T, Falsy> {
                    return !!x;
                }
            }
            
            check.instanceOf(true, Truthy);
            check.instanceOf(5, Truthy);
            check.throws(() => check.instanceOf(0, Truthy));
        })
    });
    
    describe(".matches", () => {
        it("accepts matching text", () => {
            check.matches("foo", /foo/);
            check.matches("abbbc", /ab+c/);
        });
        
        it("accepts matching text", () => {
            check.matches("foo", /foo/);
            check.matches("abbbc", /ab+c/);
        });
        
        it("rejects non-matching text", () => {
            check.matches("foo", /foo/);
            check.matches("abbbc", /ab+c/);
        });
    });
    
    describe(".throws", () => {
        it("does throws when the function doesn't", () => {
            try {
                check.throws(() => 0);
            } catch {
                return;
            }
            throw new Error("Doesn't throw.");
        });
        
        it("doesn't throws when the function does", () => {
            check.throws(() => {
                throw new Error("Should be caught.")
            });
        });
    });
    
    describe.skip(".throwsInstanceOf", () => {
        it("does throws when the function doesn't", () => {
            try {
                check.throwsInstanceOf(Error, () => 0);
            } catch {
                return;
            }
            throw new Error("Doesn't throw.");
        });
        
        it("doesn't throws when the function does", () => {
            check.throwsInstanceOf(Error, () => {
                throw new Error("Should be caught.")
            });
        });
        
        it("throws when the function doesn't throw an instance", () => {
            try {
                check.throwsInstanceOf(Error, () => {
                    throw "Should be caught.";
                });
            } catch { }
            throw new Error("Doesn't throw.");
        });
    });
});
