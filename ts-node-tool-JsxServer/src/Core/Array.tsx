export async function Array$fromAsync<T>(iter: AsyncIterable<T>): Promise<T[]> {
    const result = new Array<T>();
    for await (const item of iter) {
        result.push(item);
    }
    return result;
}
