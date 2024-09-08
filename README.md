This project was inspired by "'Transducers' by Rich Hickey" ([source](https://youtu.be/6mTbuzafcII?si=NoNGTIMgMWW49oOD)).

```javascript
// Setup

const isOdd = (x) => x % 2;
const double = (x) => x * 2;
const sum = (a, x) => a + x;

const array = [1, 2, 3, 4, 5];
```

# Introduction

We can iterate an array using a for loop

```javascript
// For loop

const n = array.length;
let result = 0;

for (let i = 0; i < n; i++) {
    const x = array[i];
    if (isOdd(x)) {
        result = sum(result, double(x));
    }
}

console.log(result); // 18
```

and/or using functions.

```javascript
// Functional

const result = array
    .filter(isOdd)
    .map(double)
    .reduce(sum, 0);

console.log(result); // 18
```

However, both have disadvantages which a transducer can mitigate.

```javascript
// Transducers

const result = Transducer()
    .filter(isOdd)
    .map(double)
    .reduce(sum, 0)
    .composeTransduce(array);

console.log(result); // 18
```

The transducer is more readable than the for loop, and more performant than the functions.

# Transducers

A transducer is a function that takes a reducer and returns a reducer.

They compose many reducers to one.

```javascript
// Double transducer

const transducer = (reducer) => (x) => reducer(x) * 2;

let reducer = (x) => x;
console.log(reducer(1)); // 1

reducer = transducer(reducer);
console.log(reducer(1)); // 2

reducer = transducer(reducer);
console.log(reducer(1)); // 4

// and so on...
```

In the introduction, `map` and `filter` are transducer factories.

```javascript
const map = (callbackFn) => (reducer) => (x) => reducer(callbackFn(x));
const filter = (callbackFn) => (reducer) => (x) => callbackFn(x) ? reducer(x) : null;

let reducer = (x) => x;
console.log(reducer(1)); // 1

reducer = map(double)(reducer);
console.log(reducer(1)); // 2

reducer = filter(isOdd)(reducer);
console.log(reducer(1)); // 2
console.log(reducer(2)); // null

// and so on...
```

This is essentially how transducers work.

# Examples

This sections shows some simple examples.

```javascript
// JavaScript style

const result = Transducer()
    .filter(isOdd)
    .map(double)
    .reduce(sum, 0)
    .composeTransduce(array);

console.log(result); // 18
```

```javascript
// scikit-learn style

const array1 = [1, 2, 3, 4, 5];
const array2 = [6, 7, 8, 9, 0];

const transducer = Transducer([
    Transducer.Filter(isOdd),
    Transducer.Map(double),
    Transducer.Reduce(sum, 0)
]);

transducer.compose();

const result1 = transducer.transduce(array1);
const result2 = transducer.transduce(array2);

console.log(result1); // 18
console.log(result2); // 32
```

```javascript
// Without reduce

const result = Transducer()
    .filter(isOdd)
    .map(double)
    .composeTransduce(array);

console.log(result); // [2, 6, 10]
```

# Benchmarks

This section show some simple benchmarks.

```javascript
const isOdd = (x) => x % 2;
const double = (x) => x * 2;
const sum = (a, c) => a + c;

const array = Array.from({length: 1048576}, () => Math.floor(256 * Math.random()));

let forLoop = 0;
let functional = 0;
let transducer = 0;

for (let i = 0; i < 128; i++) {
    const start = performance.now();
    let result = 0;
    for (let i = 0; i < array.length; i++) {
        const x = array[i];
        if (isOdd(x)) {
            result = sum(result, double(x));
        }
    }
    const stop = performance.now();
    forLoop += stop - start;
}

for (let i = 0; i < 128; i++) {
    const start = performance.now();
    const result = array
        .filter(isOdd)
        .map(double)
        .reduce(sum, 0);
    const stop = performance.now();
    functional += stop - start;
}

for (let i = 0; i < 128; i++) {
    const start = performance.now();
    const result = Transducer()
        .filter(isOdd)
        .map(double)
        .reduce(sum, 0)
        .composeTransduce(array);
    const stop = performance.now();
    transducer += stop - start;
}

console.log(`For loop: ${(forLoop / 128).toFixed(2)} ms`); // 26.19 ms
console.log(`Functional: ${(functional / 128).toFixed(2)} ms`); // 102.23 ms
console.log(`Transducer: ${(transducer / 128).toFixed(2)} ms`); // 46.09 ms
```

# Conclusion

Transducers are cool. They benchmark 2x faster than functions, and 2x slower than for loops.

Additionally, (like for loops, and unlike functions) they do not create intermediate arrays.

However, they have some quirks:
- They require an initial value, especially for `filter` and sparse arrays.
- `reduce` can only be last, since it only passes down an accumulator.

Finally, I only implemented transducers for arrays. Perhaps the coolest part of transducers is that they can be collection-agnostic.

In the future, I might add support for other collections.

Cheers!
