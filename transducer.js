"use strict";

/**
 * Creates a Transducer.
 * @param {(Transducer.Filter|Transducer.Map|Transducer.Reduce)[]} [transducers]
 * @returns {Transducer}
 */
function Transducer(transducers) {
    if (!(this instanceof Transducer)) {
        return new Transducer(transducers);
    }
    if (transducers == null) {
        transducers = [];
    }
    this.transducers = transducers;
    return this;
}

/**
 * Creates a Filter.
 * @param {Function} callbackFn
 * @returns {Transducer.Filter}
 */
Transducer.Filter = function (callbackFn) {
    if (!(this instanceof Transducer.Filter)) {
        return new Transducer.Filter(callbackFn);
    }
    this.initialValue = Array;
    this.reducer = Transducer._push;
    this.transducer = Transducer._filter(callbackFn);
    return this;
};

/**
 * Creates a Map.
 * @param {Function} callbackFn
 * @returns {Transducer.Map}
 */
Transducer.Map = function (callbackFn) {
    if (!(this instanceof Transducer.Map)) {
        return new Transducer.Map(callbackFn);
    }
    this.initialValue = Array;
    this.reducer = Transducer._push;
    this.transducer = Transducer._map(callbackFn);
    return this;
};

/**
 * Creates a Reduce.
 * @param {Function} callbackFn
 * @param {*} initialValue
 * @returns {Transducer.Reduce}
 */
Transducer.Reduce = function (callbackFn, initialValue) {
    if (!(this instanceof Transducer.Reduce)) {
        return new Transducer.Reduce(callbackFn, initialValue);
    }
    this.initialValue = Transducer._initialValue(initialValue);
    this.reducer = callbackFn;
    this.transducer = Transducer._reduce(callbackFn);
    return this;
};

/**
 * Creates a reduce transducer.
 * @param {Function} callbackFn
 * @returns {Function}
 */
Transducer._filter = function (callbackFn) {
    if (callbackFn == null) {
        throw new Error("Missing callback function");
    }
    return function (reducer) {
        return function (accumulator, currentValue, currentIndex, array) {
            if (callbackFn(currentValue, currentIndex, array)) {
                return reducer(accumulator, currentValue, currentIndex, array);
            }
            return accumulator;
        };
    };
};

/**
 * Creates an initial value generator.
 * @param {*} initialValue
 * @returns {Function}
 */
Transducer._initialValue = function (initialValue) {
    if (initialValue == null) {
        throw new Error("Missing initial value");
    }
    return function () {
        return JSON.parse(JSON.stringify(initialValue)); // TODO: structuredClone?
    }
};

/**
 * Creates a map transducer.
 * @param {Function} callbackFn
 * @returns {Function}
 */
Transducer._map = function (callbackFn) {
    if (callbackFn == null) {
        throw new Error("Missing callback function");
    }
    return function (reducer) {
        return function (accumulator, currentValue, currentIndex, array) {
            return reducer(accumulator, callbackFn(currentValue, currentIndex, array), currentIndex, array);
        };
    };
};

/**
 * Adds the current value to and returns the accumulator.
 * @param {Array} accumulator
 * @param {*} currentValue
 * @param {Number} [currentIndex]
 * @param {Array} [array]
 * @returns {Array}
 */
Transducer._push = function (accumulator, currentValue, currentIndex, array) {
    accumulator.push(currentValue);
    return accumulator;
};

/**
 * Creates a reduce transducer.
 * @param {Function} callbackFn
 * @returns {Function}
 */
Transducer._reduce = function (callbackFn) {
    if (callbackFn == null) {
        throw new Error("Missing callback function");
    }
    return function (reducer) {
        if (reducer !== callbackFn) {
            throw new Error("Reduce not last");
        }
        return reducer;
    };
};

/**
 * Composes the transducer and transduces an array.
 * @param {Array} array
 * @returns
 */
Transducer.prototype.composeTransduce = function (array) {
    this.compose();
    return this.transduce(array);
};

/**
 * Composes the transducer.
 * @returns {this}
 */
Transducer.prototype.compose = function () {
    var transducers = this.transducers;
    var n = transducers.length;
    var transducer = transducers[n - 1];
    var reducer = transducer.reducer;
    for (var i = n - 1; i >= 0; i--) {
        reducer = transducers[i].transducer(reducer);
    }
    this._initialValue = transducer.initialValue;
    this._reducer = reducer;
    return this;
};

/**
 * Creates a Filter and adds it to the transducers.
 * @param {Function} callbackFn
 * @returns {this}
 */
Transducer.prototype.filter = function (callbackFn) {
    this.transducers.push(new Transducer.Filter(callbackFn));
    return this;
};

/**
 * Creates a Map and adds it to the transducers.
 * @param {Function} callbackFn
 * @returns {this}
 */
Transducer.prototype.map = function (callbackFn) {
    this.transducers.push(new Transducer.Map(callbackFn));
    return this;
};

/**
 * Creates a Reduce and adds it to the transducers.
 * @param {Function} callbackFn
 * @param {*} initialValue
 * @returns {this}
 */
Transducer.prototype.reduce = function (callbackFn, initialValue) {
    this.transducers.push(new Transducer.Reduce(callbackFn, initialValue));
    return this;
};

/**
 * Transduces an array.
 * @param {Array} array
 * @returns
 */
Transducer.prototype.transduce = function (array) {
    if (array == null) {
        throw new Error("Missing array");
    }
    var n = array.length;
    var accumulator = this._initialValue();
    var reducer = this._reducer;
    for (var i = 0; i < n; i++) {
        accumulator = reducer(accumulator, array[i], i, array);
    }
    return accumulator;
};
