import {deserialize, markSerializable, serialize} from "./Serializable";
import {check} from "../Debug/Check";

class Point {
    constructor(
        readonly x: number,
        readonly y: number,
    ) {}
}

class NamedPointMap {
    constructor(
        readonly map: Map<string, Point>,
    ) {}
}

markSerializable(Point);
markSerializable(NamedPointMap, {
    dependencies: [Point, Map],
});

describe("Serializable", () => {
    it("works", () => {
        const value = new NamedPointMap(new Map([
            ["kek", new Point(3, 4)],
            ["lel", new Point(10, 2)],
        ]));
        
        const json = serialize(value);
        const restored = deserialize(NamedPointMap, json);
        check.same(restored.map.get("kek")?.x, 3);
        check.same(restored.map.get("kek")?.y, 4);
        check.same(restored.map.get("lel")?.x, 10);
        check.same(restored.map.get("lel")?.y, 2);
    });
    // TODO: More tests ideas:
    // non-enumerable
    // non-constructor
});
