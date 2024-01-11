import { deserialize, serializable, serialize } from "./Serializable";
import { check } from "../Errors/Check";
import { sqrt } from "../ReExport/Module/Math";

class Point {
    constructor(
        readonly x: number,
        readonly y: number,
    ) {}
    
    get length(): number {
        return sqrt(this.x ** 2 + this.y ** 2);
    }
} 

class PointList {
    constructor(
        readonly points: readonly Point[]
    ) {}
}

serializable()(Point);
serializable([Point])(PointList);

describe("Serializable", () => {
    it("works", () => {
        const list = new PointList([
            new Point(3, 4),
            new Point(6, 8),
            new Point(-10, 5),
        ]);
        const newList = deserialize(PointList, serialize(list));
        check.same(list.points[0]!.length, newList.points[0]!.length);
    });
    // TODO: More tests ideas:
    // non-enumerable
    // non-constructor
});
