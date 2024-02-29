<style>pre code { font-size: 14px } </style>

# @wkronemeijer/ts-System

My personal standard library for TypeScript (don't notice the contradiction). 

## Wishlist

### Deferred

```ts
type Defer<T> = () => T
type Deferred<T> = 
    | Defer<T>
    | T 
;
```

### 
