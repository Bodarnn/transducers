# Introduction
Recently, I watched Rich Hickey's talk "Transducers" ([source](https://youtu.be/6mTbuzafcII?si=NoNGTIMgMWW49oOD)), which inspired me to make my own transducers.

We might iterate an array like this:

```javascript
const isOdd = (x) => x % 2;
const double = (x) => x * 2;
const sum = (a, c) => a + c;

const array = [1, 2, 3, 4, 5];

let result = 0;
for (let i = 0; i < array.length; i++) {
    const x = array[i];
    if (isOdd(x)) {
        result = sum(result, double(x));
    }
}

console.log(result); // 18
```

but many people prefer this:

```javascript
const isOdd = (x) => x % 2;
const double = (x) => x * 2;
const sum = (a, c) => a + c;

const array = [1, 2, 3, 4, 5];

const result = array
    .filter(isOdd)
    .map(double)
    .reduce(sum, 0);

console.log(result); // 18
```

since it's easier to read. However, it's less performant, because it loops 3 times, and creates 2 intermediate arrays.

What if we could have both performance and readability? Well, look at this:

```javascript
const isOdd = (x) => x % 2;
const double = (x) => x * 2;
const sum = (a, c) => a + c;

const array = [1, 2, 3, 4, 5];

const result = Transducer()
    .filter(isOdd)
    .map(double)
    .reduce(sum, 0)
    .transduce(array);

console.log(result); // 18
```

This code is readable, loops 1 time, and creates 0 intermediate arrays. So, what's a transducer?

# Transducers

A transducer is a function that takes a reducer and returns a reducer. They combine reducers like this:

```javascript
const transducer = (reducer) => (x) => reducer(x) + 1;

let reducer = (x) => x;
console.log(reducer(1)); // 1

reducer = transducer(reducer);
console.log(reducer(1)); // 2

reducer = transducer(reducer);
console.log(reducer(1)); // 3

# and so on...
```

In our earlier example, `map` and `filter` were just transducer factories:

```javascript
const map = (fun) => (reducer) => (x) => reducer(fun(x));
const filter = (fun) => (reducer) => (x) => fun(x) ? reducer(x) : null;

let reducer = (x) => x;
console.log(reducer(1)); // 1

reducer = map((x) => x * 2)(reducer);
console.log(reducer(1)); // 2

reducer = filter((x) => x % 2)(reducer);
console.log(reducer(1)); // 2

// reduce, map, and filter are now one function
```

and that's basically how transducers work.

My transducers have 2 entry points:

```javascript
const isOdd = (x) => x % 2;
const double = (x) => x * 2;
const sum = (a, c) => a + c;

const array = [1, 2, 3, 4, 5];

// JavaScript style
const result = Transducer()
    .filter(isOdd)
    .map(double)
    .reduce(sum, 0)
    .transduce(array);

console.log(result); // 18

// scikit-learn style
const transducer = Transducer([
    Transducer.Filter(isOdd),
    Transducer.Map(double),
    Transducer.Reduce(sum, 0)
]);

console.log(transducer.transduce(array)); // 18
```

Additionally, my transducers don't need `reduce`:

```javascript
const isOdd = (x) => x % 2;
const double = (x) => x * 2;

const array = [1, 2, 3, 4, 5];

const result = Transducer()
    .filter(isOdd)
    .map(double)
    .transduce(array);

console.log(result); // [2, 6, 8]
```

# Benchmarks

```javascript
const isOdd = (x) => x % 2;
const double = (x) => x * 2;
const sum = (a, c) => a + c;

const array = Array.from({length: 1048576}, () => Math.floor(256 * Math.random()));

let forLoop = 0;
for (let i = 0; i < 128; i++) {
    const start = performance.now();
    let result = 0;
    for (let i = 0; i < array.length; i++) {
        const x = array[i];
        if (isOdd(x)) {
            result = sum(result, double(x));
        }
    }
    forLoop += performance.now() - start;
}
console.log(`For loop: ${(forLoop / 128).toFixed(2)} ms`); // 27.97 ms

let functional = 0;
for (let i = 0; i < 128; i++) {
    const start = performance.now();
    const result = array
        .filter(isOdd)
        .map(double)
        .reduce(sum, 0);
    functional += performance.now() - start;
}
console.log(`Functional: ${(functional / 128).toFixed(2)} ms`); // 92.98 ms

let transducer = 0;
for (let i = 0; i < 128; i++) {
    const start = performance.now();
    const result = Transducer()
        .filter(isOdd)
        .map(double)
        .reduce(sum, 0)
        .transduce(array);
    transducer += performance.now() - start;
}
console.log(`Transducer: ${(transducer / 128).toFixed(2)} ms`); // 46.14 ms
```

# Conclusions

Transducers are cool. My benchmark shows them 2x faster than the methods, but 2x slower than a for loop.

Some issues I hit were:

- I couldn't figure out how to put `reduce` before another reducer. I don't think this is a problem, and you should save it for last.
- I couldn't figure out how to make the the initial value optional. It's tough, because you might `filter` first.

Also, I only implemented this for arrays! Perhaps the coolest part of transducers is that they're collection-agnostic. In the future, I'll add support for other collections.

Cheers!
