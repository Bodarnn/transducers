"use strict";

function Transducer(transducers) {
    if (!(this instanceof Transducer)) {
        return new Transducer(transducers);
    }
    this.transducers = transducers || [];
    return this;
}

Transducer.Filter = function (callbackFn) {
    if (!(this instanceof Transducer.Filter)) {
        return new Transducer.Filter(callbackFn);
    }
    this.initialValue = [];
    this.transducer = Transducer.filter(callbackFn);
    this.reducer = this.transducer(Transducer._push);
    return this;
};

Transducer.Map = function (callbackFn) {
    if (!(this instanceof Transducer.Map)) {
        return new Transducer.Map(callbackFn);
    }
    this.initialValue = [];
    this.transducer = Transducer.map(callbackFn);
    this.reducer = this.transducer(Transducer._push);
    return this;
};

Transducer.Reduce = function (callbackFn, initialValue) {
    if (!(this instanceof Transducer.Reduce)) {
        return new Transducer.Reduce(callbackFn, initialValue);
    }
    this.initialValue = initialValue;
    this.transducer = Transducer.reduce(callbackFn, initialValue);
    this.reducer = callbackFn;
    return this;
};

Transducer._push = function (accumulator, element, index, array) {
    accumulator.push(element);
    return accumulator;
};

Transducer.map = function (callbackFn) {
    if (callbackFn == null) {
        throw new Error("Missing callback function");
    }
    return function (reducer) {
        return function (accumulator, element, index, array) {
            return reducer(accumulator, callbackFn(element, index, array), index, array);
        };
    };
};

Transducer.filter = function (callbackFn) {
    if (callbackFn == null) {
        throw new Error("Missing callback function");
    }
    return function (reducer) {
        return function (accumulator, element, index, array) {
            if (callbackFn(element, index, array)) {
                return reducer(accumulator, element, index, array);
            } else {
                return accumulator;
            }
        };
    };
};

Transducer.reduce = function (callbackFn, initialValue) {
    if (callbackFn == null) {
        throw new Error("Missing callback function");
    }
    if (initialValue == null) {
        throw new Error("Missing initial value");
    }
    return function (reducer) {
        throw new Error("Can only reduce last");
    };
};

Transducer.prototype.filter = function (callbackFn) {
    this.transducers.push(new Transducer.Filter(callbackFn));
    return this;
};

Transducer.prototype.map = function (callbackFn) {
    this.transducers.push(new Transducer.Map(callbackFn));
    return this;
};

Transducer.prototype.reduce = function (callbackFn, initialValue) {
    this.transducers.push(new Transducer.Reduce(callbackFn, initialValue));
    return this;
};

Transducer.prototype.transduce = function (array) {
    if (array == null) {
        throw new Error("Missing array");
    }
    var transducers;
    var i;
    var accumulator;
    var reducer;
    var n;
    transducers = this.transducers;
    i = transducers.length - 1;
    accumulator = transducers[i].initialValue;
    reducer = transducers[i].reducer;
    n = array.length;
    for (i--; i >= 0; i--) {
        reducer = transducers[i].transducer(reducer);
    }
    for (i++; i < n; i++) {
        accumulator = reducer(accumulator, array[i], i, array);
    }
    return accumulator;
};
