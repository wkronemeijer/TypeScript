import { HasInstance_inject } from "./HasInstance";
import { check } from "./Debug/Check";

describe("HasInstance", () => {
    describe(".inject()", () => {
        it("injects hasInstance", () => {
            const owner = {};
            const owns = (x: unknown): x is string => typeof x === "string";
            
            HasInstance_inject(owner, owns);
            
            check.ok(owner.hasInstance("foo"));
            check.notOk(owner.hasInstance(4));
        });
        it("injects @@hasInstance on objects", () => {
            const owner = {};
            const owns = (x: unknown): x is string => typeof x === "string";
            
            HasInstance_inject(owner, owns);
            
            check.ok(("foo" as any) instanceof (owner as any));
            check.notOk((4 as any) instanceof (owner as any));
            
        });
        it("injects @@hasInstance on functions", () => {
            const owner = () => void 0;
            const owns = (x: unknown): x is string => typeof x === "string";
            
            HasInstance_inject(owner, owns);
            
            check.ok(("foo" as any) instanceof (owner as any));
            check.notOk((4 as any) instanceof (owner as any));
        });
    });
});
