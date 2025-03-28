import {Ordering, Ordering_Equal, Ordering_Greater, Ordering_Less} from "./Ordering";
import {ComparableObject, compare, compareAny, compareIterable} from "./Comparable";
import {check} from "../../Debug/Check";

const {Less, Equal, Greater} = Ordering;

describe("compare()", () => {
    it("works for numbers", () => {
        const list = (
            [10, 4, 1, 2]
            .sort(compareAny)
        );
        let i = 0;
        check.same(list[i++], 1);
        check.same(list[i++], 2);
        check.same(list[i++], 4);
        check.same(list[i++], 10);
    });
    
    it("works for strings", () => {
        const list = (
            ["Hello", "Goodbye", "World", "!"]
            .sort(compareAny)
        );
        let i = 0;
        check.same(list[i++], "!");
        check.same(list[i++], "Goodbye");
        check.same(list[i++], "Hello");
        check.same(list[i++], "World");
    });
    
    it("works for values of different types", () => {
        const list = (
            [null, 5, "lel", true, 8n, 4n]
            .sort(compareAny)
        );
        let i = 0;
        check.same(list[i++], null);
        check.same(list[i++], true);
        check.same(list[i++], 5);
        check.same(list[i++], 4n);
        check.same(list[i++], 8n);
        check.same(list[i++], "lel");
        // TIL: undefined always gets sorted list
        // ...which is not what I want.
    });
    
    it("works for undefined and null", () => {
        check.same(compareAny(undefined, null), Ordering_Less);
        check.same(compareAny(NaN, null), Ordering_Greater);
    });
    
    it("works for NaN", () => {
        check.same(compare(NaN, NaN), Ordering_Equal);
    });
    
    it("\"works\" for normal objects", () => {
        const o1 = {};
        const o2 = {};
        
        check.same(compareAny(o1, o1), Ordering_Equal);
        check.same(compareAny(o1, o2), Ordering_Equal);
        check.same(compareAny(o2, o1), Ordering_Equal);
        check.same(compareAny(o2, o2), Ordering_Equal);
        // Reminder: same ordering is not the same as being equal
    });
    
    class Book implements ComparableObject {
        constructor(readonly title: string) { }
        
        compare(other: this): Ordering {
            return compare(this.title, other.title);
        }
    }
    
    class Game implements ComparableObject {
        constructor(readonly title: string) { }
        
        compare(other: this): Ordering {
            return compare(this.title, other.title);
        }
    }
    
    it("works for comparable objects", () => {
        const string1 = "Goodbye";
        const string2 = "Hello";
        const book1 = new Book(string1);
        const book2 = new Book(string2);
        const game1 = new Game(string1);
        const game2 = new Game(string2);
        
        const [item1, item2, item3, item4, item5, item6] = (
            [book1, string2, game2, string1, book2, game1]
            .sort(compareAny)
        );
        
        check.same(typeof item1, "string");
        check.same(typeof item2, "string");
        check.ok(typeof item3 === "object");
        check.ok(typeof item4 === "object");
        check.ok(typeof item5 === "object");
        check.ok(typeof item6 === "object");
        
        check.same(item1, string1);
        check.same(item2, string2);
        check.same(item3.title, string1);
        check.same(item4.title, string2);
        check.same(item5.title, string1);
        check.same(item6.title, string2);
        
        check.instanceOf(item3, Book);
        check.instanceOf(item4, Book);
        check.instanceOf(item5, Game);
        check.instanceOf(item6, Game);
    });
});

describe("compareIterable()", () => {
    it("sorts empty equal", () => {
        check.same(compareIterable([], []), Equal);
    });
    it("sorts shorter first", () => {
        check.same(compareIterable([], [1]), Less);
        check.same(compareIterable([2, 10], [2]), Greater);
    });
    it("sorts equal, equal", () => {
        check.same(compareIterable([2, 10], [2, 10]), Equal);
    });
});
