<style>
h1, h2, h3 { color: mediumslateblue }
code       { font-size: 14px        }
</style>

# Wishlist

> A good compiler contains a microcosm of computer science. &ndash; _Engineering A Compiler, 2nd Edition by Cooper and Torczon_


### Split off `ts-NodeSystem`

Most code doesn't actually depend on Node-specific modules. Combine that with the following: the bucketlist programs, among which a programming language for music. That will use a large number of utilities provided by this library, but will not run on Node. Which is why seperating the node-specific code is a good idea.

Notable problem points:
* IO &ndash; Makes sense, not a big problem on the front-end.
* `getCaller` is annoying with the format. But I think ES has better built-in utilities to parse URLs now. 

### Mass-importer `@bliksem/`

An external program executed with `npx` that collects all `.ts` and `.spec.ts` into `Exports.generated.ts` and `Tests.generated.ts`.

This program would not import anything! Not system atleast, because we use it on System.

Note that it should exclude `.generated` files, and should exclude `index`.

### Dynamic test registrar

So always including tests is a waste of memory...but everything must be all to run its tests. 

Another thing...for memory, the data structure that holds the test cases is "deleted" when complete. 


### `when` &quest;

AKA `match` function which works on arbitrary unions of...well anything really. 

The original attempt of this thing used this...but that sucked because it reintroduced the dreaded `const self = this` to methods. Another version had the arguments limited to tuple-like things, so it was spread to user: `BinaryExpression(op, lhs, rhs)`. Looks cool, but looses on versatility. 

The acceptable compromise may be to require the use of 
```ts
interface Labeled<Kind extends string = string> {
    readonly kind: Kind;
}

declare const myObject: Cat | Dog | Fish;
when(myObject, {
    Cat: it => it.meow(),
    Dog: it => it.bark(),
    Fish: it => it.blub(),
});


```

Immediate thought: maybe a version that does not require all cases (but not something as finicky as Kotlin's statement-`when`.). You could call it `when???`.

Another thought: all these arrow functions...horribly inefficient. Maybe a good ol' if-elif is appropriate. But then it is no longer an expression.


### StringEnum~~Object~~ &quest;

What is the "Object" really doing there...

### ObjectEnum

The holy grail! and where my metaprogramming efforts go to die. It is about solving the hairy question of WHERE DO THE METHODS GO. Do they go on the base class? The derived cases? 

Note that the base case can work, with functions defined as follows:
```ts
function myMethod(this: Node, argument: number) { ... }
```
Then you just have to require them on the node contructor. Far more pressing is what to do with matching...

### Monorepo

Cool idea, but nothing guarantees that any single version actually works. In other words, you need some sort of build script that builds every single project in the monorepo. 

Contents of the monorepo:
* ts-System           (shared,        library)
* ts-WebSystem        (web   ,        library)
* ts-NodeSystem       (node  ,        library)
* ts-ReactFileServer  (node  , react, express, library)
* ts-Host3Protocol    (shared,        library)
* ts-Host3Client      (web   , react, application)
* ts-Host3Server      (node  , express, application)
* ts-Dawes
