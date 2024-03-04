export type FirstLetter<S extends string> = (
    S extends `${infer R}${string}` ? R : never
);

export function firstLetter<S extends string>(string: S): FirstLetter<S> {
    return string[0]! as FirstLetter<S>;
}
