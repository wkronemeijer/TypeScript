import { humanizeDuration } from "../Text/Formatting/Duration";
import { terminal } from "../IO/Terminal";

/** 
 * A `Promise` with delayed execution. 
 */
export type Task<T = any> = () => Promise<T>;

/** 
 * Immediately runs a task. Used to avoid ugly IIFEs. */
export function runTask(task: Task): void {
    task();
}

/** 
 * Queues a task to be run. 
 */
export function queueTask(task: Task, delayMs = 0): void {
    setTimeout(task, delayMs);
}

/** 
 * Resolves after the specified number of milliseconds. 
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** 
 * Immediately executes the given task, and 
 * logs the number of milliseconds it took to finish. 
 */
export async function timeTask<T>(name: string, task: Task<T>): Promise<T> {
    const start  = Date.now();
    const result = await task();
    const end    = Date.now();
    
    const duration = end - start;
    const humanDuration = humanizeDuration(duration);
    terminal.perf(`${name} ran for ${duration}ms (${humanDuration}).`);
    
    return result;
}
