import { StringEnum } from "./StringEnum";
import { collect } from "../../Collections/Iterable";
import { Member } from "../Enumeration";

type ArgumentTuple<EArgs extends readonly Iterable<string>[]> = {
    [P in keyof EArgs]: Member<EArgs[P]>;
}

const getCombinations = collect(function* recurse<
    EArgs extends readonly Iterable<string>[]
>(
    sources: EArgs,
): Iterable<ArgumentTuple<EArgs>> {
    function tuple(...s: string[]): ArgumentTuple<EArgs> {
        return [...s] as ArgumentTuple<EArgs>;
    }
    
    const length = sources.length;
    if (length === 0) {
        return;
    }
    
    const pinnedSource = sources[0]!;
    if (length === 1) {
        for (const item of pinnedSource) {
            yield tuple(item);
        }
        return;
    }
    
    const remainingSources = sources.slice(1);
    for (const item of pinnedSource) {
        for (const items of recurse(remainingSources)) {
            yield tuple(item, ...items);
        }
    }
    
    // TODO: I am almost certain there is a more efficient implementation with an accumulator somewhere
});

export function StringEnum_combine<
    const EArgs   extends readonly Iterable<string>[], 
    const EReturn extends string,
>(
    sources: EArgs, 
    func: (...args: ArgumentTuple<EArgs>) => EReturn,
): StringEnum<EReturn> {
    return StringEnum(getCombinations(sources).map(args => func(...args)));
};
