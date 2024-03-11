import { sqrt } from "../../Re-export/Math";
import { ReadWrite } from "../../Types/Magic";

import { check } from "../../Debug/Check";

import { Immutable } from "./Immutable";

class Point extends Immutable {
    constructor(
        readonly x: number, 
        readonly y: number,
    ) {
        super();
    }
    
    get length(): number {
        return sqrt(this.x ** 2 + this.y ** 2);
    }
    
    get normalized(): Point {
        const { x, y, length } = this;
        return this.with({
            x: x / length, 
            y: y / length,
        });
    }
}

describe("Immutable", () => {
    it("has new values", () => {
        const p = new Point(3, 4);
        const q = p.with({ x: 10 });
        check.ok(p.x !== q.x);
    });
    it("does not modify old", () => {
        const p = new Point(3, 4);
        const _ = p.with({ x: 10 });
        check.same(p.x, 3);
    });
    it("prevents modification of old", () => {
        const p = new Point(3, 4);
        const _ = p.with({ x: 10 });
        check.throws(() => {
            (p as ReadWrite<typeof p>).x = 10;
        });
    });
});
