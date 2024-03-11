/** 
 * A `Promise` with delayed execution. 
 */
export type Task<T = any> = () => Promise<T>;

/** 
 * Immediately runs a task. Used to avoid ugly IIFEs. */
export function runTask<T>(task: Task<T>): Promise<T> {
    return task();
}

/** 
 * Queues a task to be run. 
 */
export function queueTask(task: Task, delayMs = 0): void {
    setTimeout(task, delayMs);
}

/** Resolves after the specified number of milliseconds. */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class TimeoutError extends Error {}

export async function timeout(ms: number): Promise<never> {
    await sleep(ms);
    throw new TimeoutError();
}
