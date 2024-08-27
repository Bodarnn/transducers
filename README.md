# Transducers
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

since it's easier to read. However, it's less performant, because it loops 3 times, and creates an intermediate array for each loop.

What if we could have both?

```javascript
const isOdd = (x) => x % 2;
const double = (x) => x * 2;
const sum = (a, c) => a + c;

const array = [1, 2, 3, 4, 5];

const result = Transducer().filter(isOdd).map(double).reduce(sum, 0).transduce(array);

console.log(result); // 18
```

Transducers are functions that take reducers and return reducers.

Based on my understanding, transducers are functions that take a reducer and return a reducer. 

- Are collection-agnostic
- Are fast

# Benchmarks


# Conclusions

