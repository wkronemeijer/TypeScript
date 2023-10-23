import { panic } from "../(Commons)/Assert";

/** Template but similar to React, it filters out falsy arguments. */
export function FileTemplate(
    fixedStrings: TemplateStringsArray, 
    ...variableStrings: (
        | string 
        | false
        | null
        | undefined
    )[]
): string {
    let variable;
    const result = new Array<string>;
    
    // It is guaranteed that #fixed + 1 == #variable 
    const length = variableStrings.length;
    
    result.push(fixedStrings[0] ?? panic());
    
    for (let i = 0; i < length; i++) {
        result.push(fixedStrings[i + 1] ?? panic());
        if (variable = variableStrings[i]) {
            result.push(variable);
        }
        // empty string and false have the same effect
    }
    
    return result.join("");
}
