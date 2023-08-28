import { swear } from "../Assert";
import { panic } from "../Errors/ErrorFunctions";
import { Case, UnionMatcher } from "./SumType";

export {};

/////////////////////////////////////
// Version 1: on a specific object //
/////////////////////////////////////

///////////////////////////////////
// Version 2: on a regular class //
///////////////////////////////////

type Env = Map<string, number>;

type LiteralExpr = Case<"literal", {
    readonly value: number;
}>;

type VarExpr = Case<"var", {
    readonly name: string;
}>;

type AddExpr = Case<"add", {
    readonly left: Expr;
    readonly right: Expr;
}>;

type Expr = 
    | LiteralExpr
    | VarExpr
    | AddExpr
;

class Calculator {
    add({ left, right }: AddExpr, env: Env): number {
        return this.eval(left, env) + this.eval(right, env);
    }
    
    literal({ value }: LiteralExpr, bool: Env): number {
        return bool ? value : 0;
    }
    
    var({ name }: VarExpr, env: Env): number {
        return env.get(name) ?? panic();
    }
    
    eval = UnionMatcher<Expr, [env: Env], number>(this);
}

describe("UnionMatcher", () => {
    it("handles recursion", () => {
        const env = new Map([
            ["x", 10],
            ["y", 20],
        ])
        
        const expr: Expr = {
            kind: "add",
            left: {
                kind: "add",
                left: {
                    kind: "var",
                    name: "x",
                },
                right: {
                    kind: "literal",
                    value: 30,
                }
            },
            right: {
                kind: "var",
                name: "y",
            },
        };
        
        const ti84 = new Calculator;
        swear(ti84.eval(expr, env) === 60);
    });
});
