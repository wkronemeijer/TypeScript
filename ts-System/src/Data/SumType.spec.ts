import { swear } from "../Assert";
import { Case, UnionMatcher, matchWithContext, matchItself, visit } from "./SumType";

export {};

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

const evaluator: UnionMatcher<Env, Expr, number> = {
    add({ left, right }) {
        return evaluate(left, this) + evaluate(right, this);
    },
    literal({ value }) {
        return value;
    },
    var({ name }) {
        return this.get(name) ?? 0;
    },
}

// unfortunately needs a trampoline...
// ...but, it is better this way. 

function evaluate(expr: Expr, env: Env = new Map): number {
    return visit(evaluator, expr, env);
}

class Calculator {
    constructor(
        private readonly env: Env = new Map,
    ) { }
    
    get(name: string): number {
        return this.env.get(name) ?? 0;
    }
    
    set(name: string, value: number): void {
        this.env.set(name, value);
    }
    
    add({ left, right }: AddExpr): number {
        return this.eval(left) + this.eval(right);
    }
    
    literal({ value }: LiteralExpr): number {
        return value;
    }
    
    var({ name }: VarExpr): number {
        return this.get(name);
    }
    
    eval(expr: Expr): number {
        matchItself(this, expr);
        
        // \/ this part is ugly
        const result = visit(this,expr, this);
        return result;
    }
}

(function(){
    const env = new Map([
        ["x", 10],
        ["y", 20]
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
    swear(evaluate(expr, env) === 60);
}())
