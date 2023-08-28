
export interface Getter<TParams extends any[], TResult> {
    (...args: TParams): TResult;
}

export interface Setter<TParams extends any[], TResult> {
    (...args: [...TParams, newValue: TResult]): void;
}


export interface Updater<TParams extends any[], > {
    
}

/*
Problem: there are 2 kinds of update:
plain get and set; get can never fail
plain get, set, and has; get fails if !has
(fails is either a throw or just undefined, )
init, get, set and has ~~> get and set
at that point iterator and delete become relevant too.
...but that is not as necessary.

GetSetHas -> Initializer -> GetSet


({Get, Has}, Initializer) -> Get'

also note that set doesn't need changing
hard part is wrapping objects so they correctly use this

also note that initializer needs something meaningful;
it can depend on args, but at the same time, 

GetSet -> Update -> 


update can be 



setting is the same as getting a reference and then `.value=`ing it
Although...references are kind of weird.


*/


interface UpdateFunctions<K, V, TArgs extends any[]> {
    
}

interface UpdateObject<K, V> {
    
}



function createUpdate<K, V, TArgs extends any[]>(
    
)

interface MapLike<K, V> {
    has(key: K): boolean;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
}

function createUniversalGetter<K, V>(
    map: MapLike<K, V>,
    initializer: (key: K) => V,
): Getter<[key: K], V> {
    
}


const myMap = new Map([
    ["Jimmy", 10],
    ["Johnny", 20],
]);

const get = createUniversalGetter(myMap, () => 0);
