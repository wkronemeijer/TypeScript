import { EquatableObject } from "../Traits/Equatable/Equatable";
import { Falsy } from "../Types/Truthy";
import { check } from "./Check";

describe("check()", () => {
    class Point implements EquatableObject {
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
            check(new Point(3, 4), new Point(3, 4));
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
        
        it("checks custom equality", () => {
            const p1 = new Point(3, 4);
            const p2 = new Point(3, 4); // different instance, same value
            const p3 = new Point(5, 2); // different value
            
            check.equals(p1, p2);
            check.equals(p2, p1);
            
            check.throws(() => check.equals(p1, p3));
            check.throws(() => check.equals(p3, p2));
        });
    });
    
    describe(".same()", () => {
        it("handles basic equality", () => {
            check.same(10, 10);
            check.throws(() => check(10, 20));
        });
        
        it("uses SameValueZero", () => {
            check.same(0, -0);
            check.same(NaN, NaN);
            check.same(false, false);
        });
        
        it("ignores custom equality", () => {
            const p1 = new Point(3, 4);
            const p2 = new Point(3, 4); // different instance, same value
            const p3 = new Point(5, 2); // different value
            
            check.same(p1, p1);
            check.same(p2, p2);
            check.same(p3, p3);
            
            check.throws(() => check.same(p1, p2));
            check.throws(() => check.same(p2, p1));
            check.throws(() => check.same(p1, p3));
            check.throws(() => check.same(p3, p2));
        });
    });
    
    describe(".instanceOf()", () => {
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
        
        it("rejects global and sticky patterns", () => {
            check.throws(() => check.matches("foo", /foo/g));
            check.throws(() => check.matches("foo", /foo/y));
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
    
    describe(".throwsInstanceOf", () => {
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
            } catch {
                return;
            }
            throw new Error("Doesn't throw.");
        });
    });
});
