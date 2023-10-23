export type Member<T> = T extends Iterable<infer R> ? R : never;
