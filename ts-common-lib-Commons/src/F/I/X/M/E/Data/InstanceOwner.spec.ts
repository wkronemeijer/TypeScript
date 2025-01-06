import { InstanceOwner_hasInstance } from "./InstanceOwner";
import { Member } from "./Collections/Enumeration";
import { check } from "../Debug/Check";

const hasInstance = InstanceOwner_hasInstance;

describe("InstanceOwner", () => {
    describe("#hasInstance()", () => {
        it("accepts built-ins", () => {
            check.ok(hasInstance(Array, []));
            check.notOk(hasInstance(Array, 5));
            
            check.ok(hasInstance(Error, new Error));
        });
        
        it("accepts user-defined (sub)classes", () => {
            class Foo {}
            class Bar extends Foo {}
            
            check.ok(hasInstance(Bar, new Bar));
            check.ok(hasInstance(Foo, new Bar));
            check.ok(hasInstance(Foo, new Foo));
            
            check.notOk(hasInstance(Bar, new Foo));
        });
        
        it("accepts custom owners", () => {
            const Alignment = new Set([
                "top",
                "middle",
                "bottom",
            ] as const);
            type Alignment = Member<typeof Alignment>;
            
            const AlignmentOwner = {
                [Symbol.hasInstance](x: unknown): x is Alignment {
                    return Alignment.has(x as any);
                }
            }
            
            check.ok(hasInstance(AlignmentOwner, "top"));
            check.ok(hasInstance(AlignmentOwner, "middle"));
            
            check.notOk(hasInstance(AlignmentOwner, "left"));
            check.notOk(hasInstance(AlignmentOwner, "right"));
            check.notOk(hasInstance(AlignmentOwner, undefined));
        });
    });
});
