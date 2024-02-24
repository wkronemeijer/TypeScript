export type Table<K extends string> = {
    [P in K]: number;
};

export function Table<K extends string>(keys: Iterable<K>): Table<K> {
    const result = {} as any;
    for (const key of keys) {
        result[key] = 0;
    }
    return result;
}
