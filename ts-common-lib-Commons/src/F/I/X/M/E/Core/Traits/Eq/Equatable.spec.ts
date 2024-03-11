import { EquatableObject, equals, equalsAny } from "./Equatable";
import { check } from "../../Debug/Check";
import { panic } from "../../Errors/Panic";

describe("equals()", () => {
    it("works for values", () => {
        check.ok(equals(3, 3));
        check.ok(equals("foo", "FOO".toLowerCase()));
        check.notOk(equals(3, 4));
        check.notOk(equals(true, false));
    });
    
    it("works for NaN", () => {
        check.ok(equals(NaN, NaN));
    });
    
    it("works for normal objects", () => {
        const o1 = {};
        const o2 = {};
        
        check.ok(equalsAny(o1, o1));
        check.ok(equalsAny(o2, o2));
        check.notOk(equalsAny(o1, o2));
        check.notOk(equalsAny(o2, o1));
    });
    
    it("works for equatable objects", () => {
        class Point implements EquatableObject {
            constructor(readonly x: number, readonly y: number) { }
            
            equals(other: this): boolean {
                return (this.x === other.x && this.y === other.y);
            }
            
            toString(): string { return `(${this.x}, ${this.y})`; }
        }
        
        const p1    = new Point(3, 4);
        const p1alt = new Point(3, 4);
        const p2    = new Point(6, 5);
        const p3 = {
            x: 3, 
            y: 4, 
            equals: () => panic(), // boobytrap
        };
        
        check.ok(p1.equals === p1alt.equals);
        check.ok(p1.equals(p1alt));
        check.ok(equals(p1, p1alt));
        
        check.ok(equals(p1, p1));
        check.ok(equals(p1alt, p1));
        check.ok(equals(p1alt, p1alt));
        check.notOk(equals(p1, p2));
        check.notOk(equals(p1alt, p2));
        check.notOk(equals(p1, p3));
        check.notOk(equals(p1, {} as any));
    });
});
