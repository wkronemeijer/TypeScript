import { check } from "../../Debug/Check";
import { from } from "./Sequence";
import { snd } from "../Tuple";

describe("Sequence", () => {
    it("min/max/minimize/maximize", () => {
        const data = [
            ["John", 20],
            ["Alice", 18],
            ["Bob", 22],
        ] as const;
        
        check.same(from(data).min(snd), 18);
        check.same(from(data).minimize(snd)?.[0], "Alice");
        
        check.same(from(data).max(snd), 22);
        check.same(from(data).maximize(snd)?.[0], "Bob");
    });
});
