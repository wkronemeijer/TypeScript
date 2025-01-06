import { swear } from "../Errors/Assert";

interface defer_Result<T> {
    readonly promise: Promise<T>;
    readonly resolve: (value: T | PromiseLike<T>) => void;
    readonly reject : (reason?: unknown) => void;
}

export function defer<T = void>(): defer_Result<T> {
    // TODO: Replace with 
    // return Promise.withResolvers()
    // ...when it is accepted
    let resolve: defer_Result<T>["resolve"] | undefined;
    let reject : defer_Result<T>["reject"]  | undefined;
    const promise = new Promise<T>((ok, err) => {
        resolve = ok;
        reject  = err;
    });
    swear(resolve);
    swear(reject);
    return { promise, resolve, reject };
}
