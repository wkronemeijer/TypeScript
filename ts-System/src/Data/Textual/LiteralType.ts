import { identity } from "../../Function";

type Split<S extends string, D extends string> =
    string extends S                          ? string[]            :
    S      extends ""                         ? []                  :
    S      extends           `${D}${infer U}` ?        Split<U, D>  :
    S      extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] :
    [S]
;

const space = ' ';

export function words<S extends string>(strings: S): Split<S, typeof space> {
    const result: string[] = strings.split(space).filter(identity);
    return result as any;
}
