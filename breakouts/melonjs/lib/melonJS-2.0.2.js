/**
 * @license MelonJS Game Engine
 * @copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 * melonJS is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function () {
 
    /**
     * The built in window Object
     * @external window
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window.window|window}
     */

    /**
     * (<b>m</b>)elonJS (<b>e</b>)ngine : All melonJS functions are defined inside
     * of this namespace.
     * <p>You generally should not add new properties to this namespace as it may be
     * overwritten in future versions.</p>
     * @namespace
     */
    window.me = window.me || {};

    /*
     * DOM loading stuff
     */
    var readyBound = false, isReady = false, readyList = [];

    // Handle when the DOM is ready
    function domReady() {
        // Make sure that the DOM is not already loaded
        if (!isReady) {
            // be sure document.body is there
            if (!document.body) {
                return setTimeout(domReady, 13);
            }

            // clean up loading event
            if (document.removeEventListener) {
                document.removeEventListener(
                    "DOMContentLoaded",
                    domReady,
                    false
                );
            }
            else {
                window.removeEventListener("load", domReady, false);
            }

            // Remember that the DOM is ready
            isReady = true;

            // execute the defined callback
            for (var fn = 0; fn < readyList.length; fn++) {
                readyList[fn].call(window, []);
            }
            readyList.length = 0;

            /*
             * Add support for AMD (Asynchronous Module Definition) libraries
             * such as require.js.
             */
            if (typeof define === "function" && define.amd) {
                define("me", [], function () {
                    return me;
                });
            }
        }
    }

    // bind ready
    function bindReady() {
        if (readyBound) {
            return;
        }
        readyBound = true;

        // directly call domReady if document is already "ready"
        if (document.readyState === "complete") {
            return domReady();
        }
        else {
            if (document.addEventListener) {
                // Use the handy event callback
                document.addEventListener("DOMContentLoaded", domReady, false);
            }
            // A fallback to window.onload, that will always work
            window.addEventListener("load", domReady, false);
        }
    }

    /**
     * Specify a function to execute when the DOM is fully loaded
     * @memberOf external:window#
     * @alias onReady
     * @param {Function} handler A function to execute after the DOM is ready.
     * @example
     * // small main skeleton
     * var game = {
     *    // Initialize the game
     *    // called by the window.onReady function
     *    onload : function () {
     *       // init video
     *       if (!me.video.init('screen', 640, 480, true)) {
     *          alert("Sorry but your browser does not support html 5 canvas.");
     *          return;
     *       }
     *
     *       // initialize the "audio"
     *       me.audio.init("mp3,ogg");
     *
     *       // set callback for ressources loaded event
     *       me.loader.onload = this.loaded.bind(this);
     *
     *       // set all ressources to be loaded
     *       me.loader.preload(game.resources);
     *
     *       // load everything & display a loading screen
     *       me.state.change(me.state.LOADING);
     *    },
     *
     *    // callback when everything is loaded
     *    loaded : function () {
     *       // define stuff
     *       // ....
     *
     *       // change to the menu screen
     *       me.state.change(me.state.MENU);
     *    }
     * }; // game
     *
     * // "bootstrap"
     * window.onReady(function () {
     *    game.onload();
     * });
     */
    window.onReady = function (fn) {
        // Attach the listeners
        bindReady();

        // If the DOM is already ready
        if (isReady) {
            // Execute the function immediately
            fn.call(window, []);
        }
        else {
            // Add the function to the wait list
            readyList.push(function () {
                return fn.call(window, []);
            });
        }
        return this;
    };
    
    // call the library init function when ready
    // (this should not be here?)
    if (me.skipAutoInit !== true) {
        window.onReady(function () {
            me.boot();
        });
    }
    else {
        me.init = function () {
            me.boot();
            domReady();
        };
    }

    if (!window.throttle) {
        /**
         * a simple throttle function
         * use same fct signature as the one in prototype
         * in case it's already defined before
         * @ignore
         */
        window.throttle = function (delay, no_trailing, callback) {
            var last = window.performance.now(), deferTimer;
            // `no_trailing` defaults to false.
            if (typeof no_trailing !== "boolean") {
                no_trailing = false;
            }
            return function () {
                var now = window.performance.now();
                var elasped = now - last;
                var args = arguments;
                if (elasped < delay) {
                    if (no_trailing === false) {
                        // hold on to it
                        clearTimeout(deferTimer);
                        deferTimer = setTimeout(function () {
                            last = now;
                            return callback.apply(null, args);
                        }, elasped);
                    }
                }
                else {
                    last = now;
                    return callback.apply(null, args);
                }
            };
        };
    }

    if (typeof console === "undefined") {
        /**
         * Dummy console.log to avoid crash
         * in case the browser does not support it
         * @ignore
         */
        console = { // jshint ignore:line
            log : function () {},
            info : function () {},
            error : function () {
                alert(Array.prototype.slice.call(arguments).join(", "));
            }
        };
    }
 
})();

/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

/**
 * The built in Object object.
 * @external Object
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object|Object}
 */

if (!Object.defineProperty) {
    /**
     * simple defineProperty function definition (if not supported by the browser)<br>
     * if defineProperty is redefined, internally use __defineGetter__/__defineSetter__ as fallback
     * @param {Object} obj The object on which to define the property.
     * @param {string} prop The name of the property to be defined or modified.
     * @param {Object} desc The descriptor for the property being defined or modified.
     */
    Object.defineProperty = function (obj, prop, desc) {
        // check if Object support __defineGetter function
        if (obj.__defineGetter__) {
            if (desc.get) {
                obj.__defineGetter__(prop, desc.get);
            }
            if (desc.set) {
                obj.__defineSetter__(prop, desc.set);
            }
        } else {
            // we should never reach this point....
            throw new TypeError("Object.defineProperty not supported");
        }
    };
}

if (typeof Object.create !== "function") {
    /**
     * Prototypal Inheritance Create Helper
     * @name create
     * @memberOf external:Object#
     * @function
     * @param {Object} Object
     * @example
     * // declare oldObject
     * oldObject = new Object();
     * // make some crazy stuff with oldObject (adding functions, etc...)
     * ...
     * ...
     *
     * // make newObject inherits from oldObject
     * newObject = Object.create(oldObject);
     */
    Object.create = function (o) {
        var Fn = function () {};
        Fn.prototype = o;
        return new Fn();
    };
}

/**
 * The built in Function Object
 * @external Function
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function|Function}
 */

if (!Function.prototype.bind) {
    /** @ignore */
    var Empty = function () {};

    /**
     * Binds this function to the given context by wrapping it in another function and returning the wrapper.<p>
     * Whenever the resulting "bound" function is called, it will call the original ensuring that this is set to context. <p>
     * Also optionally curries arguments for the function.
     * @memberof! external:Function#
     * @alias bind
     * @param {Object} context the object to bind to.
     * @param {} [arguments...] Optional additional arguments to curry for the function.
     * @example
     * // Ensure that our callback is triggered with the right object context (this):
     * myObject.onComplete(this.callback.bind(this));
     */
    Function.prototype.bind = function bind(that) {
        // ECMAScript 5 compliant implementation
        // http://es5.github.com/#x15.3.4.5
        // from https://github.com/kriskowal/es5-shim
        var target = this;
        if (typeof target !== "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        var args = Array.prototype.slice.call(arguments, 1);
        var bound = function () {
            if (this instanceof bound) {
                var result = target.apply(this, args.concat(Array.prototype.slice.call(arguments)));
                if (Object(result) === result) {
                    return result;
                }
                return this;
            } else {
                return target.apply(that, args.concat(Array.prototype.slice.call(arguments)));
            }
        };
        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }
        return bound;
    };
}

/**
 * Sourced from: https://gist.github.com/parasyte/9712366
 * Extend a class prototype with the provided mixin descriptors.
 * Designed as a faster replacement for John Resig's Simple Inheritance.
 * @name extend
 * @memberOf external:Object#
 * @function
 * @param {Object[]} mixins... Each mixin is a dictionary of functions, or a
 * previously extended class whose methods will be applied to the target class
 * prototype.
 * @return {Object}
 * @example
 * var Person = Object.extend({
 *     "init" : function (isDancing) {
 *         this.dancing = isDancing;
 *     },
 *     "dance" : function () {
 *         return this.dancing;
 *     }
 * });
 *
 * var Ninja = Person.extend({
 *     "init" : function () {
 *         // Call the super constructor, passing a single argument
 *         Person.prototype.init.apply(this, [false]);
 *     },
 *     "dance" : function () {
 *         // Call the overridden dance() method
 *         return Person.prototype.dance.apply(this);
 *     },
 *     "swingSword" : function () {
 *         return true;
 *     }
 * });
 *
 * var Pirate = Person.extend(Ninja, {
 *     "init" : function () {
 *         // Call the super constructor, passing a single argument
 *         Person.prototype.init.apply(this, [true]);
 *     }
 * });
 *
 * var p = new Person(true);
 * console.log(p.dance()); // => true
 *
 * var n = new Ninja();
 * console.log(n.dance()); // => false
 * console.log(n.swingSword()); // => true
 *
 * var r = new Pirate();
 * console.log(r.dance()); // => true
 * console.log(r.swingSword()); // => true
 *
 * console.log(
 *     p instanceof Person &&
 *     n instanceof Ninja &&
 *     n instanceof Person &&
 *     r instanceof Pirate &&
 *     r instanceof Person
 * ); // => true
 *
 * console.log(r instanceof Ninja); // => false
 */
(function () {
    Object.defineProperty(Object.prototype, "extend", {
        "value" : function () {
            var methods = {};
            var mixins = Array.prototype.slice.call(arguments, 0);

            /**
             * The class constructor which calls the user `init` constructor.
             * @ignore
             */
            function Class() {
                // Call the user constructor
                this.init.apply(this, arguments);
                return this;
            }

            // Apply superClass
            Class.prototype = Object.create(this.prototype);

            // Apply all mixin methods to the class prototype
            mixins.forEach(function (mixin) {
                apply_methods(Class, methods, mixin.__methods__ || mixin);
            });

            // Verify constructor exists
            if (!("init" in Class.prototype)) {
                throw new TypeError(
                    "extend: Class is missing a constructor named `init`"
                );
            }

            // Apply syntactic sugar for accessing methods on super classes
            Object.defineProperty(Class.prototype, "_super", {
                "value" : _super
            });

            // Create a hidden property on the class itself
            // List of methods, used for applying classes as mixins
            Object.defineProperty(Class, "__methods__", {
                "value" : methods
            });

            return Class;
        }
    });

    /**
     * Apply methods to the class prototype.
     * @ignore
     */
    function apply_methods(Class, methods, descriptor) {
        Object.keys(descriptor).forEach(function (method) {
            methods[method] = descriptor[method];

            if (typeof(descriptor[method]) !== "function") {
                throw new TypeError(
                    "extend: Method `" + method + "` is not a function"
                );
            }

            Object.defineProperty(Class.prototype, method, {
                "configurable" : true,
                "value" : descriptor[method]
            });
        });
    }

    /**
     * Special method that acts as a proxy to the super class.
     * @name _super
     * @ignore
     */
    function _super(superClass, method, args) {
        return superClass.prototype[method].apply(this, args);
    }
})();

/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

/**
 * The built in Error object.
 * @external Error
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error|Error}
 */

/**
 * melonJS base class for exception handling.
 * @name Error
 * @memberOf me
 * @constructor
 * @param {String} msg Error message.
 */
me.Error = Error.extend({
    init : function (msg) {
        this.name = "me.Error";
        this.message = msg;
    }
});

/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

/**
 * Executes a function as soon as the interpreter is idle (stack empty).
 * @memberof! external:Function#
 * @alias defer
 * @param {Object} context The execution context of the deferred function.
 * @param {} [arguments...] Optional additional arguments to carry for the
 * function.
 * @return {Number} id that can be used to clear the deferred function using
 * clearTimeout
 * @example
 * // execute myFunc() when the stack is empty,
 * // with the current context and 'myArgument' as parameter
 * myFunc.defer(this, 'myArgument');
 */
Function.prototype.defer = function () {
    return setTimeout(this.bind.apply(this, arguments), 0.01);
};
/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

 /**
 * The built in Number Object
 * @external Number
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number|Number}
 */

/**
 * add a clamp fn to the Number object
 * @memberof! external:Number#
 * @alias clamp
 * @param {number} low lower limit
 * @param {number} high higher limit
 * @return {number} clamped value
 */
Number.prototype.clamp = function (low, high) {
    return this < low ? low : this > high ? high : +this;
};

/**
 * return a random integer between min, max (exclusive)
 * @memberof! external:Number#
 * @alias random
 * @param {number} [min=this] minimum value.
 * @param {number} max maximum value.
 * @return {number} random value
 * @example
 * // Print a random number; one of 5, 6, 7, 8, 9
 * console.log( (5).random(10) );
 * // Select a random array element
 * var ar = [ "foo", "bar", "baz" ];
 * console.log(ar[ (0).random(ar.length) ]);
 */
Number.prototype.random = function (min, max) {
    if (!max) {
        max = min;
        min = this;
    }
    return (~~(Math.random() * (max - min)) + min);
};

/**
 * return a random float between min, max (exclusive)
 * @memberof! external:Number#
 * @alias randomFloat
 * @param {number} [min=this] minimum value.
 * @param {number} max maximum value.
 * @return {number} random value
 * @example
 * // Print a random number; one of 5, 6, 7, 8, 9
 * console.log( (5).random(10) );
 * // Select a random array element
 * var ar = [ "foo", "bar", "baz" ];
 * console.log(ar[ (0).random(ar.length) ]);
 */
Number.prototype.randomFloat = function (min, max) {
    if (!max) {
        max = min;
        min = this;
    }
    return (Math.random() * (max - min)) + min;
};

/**
 * return a weighted random between min, max (exclusive)
 * favoring the lower numbers
 * @memberof! external:Number#
 * @alias weightedRandom
 * @param {number} [min=this] minimum value.
 * @param {number} max maximum value.
 * @return {number} random value
 * @example
 * // Print a random number; one of 5, 6, 7, 8, 9
 * console.log( (5).random(10) );
 * // Select a random array element
 * var ar = [ "foo", "bar", "baz" ];
 * console.log(ar[ (0).random(ar.length) ]);
 */
Number.prototype.weightedRandom = function (min, max) {
    if (!max) {
        max = min;
        min = this;
    }
    return (~~(Math.pow(Math.random(), 2) * (max - min)) + min);
};

/**
 * round a value to the specified number of digit
 * @memberof! external:Number#
 * @alias round
 * @param {number} [num=this] value to be rounded.
 * @param {number} dec number of decimal digit to be rounded to.
 * @return {number} rounded value
 * @example
 * // round a specific value to 2 digits
 * Number.prototype.round (10.33333, 2); // return 10.33
 * // round a float value to 4 digits
 * num = 10.3333333
 * num.round(4); // return 10.3333
 */
Number.prototype.round = function (num, dec) {
    // if only one argument use the object value
    num = (arguments.length < 2) ? this : num;
    var powres = Math.pow(10, dec || num || 0);
    return (~~(0.5 + num * powres) / powres);
};

/**
 * a quick toHex function<br>
 * given number <b>must</b> be an int, with a value between 0 and 255
 * @memberof! external:Number#
 * @alias toHex
 * @return {string} converted hexadecimal value
 */
Number.prototype.toHex = function () {
    return "0123456789ABCDEF".charAt((this - (this % 16)) >> 4) + "0123456789ABCDEF".charAt(this % 16);
};

/**
 * Returns a value indicating the sign of a number<br>
 * @memberof! external:Number#
 * @alias sign
 * @return {number} sign of a the number
 */
Number.prototype.sign = function () {
    return this < 0 ? -1 : (this > 0 ? 1 : 0);
};

/**
 * Converts an angle in degrees to an angle in radians
 * @memberof! external:Number#
 * @alias degToRad
 * @param {number} [angle="angle"] angle in degrees
 * @return {number} corresponding angle in radians
 * @example
 * // convert a specific angle
 * Number.prototype.degToRad (60); // return 1.0471...
 * // convert object value
 * var num = 60
 * num.degToRad(); // return 1.0471...
 */
Number.prototype.degToRad = function (angle) {
    return (angle || this) / 180.0 * Math.PI;
};

/**
 * Converts an angle in radians to an angle in degrees.
 * @memberof! external:Number#
 * @alias radToDeg
 * @param {number} [angle="angle"] angle in radians
 * @return {number} corresponding angle in degrees
 * @example
 * // convert a specific angle
 * Number.prototype.radToDeg (1.0471975511965976); // return 59.9999...
 * // convert object value
 * num = 1.0471975511965976
 * Math.ceil(num.radToDeg()); // return 60
 */
Number.prototype.radToDeg = function (angle) {
    return (angle || this) * (180.0 / Math.PI);
};

/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

/**
 * The built in String Object
 * @external String
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String|String}
 */
 
if (!String.prototype.trim) {
    /**
     * returns the string stripped of whitespace from both ends
     * @memberof! external:String#
     * @alias trim
     * @return {string} trimmed string
     */
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/gm, "");

    };
}

if (!String.prototype.trimLeft) {
    /**
     * returns the string stripped of whitespace from the left.
     * @memberof! external:String#
     * @alias trimLeft
     * @return {string} trimmed string
     */
    String.prototype.trimLeft = function () {
        return this.replace(/^\s+/, "");
    };
}

if (!String.prototype.trimRight) {
    /**
     * returns the string stripped of whitespace from the right.
     * @memberof! external:String#
     * @alias trimRight
     * @return {string} trimmed string
     */
    String.prototype.trimRight = function () {
        return this.replace(/\s+$/, "");
    };
}

/**
 * add isNumeric fn to the string object
 * @memberof! external:String#
 * @alias isNumeric
 * @return {boolean} true if string contains only digits
 */
String.prototype.isNumeric = function () {
    return (!isNaN(this) && this.trim() !== "");
};

/**
 * add a isBoolean fn to the string object
 * @memberof! external:String#
 * @alias isBoolean
 * @return {boolean} true if the string is either true or false
 */
String.prototype.isBoolean = function () {
    var trimmed = this.trim();
    return ("true" === trimmed) || ("false" === trimmed);
};

if (!String.prototype.contains) {
    /**
     * determines whether or not a string contains another string.
     * @memberof! external:String#
     * @alias contains
     * @param {string} str A string to be searched for within this string.
     * @param {number} [startIndex=0] The position in this string at which
     * to begin searching for given string.
     * @return {boolean} true if contains the specified string
     */
    String.prototype.contains = function (str, startIndex) {
        return -1 !== String.prototype.indexOf.call(this, str, startIndex);
    };
}

/**
 * convert the string to hex value
 * @memberof! external:String#
 * @alias toHex
 * @return {string}
 */
String.prototype.toHex = function () {
    var res = "", c = 0;
    while (c < this.length) {
        res += this.charCodeAt(c++).toString(16);
    }
    return res;
};

/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

/**
 * The built in Array Object
 * @external Array
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array|Array}
 */

/**
 * Remove the specified object from the Array<br>
 * @memberof! external:Array#
 * @alias remove
 * @param {Object} object to be removed
 */
Array.prototype.remove = function (obj) {
    var i = Array.prototype.indexOf.call(this, obj);
    if (i !== -1) {
        Array.prototype.splice.call(this, i, 1);
    }
    return this;
};

if (!Array.prototype.forEach) {
    /**
     * provide a replacement for browsers that don't
     * support Array.prototype.forEach (JS 1.6)
     * @ignore
     */
    Array.prototype.forEach = function (callback, scope) {
        for (var i = 0, j = this.length; j--; i++) {
            callback.call(scope || this, this[i], i, this);
        }
    };
}

if (!Array.isArray) {
    /**
     * provide a replacement for browsers that don't
     * natively support Array.isArray
     * @ignore
     */
    Array.isArray = function (vArg) {
        var isArray;
        isArray = vArg instanceof Array;
        return isArray;
    };
}

/**
 * return a random array element
 * @memberof! external:Array#
 * @alias random
 * @param {array} entry array to pick a element
 * @return {any} random member of array
 */
Array.prototype.random = function (entry) {
    return entry[(0).random(entry.length)];
};

/**
 * return a weighted random array element, favoring the earlier entries
 * @memberof! external:Array#
 * @alias weightedRandom
 * @param {array} entry array to pick a element
 * @return {any} random member of array
 */
Array.prototype.weightedRandom = function (entry) {
    return entry[(0).weightedRandom(entry.length)];
};

/**
 * A fake TypedArray object to be used for the TypedArray polyfills
 * @ignore
 */
me.TypedArray = function (a) {
    var i = 0;
    if (Array.isArray(a)) {
        for (i = 0; i < a.length; i++) {
            this.push(a[i]);
        }
    }
    else if ((arguments.length === 1) && (typeof(a) === "number")) {
        for (i = 0; i < a; i++) {
            this.push(0);
        }
    }
    else {
        throw new me.Error(
            "TypedArray polyfill: Unsupported constructor arguments",
            arguments
        );
    }
};
me.TypedArray.prototype = Array.prototype;

/**
 * The built in Float32Array object.
 * @external Float32Array
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Float32Array|Float32Array}
 */
window.Float32Array = window.Float32Array || me.TypedArray;

/**
 * The built in Uint16Array object.
 * @external Uint16Array
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Uint16Array|Uint16Array}
 */
window.Uint16Array = window.Uint16Array || me.TypedArray;

/**
 * The built in Uint32Array object.
 * @external Uint32Array
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Uint32Array|Uint32Array}
 */
window.Uint32Array = window.Uint32Array || me.TypedArray;

/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

// define window.performance if undefined
if (typeof window.performance === "undefined") {
    window.performance = {};
}

if (typeof Date.now === "undefined") {
    /**
     * provide a replacement for browser not
     * supporting Date.now (JS 1.5)
     * @ignore
     */
    Date.now = function () {
        return new Date().getTime();
    };
}

if (!window.performance.now) {
    var timeOffset = Date.now();

    if (window.performance.timing &&
        window.performance.timing.navigationStart) {
        timeOffset = window.performance.timing.navigationStart;
    }
    /**
     * provide a polyfill for window.performance now
     * to provide consistent time information across browser
     * (always return the elapsed time since the browser started)
     * @ignore
     */
    window.performance.now = function () {
        return Date.now() - timeOffset;
    };
}

/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

(function () {

    /**
     * me global references
     * @ignore
     */
    me.mod = "melonJS";
    me.version = "2.0.2";
    /**
     * global system settings and browser capabilities
     * @namespace
     */
    me.sys = {

        /*
         * Global settings
         */

        /**
         * Game FPS (default 60)
         * @type {number}
         * @memberOf me.sys
         */
        fps : 60,

        /**
         * enable/disable frame interpolation (default disable)<br>
         * @type {boolean}
         * @memberOf me.sys
         */
        interpolation : false,

        /**
         * Global scaling factor(default 1.0)
         * @type {me.Vector2d}
         * @memberOf me.sys
         */
        scale : null, //initialized by me.video.init

        /**
         * enable/disable video scaling interpolation (default disable)<br>
         * @type {boolean}
         * @memberOf me.sys
         */
        scalingInterpolation : false,

        /**
         * Global gravity settings <br>
         * will override entities init value if defined<br>
         * default value : undefined
         * @type {(number|undefined)}
         * @memberOf me.sys
         */
        gravity : undefined,

        /**
         * Specify either to stop on audio loading error or not<br>
         * if true, melonJS will throw an exception and stop loading<br>
         * if false, melonJS will disable sounds and output a warning message
         * in the console<br>
         * default value : true<br>
         * @type {boolean}
         * @memberOf me.sys
         */
        stopOnAudioError : true,

        /**
         * Specify whether to pause the game when losing focus.<br>
         * default value : true<br>
         * @type {boolean}
         * @memberOf me.sys
         */
        pauseOnBlur : true,

        /**
         * Specify whether to unpause the game when gaining focus.<br>
         * default value : true<br>
         * @type {boolean}
         * @memberOf me.sys
         */
        resumeOnFocus : true,

        /**
         * Specify whether to stop the game when losing focus or not<br>
         * The engine restarts on focus if this is enabled.
         * default value : false<br>
         * @type {boolean}
         * @memberOf me.sys
         */
        stopOnBlur : false,

        /**
         * Specify the rendering method for layers <br>
         * if false, visible part of the layers are rendered dynamically
         * (default)<br>
         * if true, the entire layers are first rendered into an offscreen
         * canvas<br>
         * the "best" rendering method depends of your game<br>
         * (amount of layer, layer size, amount of tiles per layer, etc…)<br>
         * note : rendering method is also configurable per layer by adding this
         * property to your layer (in Tiled)<br>
         * @type {boolean}
         * @memberOf me.sys
         */
        preRender : false,

        /*
         * System methods
         */

        /**
         * Compare two version strings
         * @public
         * @function
         * @param {string} first First version string to compare
         * @param {string} [second="2.0.2"] Second version string to compare
         * @return {number} comparison result <br>&lt; 0 : first &lt; second<br>
         * 0 : first == second<br>
         * &gt; 0 : first &gt; second
         * @example
         * if (me.sys.checkVersion("0.9.5") > 0) {
         *     console.error(
         *         "melonJS is too old. Expected: 0.9.5, Got: " + me.version
         *     );
         * }
         */
        checkVersion : function (first, second) {
            second = second || me.version;

            var a = first.split(".");
            var b = second.split(".");
            var len = Math.min(a.length, b.length);
            var result = 0;

            for (var i = 0; i < len; i++) {
                if ((result = +a[i] - +b[i])) {
                    break;
                }
            }

            return result ? result : a.length - b.length;
        }
    };
    
       // a flag to know if melonJS
    // is initialized
    var me_initialized = false;

    Object.defineProperty(me, "initialized", {
        get : function get() {
            return me_initialized;
        }
    });

    /*
     * initial boot function
     */

    me.boot = function () {
        // don't do anything if already initialized (should not happen anyway)
        if (me_initialized) {
            return;
        }

        // check the device capabilites
        me.device._check();

        // initialize me.save
        me.save._init();

        // enable/disable the cache
        me.loader.setNocache(
            document.location.href.match(/\?nocache/) || false
        );

        // init the FPS counter if needed
        me.timer.init();

        // create a new map reader instance
        me.mapReader = new me.TMXMapReader();

        // init the App Manager
        me.state.init();

        // init the Entity Pool
        me.pool.init();

        // automatically enable keyboard events if on desktop
        if (me.device.isMobile === false) {
            me.input._enableKeyboardEvent();
        }

        // init the level Director
        me.levelDirector.reset();

        me_initialized = true;
    };

})();

/**
 * MelonJS Game Engine
 * (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */

(function () {

    /**
     * me.game represents your current game, it contains all the objects,
     * tilemap layers, current viewport, collision map, etc...<br>
     * me.game is also responsible for updating (each frame) the object status
     * and draw them<br>
     * @namespace me.game
     * @memberOf me
     */
    me.game = (function () {
        // hold public stuff in our singleton
        var api = {};

        /*
         * PRIVATE STUFF
         */

        // flag to redraw the sprites
        var initialized = false;

        // to know when we have to refresh the display
        var isDirty = true;

        // frame counter for frameSkipping
        // reset the frame counter
        var frameCounter = 0;
        var frameRate = 1;

        // reference to the renderer object
        var renderer = null;

        /*
         * PUBLIC STUFF
         */

        /**
         * a reference to the game viewport.
         * @public
         * @type {me.Viewport}
         * @name viewport
         * @memberOf me.game
         */
        api.viewport = null;

        /**
         * a reference to the game current level
         * @public
         * @type {me.TMXTileMap}
         * @name currentLevel
         * @memberOf me.game
         */
        api.currentLevel = null;

        /**
         * a reference to the game world <br>
         * a world is a virtual environment containing all the game objects
         * @public
         * @type {me.Container}
         * @name world
         * @memberOf me.game
         */
        api.world = null;

        /**
         * when true, all objects will be added under the root world container<br>
         * when false, a `me.Container` object will be created for each
         * corresponding `TMXObjectGroup`
         * default value : true
         * @public
         * @type {boolean}
         * @name mergeGroup
         * @memberOf me.game
         */
        api.mergeGroup = true;

        /**
         * The property of should be used when sorting entities <br>
         * value : "x", "y", "z" (default: "z")
         * @public
         * @type {string}
         * @name sortOn
         * @memberOf me.game
         */
        api.sortOn = "z";

        /**
         * default layer tmxRenderer
         * @private
         * @ignore
         * @type {me.TMXRenderer}
         * @name tmxRenderer
         * @memberOf me.game
         */
        api.tmxRenderer = null;

        /**
         * Fired when a level is fully loaded and <br>
         * and all entities instantiated. <br>
         * Additionnaly the level id will also be passed
         * to the called function.
         * @public
         * @callback
         * @name onLevelLoaded
         * @memberOf me.game
         * @example
         * // call myFunction () everytime a level is loaded
         * me.game.onLevelLoaded = this.myFunction.bind(this);
         */
        api.onLevelLoaded = null;

        /**
         * Initialize the game manager
         * @name init
         * @memberOf me.game
         * @private
         * @ignore
         * @function
         * @param {Number} [width] width of the canvas
         * @param {Number} [height] width of the canvas
         * init function.
         */
        api.init = function (width, height) {
            if (!initialized) {
                // if no parameter specified use the system size
                width  = width  || me.video.renderer.getWidth();
                height = height || me.video.renderer.getHeight();

                // create a defaut viewport of the same size
                api.viewport = new me.Viewport(0, 0, width, height);

                //the root object of our world is an entity container
                api.world = new me.Container(0, 0, width, height);
                // give it a name
                api.world.name = "rootContainer";

                // initialize the collision system (the quadTree mostly)
                me.collision.init();

                renderer = me.video.renderer;

                // publish init notification
                me.event.publish(me.event.GAME_INIT);

                // translate global pointer events
                me.input._translatePointerEvents();

                // make display dirty by default
                isDirty = true;

                // dummy current level
                api.currentLevel = {
                    pos : {
                        x : 0,
                        y : 0
                    }
                };

                // set as initialized
                initialized = true;
            }
        };

        /**
         * reset the game Object manager<p>
         * destroy all current objects
         * @name reset
         * @memberOf me.game
         * @public
         * @function
         */
        api.reset = function () {

            // clear the quadtree
            me.collision.quadTree.clear();

            // remove all objects
            api.world.destroy();

            // reset the viewport to zero ?
            if (api.viewport) {
                api.viewport.reset();
            }
            // dummy current level
            api.currentLevel = {
                pos : {
                    x : 0,
                    y : 0
                }
            };

            // reset the transform matrix to the normal one
            renderer.resetTransform();

            // reset the frame counter
            frameCounter = 0;
            frameRate = ~~(0.5 + 60 / me.sys.fps);
        };

        /**
         * Returns the parent container of the specified Child in the game world
         * @name getParentContainer
         * @memberOf me.game
         * @function
         * @param {me.Renderable} child
         * @return {me.Container}
         */
        api.getParentContainer = function (child) {
            return child.ancestor;
        };

        /**
         * force the redraw (not update) of all objects
         * @name repaint
         * @memberOf me.game
         * @public
         * @function
         */

        api.repaint = function () {
            isDirty = true;
        };


        /**
         * update all objects of the game manager
         * @name update
         * @memberOf me.game
         * @private
         * @ignore
         * @function
         * @param {Number} time current timestamp as provided by the RAF callback
         */
        api.update = function (time) {
            // handle frame skipping if required
            if ((++frameCounter % frameRate) === 0) {
                // reset the frame counter
                frameCounter = 0;

                // update the timer
                me.timer.update(time);

                // clear the quadtree
                me.collision.quadTree.clear();

                // insert the world container (children) into the quadtree
                me.collision.quadTree.insertContainer(api.world);

                // update all objects (and pass the elapsed time since last frame)
                isDirty = api.world.update(me.timer.getDelta()) || isDirty;

                // update the camera/viewport
                isDirty = api.viewport.update(me.timer.getDelta()) || isDirty;
            }
        };

        /**
         * draw all existing objects
         * @name draw
         * @memberOf me.game
         * @private
         * @ignore
         * @function
         */
        api.draw = function () {
            if (isDirty) {
                // cache the viewport rendering position, so that other object
                // can access it later (e,g. entityContainer when drawing floating objects)
                var translateX = api.viewport.pos.x + ~~api.viewport.offset.x;
                var translateY = api.viewport.pos.y + ~~api.viewport.offset.y;

                // translate the world coordinates by default to screen coordinates
                api.world.transform.translate(-translateX, -translateY);

                // substract the map offset to current the current pos
                api.viewport.screenX = translateX - api.currentLevel.pos.x;
                api.viewport.screenY = translateY - api.currentLevel.pos.y;

                // update all objects,
                // specifying the viewport as the rectangle area to redraw
                api.world.draw(renderer, api.viewport);

                // translate back
                api.world.transform.translate(translateX, translateY);

                // draw our camera/viewport
                api.viewport.draw(renderer);
            }

            isDirty = false;

            // blit our frame
            me.video.renderer.blitSurface();
        };

        // return our object
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, Olivier Biot, Jason Oster
 * http://www.melonjs.org/
 *
 */
(function () {
    /**
     * Convert first character of a string to uppercase, if it's a letter.
     * @ignore
     * @function
     * @name capitalize
     * @param  {String} str Input string.
     * @return {String} String with first letter made uppercase.
     */
    var capitalize = function (str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1, str.length);
    };

    /**
     * A collection of utilities to ease porting between different user agents.
     * @namespace me.agent
     * @memberOf me
     */
    me.agent = (function () {
        var api = {};

        /**
         * Known agent vendors
         * @ignore
         */
        var vendors = [ "ms", "MS", "moz", "webkit", "o" ];

        /**
         * Get a vendor-prefixed property
         * @public
         * @name prefixed
         * @function
         * @param {String} name Property name
         * @param {Object} [obj=window] Object or element reference to access
         * @return {Mixed} Value of property
         * @memberOf me.agent
         */
        api.prefixed = function (name, obj) {
            obj = obj || window;
            if (name in obj) {
                return obj[name];
            }

            var uc_name = capitalize(name);

            var result;
            vendors.some(function (vendor) {
                var name = vendor + uc_name;
                return (result = (name in obj) ? obj[name] : undefined);
            });
            return result;
        };

        /**
         * Set a vendor-prefixed property
         * @public
         * @name setPrefixed
         * @function
         * @param {String} name Property name
         * @param {Mixed} value Property value
         * @param {Object} [obj=window] Object or element reference to access
         * @memberOf me.agent
         */
        api.setPrefixed = function (name, value, obj) {
            obj = obj || window;
            if (name in obj) {
                obj[name] = value;
                return;
            }

            var uc_name = capitalize(name);

            vendors.some(function (vendor) {
                var name = vendor + uc_name;
                if (name in obj) {
                    obj[name] = value;
                    return true;
                }
                return false;
            });
        };

        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013 melonJS
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * A singleton object representing the device capabilities and specific events
     * @namespace me.device
     * @memberOf me
     */
    me.device = (function () {
        // defines object for holding public information/functionality.
        var api = {};
        // private properties
        var accelInitialized = false;
        var deviceOrientationInitialized = false;
        var devicePixelRatio = null;

        /**
         * check the device capapbilities
         * @ignore
         */
        api._check = function () {

            // detect device type/platform
            me.device._detectDevice();

            // future proofing (MS) feature detection
            me.device.pointerEnabled = me.agent.prefixed("pointerEnabled", navigator);
            navigator.maxTouchPoints = me.agent.prefixed("maxTouchPoints", navigator) || 0;
            window.gesture = me.agent.prefixed("gesture");

            // detect touch capabilities
            me.device.touch = ("createTouch" in document) || ("ontouchstart" in window) ||
                              (navigator.isCocoonJS) || (me.device.pointerEnabled && (navigator.maxTouchPoints > 0));

            // accelerometer detection
            me.device.hasAccelerometer = (
                (typeof (window.DeviceMotionEvent) !== "undefined") || (
                    (typeof (window.Windows) !== "undefined") &&
                    (typeof (Windows.Devices.Sensors.Accelerometer) === "function")
                )
            );

            // pointerlock detection
            this.hasPointerLockSupport = me.agent.prefixed("pointerLockElement", document);

            if (this.hasPointerLockSupport) {
                document.exitPointerLock = me.agent.prefixed("exitPointerLock", document);
            }

            // device motion detection
            if (window.DeviceOrientationEvent) {
                me.device.hasDeviceOrientation = true;
            }

            // fullscreen api detection & polyfill when possible
            this.hasFullscreenSupport = me.agent.prefixed("fullscreenEnabled", document) ||
                                        document.mozFullScreenEnabled;

            document.exitFullscreen = me.agent.prefixed("cancelFullScreen", document) ||
                                      me.agent.prefixed("exitFullscreen", document);

            // vibration API poyfill
            navigator.vibrate = me.agent.prefixed("vibrate", navigator);

            try {
                api.localStorage = !!window.localStorage;
            } catch (e) {
                // the above generates an exception when cookies are blocked
                api.localStorage = false;
            }

            // set pause/stop action on losing focus
            window.addEventListener("blur", function () {
                if (me.sys.stopOnBlur) {
                    me.state.stop(true);
                }
                if (me.sys.pauseOnBlur) {
                    me.state.pause(true);
                }
            }, false);
            // set restart/resume action on gaining focus
            window.addEventListener("focus", function () {
                if (me.sys.stopOnBlur) {
                    me.state.restart(true);
                }
                if (me.sys.resumeOnFocus) {
                    me.state.resume(true);
                }
            }, false);


            // Set the name of the hidden property and the change event for visibility
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                // Opera 12.10 and Firefox 18 and later support
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }

            // register on the event if supported
            if (typeof (visibilityChange) === "string") {
                // add the corresponding event listener
                document.addEventListener(visibilityChange,
                    function () {
                        if (document[hidden]) {
                            if (me.sys.stopOnBlur) {
                                me.state.stop(true);
                            }
                            if (me.sys.pauseOnBlur) {
                                me.state.pause(true);
                            }
                        } else {
                            if (me.sys.stopOnBlur) {
                                me.state.restart(true);
                            }
                            if (me.sys.resumeOnFocus) {
                                me.state.resume(true);
                            }
                        }
                    }, false
                );
            }
        };

        /**
         * detect the device type
         * @ignore
         */
        api._detectDevice = function () {
            // iOS Device ?
            me.device.iOS = me.device.ua.match(/iPhone|iPad|iPod/i) || false;
            // Android Device ?
            me.device.android = me.device.ua.match(/Android/i) || false;
            me.device.android2 = me.device.ua.match(/Android 2/i) || false;
            // Windows Device ?
            me.device.wp = me.device.ua.match(/Windows Phone/i) || false;
            // Kindle device ?
            me.device.BlackBerry = me.device.ua.match(/BlackBerry/i) || false;
            // Kindle device ?
            me.device.Kindle = me.device.ua.match(/Kindle|Silk.*Mobile Safari/i) || false;

             // Mobile platform
            me.device.isMobile = me.device.ua.match(/Mobi/i) ||
                                 me.device.iOS ||
                                 me.device.android ||
                                 me.device.wp ||
                                 me.device.BlackBerry ||
                                 me.device.Kindle ||
                                 me.device.iOS || false;
        };

        /*
         * PUBLIC Properties & Functions
         */

        // Browser capabilities

        /**
         * Browser User Agent
         * @type Boolean
         * @readonly
         * @name ua
         * @memberOf me.device
         */
        api.ua = navigator.userAgent;

        /**
         * Browser Local Storage capabilities <br>
         * (this flag will be set to false if cookies are blocked)
         * @type Boolean
         * @readonly
         * @name localStorage
         * @memberOf me.device
         */
        api.localStorage = false;

        /**
         * Browser accelerometer capabilities
         * @type Boolean
         * @readonly
         * @name hasAccelerometer
         * @memberOf me.device
         */
        api.hasAccelerometer = false;

        /**
         * Browser device orientation
         * @type Boolean
         * @readonly
         * @name hasDeviceOrientation
         * @memberOf me.device
         */
        api.hasDeviceOrientation = false;

        /**
         * Browser full screen support
         * @type Boolean
         * @readonly
         * @name hasFullscreenSupport
         * @memberOf me.device
         */
        api.hasFullscreenSupport = false;

         /**
         * Browser pointerlock api support
         * @type Boolean
         * @readonly
         * @name hasPointerLockSupport
         * @memberOf me.device
         */
        api.hasPointerLockSupport = false;

        /**
         * Browser Base64 decoding capability
         * @type Boolean
         * @readonly
         * @name nativeBase64
         * @memberOf me.device
         */
        api.nativeBase64 = (typeof(window.atob) === "function");

        /**
         * Touch capabilities
         * @type Boolean
         * @readonly
         * @name touch
         * @memberOf me.device
         */
        api.touch = false;

        /**
         * equals to true if a mobile device <br>
         * (Android | iPhone | iPad | iPod | BlackBerry | Windows Phone | Kindle)
         * @type Boolean
         * @readonly
         * @name isMobile
         * @memberOf me.device
         */
        api.isMobile = false;

        /**
         * equals to true if the device is an iOS platform <br>
         * @type Boolean
         * @readonly
         * @name iOS
         * @memberOf me.device
         */
        api.iOS = false;

        /**
         * equals to true if the device is an Android platform <br>
         * @type Boolean
         * @readonly
         * @name android
         * @memberOf me.device
         */
        api.android = false;

        /**
         * equals to true if the device is an Android 2.x platform <br>
         * @type Boolean
         * @readonly
         * @name android2
         * @memberOf me.device
         */
        api.android2 = false;

         /**
         * equals to true if the device is a Windows Phone platform <br>
         * @type Boolean
         * @readonly
         * @name wp
         * @memberOf me.device
         */
        api.wp = false;

        /**
         * equals to true if the device is a BlackBerry platform <br>
         * @type Boolean
         * @readonly
         * @name BlackBerry
         * @memberOf me.device
         */
        api.BlackBerry = false;

        /**
         * equals to true if the device is a Kindle platform <br>
         * @type Boolean
         * @readonly
         * @name Kindle
         * @memberOf me.device
         */
        api.Kindle = false;

        /**
         * The device current orientation status. <br>
         *   0 : default orientation<br>
         *  90 : 90 degrees clockwise from default<br>
         * -90 : 90 degrees anti-clockwise from default<br>
         * 180 : 180 degrees from default
         * @type Number
         * @readonly
         * @name orientation
         * @memberOf me.device
         */
        api.orientation = 0;

        /**
         * contains the g-force acceleration along the x-axis.
         * @public
         * @type Number
         * @readonly
         * @name accelerationX
         * @memberOf me.device
         */
        api.accelerationX = 0;

        /**
         * contains the g-force acceleration along the y-axis.
         * @public
         * @type Number
         * @readonly
         * @name accelerationY
         * @memberOf me.device
         */
        api.accelerationY = 0;

        /**
         * contains the g-force acceleration along the z-axis.
         * @public
         * @type Number
         * @readonly
         * @name accelerationZ
         * @memberOf me.device
         */
        api.accelerationZ = 0;

        /**
         * Device orientation Gamma property. Gives angle on tilting a portrait held phone left or right
         * @public
         * @type Number
         * @readonly
         * @name gamma
         * @memberOf me.device
         */
        api.gamma = 0;

        /**
         * Device orientation Beta property. Gives angle on tilting a portrait held phone forward or backward
         * @public
         * @type Number
         * @readonly
         * @name beta
         * @memberOf me.device
         */
        api.beta = 0;

        /**
         * Device orientation Alpha property. Gives angle based on the rotation of the phone around its z axis.
         * The z-axis is perpendicular to the phone, facing out from the center of the screen.
         * @public
         * @type Number
         * @readonly
         * @name alpha
         * @memberOf me.device
         */
        api.alpha = 0;

        /**
         * Triggers a fullscreen request. Requires fullscreen support from the browser/device.
         * @name requestFullscreen
         * @memberOf me.device
         * @function
         * @param {Object} [element=default canvas object] the element to be set in full-screen mode.
         * @example
         * // add a keyboard shortcut to toggle Fullscreen mode on/off
         * me.input.bindKey(me.input.KEY.F, "toggleFullscreen");
         * me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
         *    // toggle fullscreen on/off
         *    if (action === "toggleFullscreen") {
         *       if (!me.device.isFullscreen) {
         *          me.device.requestFullscreen();
         *       } else {
         *          me.device.exitFullscreen();
         *       }
         *    }
         * });
         */
        api.requestFullscreen = function (element) {
            if (this.hasFullscreenSupport) {
                element = element || me.video.getWrapper();
                element.requestFullscreen = me.agent.prefixed("requestFullscreen", element) ||
                                            element.mozRequestFullScreen;

                element.requestFullscreen();
            }
        };

        /**
         * Exit fullscreen mode. Requires fullscreen support from the browser/device.
         * @name exitFullscreen
         * @memberOf me.device
         * @function
         */
        api.exitFullscreen = function () {
            if (this.hasFullscreenSupport) {
                document.exitFullscreen();
            }
        };

        /**
         * return the device pixel ratio
         * @name getPixelRatio
         * @memberOf me.device
         * @function
         */
        api.getPixelRatio = function () {

            if (devicePixelRatio === null) {
                var _context;
                if (typeof me.video.renderer !== "undefined") {
                    _context = me.video.renderer.getScreenContext();
                } else {
                    _context = me.CanvasRenderer.getContext2d(document.createElement("canvas"));
                }
                var _devicePixelRatio = window.devicePixelRatio || 1,
                    _backingStoreRatio = me.agent.prefixed("backingStorePixelRatio", _context) || 1;
                devicePixelRatio = _devicePixelRatio / _backingStoreRatio;
            }
            return devicePixelRatio;
        };

        /**
         * return the device storage
         * @name getStorage
         * @memberOf me.device
         * @function
         * @param {String} [type="local"]
         * @return me.save object
         */
        api.getStorage = function (type) {

            type = type || "local";

            switch (type) {
                case "local" :
                    return me.save;

                default :
                    throw new me.Error("storage type " + type + " not supported");
            }
        };

        /**
         * event management (Accelerometer)
         * http://www.mobilexweb.com/samples/ball.html
         * http://www.mobilexweb.com/blog/safari-ios-accelerometer-websockets-html5
         * @ignore
         */
        function onDeviceMotion(e) {
            if (e.reading) {
                // For Windows 8 devices
                api.accelerationX = e.reading.accelerationX;
                api.accelerationY = e.reading.accelerationY;
                api.accelerationZ = e.reading.accelerationZ;
            }
            else {
                // Accelerometer information
                api.accelerationX = e.accelerationIncludingGravity.x;
                api.accelerationY = e.accelerationIncludingGravity.y;
                api.accelerationZ = e.accelerationIncludingGravity.z;
            }
        }

        function onDeviceRotate(e) {
            api.gamma = e.gamma;
            api.beta = e.beta;
            api.alpha = e.alpha;
        }

        /**
         * Enters pointer lock, requesting it from the user first. Works on supported devices & browsers
         * Must be called in a click event or an event that requires user interaction.
         * If you need to run handle events for errors or change of the pointer lock, see below.
         * @name turnOnPointerLock
         * @memberOf me.device
         * @function
         * @example
         * document.addEventListener("pointerlockchange", pointerlockchange, false);
         * document.addEventListener("mozpointerlockchange", pointerlockchange, false);
         * document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
         *
         * document.addEventListener("pointerlockerror", pointerlockerror, false);
         * document.addEventListener("mozpointerlockerror", pointerlockerror, false);
         * document.addEventListener("webkitpointerlockerror", pointerlockerror, false);
         */
        api.turnOnPointerLock = function () {
            if (this.hasPointerLockSupport) {
                var element = me.video.getWrapper();
                if (me.device.ua.match(/Firefox/i)) {
                    var fullscreenchange = function () {
                        if ((me.agent.prefixed("fullscreenElement", document) ||
                            document.mozFullScreenElement) === element) {

                            document.removeEventListener("fullscreenchange", fullscreenchange);
                            document.removeEventListener("mozfullscreenchange", fullscreenchange);
                            element.requestPointerLock = me.agent.prefixed("requestPointerLock", element);
                            element.requestPointerLock();
                        }
                    };

                    document.addEventListener("fullscreenchange", fullscreenchange, false);
                    document.addEventListener("mozfullscreenchange", fullscreenchange, false);

                    me.device.requestFullscreen();

                }
                else {
                    element.requestPointerLock();
                }
            }
        };

        /**
         * Exits pointer lock. Works on supported devices & browsers
         * @name turnOffPointerLock
         * @memberOf me.device
         * @function
         */
        api.turnOffPointerLock = function () {
            if (this.hasPointerLockSupport) {
                document.exitPointerLock();
            }
        };

        /**
         * watch Accelerator event
         * @name watchAccelerometer
         * @memberOf me.device
         * @public
         * @function
         * @return {Boolean} false if not supported by the device
         */
        api.watchAccelerometer = function () {
            if (me.device.hasAccelerometer) {
                if (!accelInitialized) {
                    if (typeof Windows === "undefined") {
                        // add a listener for the devicemotion event
                        window.addEventListener("devicemotion", onDeviceMotion, false);
                    }
                    else {
                        // On Windows 8 Device
                        var accelerometer = Windows.Devices.Sensors.Accelerometer.getDefault();
                        if (accelerometer) {
                            // Capture event at regular intervals
                            var minInterval = accelerometer.minimumReportInterval;
                            var Interval = minInterval >= 16 ? minInterval : 25;
                            accelerometer.reportInterval = Interval;

                            accelerometer.addEventListener("readingchanged", onDeviceMotion, false);
                        }
                    }
                    accelInitialized = true;
                }
                return true;
            }
            return false;
        };

        /**
         * unwatch Accelerometor event
         * @name unwatchAccelerometer
         * @memberOf me.device
         * @public
         * @function
         */
        api.unwatchAccelerometer = function () {
            if (accelInitialized) {
                if (typeof Windows === "undefined") {
                    // add a listener for the mouse
                    window.removeEventListener("devicemotion", onDeviceMotion, false);
                } else {
                    // On Windows 8 Devices
                    var accelerometer = Windows.Device.Sensors.Accelerometer.getDefault();

                    accelerometer.removeEventListener("readingchanged", onDeviceMotion, false);
                }
                accelInitialized = false;
            }
        };

        /**
         * watch the device orientation event
         * @name watchDeviceOrientation
         * @memberOf me.device
         * @public
         * @function
         * @return {Boolean} false if not supported by the device
         */
        api.watchDeviceOrientation = function () {
            if (me.device.hasDeviceOrientation && !deviceOrientationInitialized) {
                window.addEventListener("deviceorientation", onDeviceRotate, false);
                deviceOrientationInitialized = true;
            }
            return false;
        };

        /**
         * unwatch Device orientation event
         * @name unwatchDeviceOrientation
         * @memberOf me.device
         * @public
         * @function
         */
        api.unwatchDeviceOrientation = function () {
            if (deviceOrientationInitialized) {
                window.removeEventListener("deviceorientation", onDeviceRotate, false);
                deviceOrientationInitialized = false;
            }
        };

        /**
         * the vibrate method pulses the vibration hardware on the device, <br>
         * If the device doesn't support vibration, this method has no effect. <br>
         * If a vibration pattern is already in progress when this method is called,
         * the previous pattern is halted and the new one begins instead.
         * @name vibrate
         * @memberOf me.device
         * @public
         * @function
         * @param {Number|Number[]} pattern pattern of vibration and pause intervals
         * @example
         * // vibrate for 1000 ms
         * navigator.vibrate(1000);
         * // or alternatively
         * navigator.vibrate([1000]);
         * vibrate for 50 ms, be still for 100 ms, and then vibrate for 150 ms:
         * navigator.vibrate([50, 100, 150]);
         * // cancel any existing vibrations
         * navigator.vibrate(0);
         */
        api.vibrate = function (pattern) {
            if (navigator.vibrate) {
                navigator.vibrate(pattern);
            }
        };


        return api;
    })();

    /**
     * Returns true if the browser/device is in full screen mode.
     * @name isFullscreen
     * @memberOf me.device
     * @public
     * @type Boolean
     * @readonly
     * @return {boolean}
     */
    Object.defineProperty(me.device, "isFullscreen", {
        get: function () {
            if (me.device.hasFullscreenSupport) {
                var el = me.agent.prefixed("fullscreenElement", document) ||
                         document.mozFullScreenElement;
                return (el === me.video.getWrapper());
            } else {
                return false;
            }
        }
    });

    /**
     * Returns true if the browser/device has audio capabilities.
     * @name sound
     * @memberOf me.device
     * @public
     * @type Boolean
     * @readonly
     * @return {boolean}
     */
    Object.defineProperty(me.device, "sound", {
        get: function () {
                return !Howler.noAudio;
            }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013 melonJS
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a Timer object to manage time function (FPS, Game Tick, Time...)<p>
     * There is no constructor function for me.timer
     * @namespace me.timer
     * @memberOf me
     */
    me.timer = (function () {
        // hold public stuff in our api
        var api = {};

        /*
         * PRIVATE STUFF
         */

        //hold element to display fps
        var framecount = 0;
        var framedelta = 0;

        /* fps count stuff */
        var last = 0;
        var now = 0;
        var delta = 0;
        var step = Math.ceil(1000 / me.sys.fps); // ROUND IT ?
        // define some step with some margin
        var minstep = (1000 / me.sys.fps) * 1.25; // IS IT NECESSARY?\

        // list of defined timer function
        var timers = [];
        var timerId = 0;

        /**
         * @ignore
         */
        var clearTimer = function (timerId) {
            for (var i = 0, len = timers.length; i < len; i++) {
                if (timers[i].timerId === timerId) {
                    timers.splice(i, 1);
                    break;
                }
            }
        };

        /**
         * update timers
         * @ignore
         */
        var updateTimers = function (dt) {
            for (var i = 0, len = timers.length; i < len; i++) {
                var _timer = timers[i];
                if (!(_timer.pauseable && me.state.isPaused())) {
                    _timer.elapsed += dt;
                }
                if (_timer.elapsed >= _timer.delay) {
                    _timer.func.apply(this);
                    if (_timer.repeat === true) {
                        _timer.elapsed -= _timer.delay;
                    } else {
                        me.timer.clearTimeout(_timer.timerId);
                    }
                }
            }
        };

        /*
         * PUBLIC STUFF
         */

        /**
         * last game tick value
         * @public
         * @type Int
         * @name tick
         * @memberOf me.timer
         */
        api.tick = 1.0;

        /**
         * last measured fps rate
         * @public
         * @type Int
         * @name fps
         * @memberOf me.timer
         */
        api.fps = 0;

        /**
         * init the timer
         * @ignore
         */
        api.init = function () {
            // reset variables to initial state
            api.reset();
            now = last = 0;
        };

        /**
         * reset time (e.g. usefull in case of pause)
         * @name reset
         * @memberOf me.timer
         * @ignore
         * @function
         */
        api.reset = function () {
            // set to "now"
            last = now = window.performance.now();
            delta = 0;
            // reset delta counting variables
            framedelta = 0;
            framecount = 0;
        };

        /**
         * Calls a function once after a specified delay.
         * @name setTimeout
         * @memberOf me.timer
         * @param {Function} func the function you want to execute after delay milliseconds.
         * @param {Function} delay the number of milliseconds (thousandths of a second) that the function call should be delayed by.
         * @param {Boolean} [pauseable = true] respects the pause state of the engine.
         * @return {Number}  timeoutID the numerical ID of the timeout, which can be used later with me.timer.clearTimeout().
         * @function
         */
        api.setTimeout = function (func, delay, pauseable) {
            timers.push({
                func: func,
                delay : delay,
                elapsed : 0,
                repeat : false,
                timerId : ++timerId,
                pauseable : pauseable === true || true
            });
            return timerId;
        };

        /**
         * Calls a function at specified interval.
         * @name setInterval
         * @memberOf me.timer
         * @param {Function} func the function to execute
         * @param {Function} delay the number of milliseconds (thousandths of a second) on how often to execute the function
         * @param {Boolean} [pauseable = true] respects the pause state of the engine.
         * @return {Number} intervalID the numerical ID of the timeout, which can be used later with me.timer.clearInterval().
         * @function
         */
        api.setInterval = function (func, delay, pauseable) {
            timers.push({
                func: func,
                delay : delay,
                elapsed : 0,
                repeat : true,
                timerId : ++timerId,
                pauseable : pauseable === true || true
            });
            return timerId;
        };

        /**
         * Clears the delay set by me.timer.setTimeout().
         * @name clearTimeout
         * @memberOf me.timer
         * @function
         * @param {Number}  timeoutID ID of the timeout to be cleared
         */
        api.clearTimeout = function (timeoutID) {
            clearTimer.defer(this, timeoutID);
        };

        /**
         * Clears the Interval set by me.timer.setInterval().
         * @name clearInterval
         * @memberOf me.timer
         * @function
         * @param {Number} intervalID ID of the interval to be cleared
         */
        api.clearInterval = function (intervalID) {
            clearTimer.defer(this, intervalID);
        };

        /**
         * Return the current timestamp in milliseconds <br>
         * since the game has started or since linux epoch (based on browser support for High Resolution Timer)
         * @name getTime
         * @memberOf me.timer
         * @return {Number}
         * @function
         */
        api.getTime = function () {
            return now;
        };

        /**
         * Return elapsed time in milliseconds since the last update<br>
         * @name getDelta
         * @memberOf me.timer
         * @return {Number}
         * @function
         */
        api.getDelta = function () {

            return delta;
        };

        /**
         * compute the actual frame time and fps rate
         * @name computeFPS
         * @ignore
         * @memberOf me.timer
         * @function
         */
        api.countFPS = function () {
            framecount++;
            framedelta += delta;
            if (framecount % 10 === 0) {
                this.fps = (~~((1000 * framecount) / framedelta)).clamp(0, me.sys.fps);
                framedelta = 0;
                framecount = 0;
            }
        };

        /**
         * update game tick
         * should be called once a frame
         * @param {Number} time current timestamp as provided by the RAF callback
         * @return {Number} time elapsed since the last update
         * @ignore
         */
        api.update = function (time) {

            last = now;

            now = time;

            delta = (now - last);

            // get the game tick
            api.tick = (delta > minstep && me.sys.interpolation) ? delta / step : 1;

            // update defined timers
            updateTimers(delta);

            return delta;
        };

        // return our apiect
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier Biot
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * A pool of Object entity <br>
     * This object is used for object pooling - a technique that might speed up your game
     * if used properly. <br>
     * If some of your classes will be instantiated and removed a lot at a time, it is a
     * good idea to add the class to this entity pool. A separate pool for that class
     * will be created, which will reuse objects of the class. That way they won't be instantiated
     * each time you need a new one (slowing your game), but stored into that pool and taking one
     * already instantiated when you need it.<br><br>
     * This object is also used by the engine to instantiate objects defined in the map,
     * which means, that on level loading the engine will try to instantiate every object
     * found in the map, based on the user defined name in each Object Properties<br>
     * <img src="images/object_properties.png"/><br>
     * @namespace me.pool
     * @memberOf me
     */
    me.pool = (function () {
        // hold public stuff in our singleton
        var api = {};

        var entityClass = {};

        /*
         * PUBLIC STUFF
         */

        /**
         * Constructor
         * @ignore
         */
        api.init = function () {
            // add default entity object
            api.register("me.Entity", me.Entity);
            api.register("me.CollectableEntity", me.CollectableEntity);
            api.register("me.LevelEntity", me.LevelEntity);
            api.register("TileObject", me.Sprite);
            api.register("me.Tween", me.Tween, true);
            api.register("me.Color", me.Color, true);
            api.register("me.Particle", me.Particle, true);
        };

        /**
         * register an object to the pool. <br>
         * Pooling must be set to true if more than one such objects will be created. <br>
         * (note) If pooling is enabled, you shouldn't instantiate objects with `new`.
         * See examples in {@link me.pool#pull}
         * @name register
         * @memberOf me.pool
         * @public
         * @function
         * @param {String} className as defined in the Name field of the Object Properties (in Tiled)
         * @param {Object} class corresponding Class to be instantiated
         * @param {Boolean} [objectPooling=false] enables object pooling for the specified class
         * - speeds up the game by reusing existing objects
         * @example
         * // add our users defined entities in the entity pool
         * me.pool.register("playerspawnpoint", PlayerEntity);
         * me.pool.register("cherryentity", CherryEntity, true);
         * me.pool.register("heartentity", HeartEntity, true);
         * me.pool.register("starentity", StarEntity, true);
         */
        api.register = function (className, entityObj, pooling) {
            if (!pooling) {
                entityClass[className.toLowerCase()] = {
                    "class" : entityObj,
                    "pool" : undefined
                };
                return;
            }

            entityClass[className.toLowerCase()] = {
                "class" : entityObj,
                "pool" : []
            };
        };

        /**
         * Pull a new instance of the requested object (if added into the object pool)
         * @name pull
         * @memberOf me.pool
         * @public
         * @function
         * @param {String} className as used in {@link me.pool#register}
         * @param {} [arguments...] arguments to be passed when instantiating/reinitializing the object
         * @example
         * me.pool.register("player", PlayerEntity);
         * var player = me.pool.pull("player");
         * @example
         * me.pool.register("bullet", BulletEntity, true);
         * me.pool.register("enemy", EnemyEntity, true);
         * // ...
         * // when we need to manually create a new bullet:
         * var bullet = me.pool.pull("bullet", x, y, direction);
         * // ...
         * // params aren't a fixed number
         * // when we need new enemy we can add more params, that the object construct requires:
         * var enemy = me.pool.pull("enemy", x, y, direction, speed, power, life);
         * // ...
         * // when we want to destroy existing object, the remove
         * // function will ensure the object can then be reallocated later
         * me.game.world.removeChild(enemy);
         * me.game.world.removeChild(bullet);
         */
        api.pull = function (data) {
            var name = typeof data === "string" ? data.toLowerCase() : undefined;
            var args = Array.prototype.slice.call(arguments);
            if (name && entityClass[name]) {
                var proto;
                if (!entityClass[name].pool) {
                    proto = entityClass[name]["class"];
                    args[0] = proto;
                    return new (proto.bind.apply(proto, args))();
                }

                var obj, entity = entityClass[name];
                proto = entity["class"];
                if (entity.pool.length > 0) {
                    obj = entity.pool.pop();
                    // call the object init function if defined (JR's Inheritance)
                    if (typeof obj.init === "function") {
                        obj.init.apply(obj, args.slice(1));
                    }
                    // call the object onResetEvent function if defined
                    if (typeof obj.onResetEvent === "function") {
                        obj.onResetEvent.apply(obj, args.slice(1));
                    }
                }
                else {
                    args[0] = proto;
                    obj = new (proto.bind.apply(proto, args))();
                    obj.className = name;
                }
                return obj;
            }

            if (name) {
                console.error("Cannot instantiate entity of type '" + data + "': Class not found!");
            }
            return null;
        };

        /**
         * purge the entity pool from any inactive object <br>
         * Object pooling must be enabled for this function to work<br>
         * note: this will trigger the garbage collector
         * @name purge
         * @memberOf me.pool
         * @public
         * @function
         */
        api.purge = function () {
            for (var className in entityClass) {
                if (entityClass.hasOwnProperty(className)) {
                    entityClass[className].pool = [];
                }
            }
        };

        /**
         * Push back an object instance into the entity pool <br>
         * Object pooling for the object class must be enabled,
         * and object must have been instantiated using {@link me.pool#pull},
         * otherwise this function won't work
         * @name push
         * @memberOf me.pool
         * @public
         * @function
         * @param {Object} instance to be recycled
         */
        api.push = function (obj) {
            var name = obj.className;
            if (typeof(name) === "undefined" || !entityClass[name]) {
                // object is not registered, don't do anything
                return;
            }
            // store back the object instance for later recycling
            entityClass[name].pool.push(obj);
        };

        // return our object
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a generic 2D Vector Object
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {Number} [x=0] x value of the vector
     * @param {Number} [y=0] y value of the vector
     */
    me.Vector2d = Object.extend(
    /** @scope me.Vector2d.prototype */
    {
        /** @ignore */
        init : function (x, y) {
            return this.set(x || 0, y || 0);
        },

        /**
         * set the Vector x and y properties to the given values<br>
         * @name set
         * @memberOf me.Vector2d
         * @function
         * @param {Number} x
         * @param {Number} y
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        set : function (x, y) {
            if (x !== +x || y !== +y) {
                throw new me.Vector2d.Error(
                    "invalid x,y parameters (not a number)"
                );
            }

            /**
             * x value of the vector
             * @public
             * @type Number
             * @name x
             * @memberOf me.Vector2d
             */
            this.x = x;

            /**
             * y value of the vector
             * @public
             * @type Number
             * @name y
             * @memberOf me.Vector2d
             */
            this.y = y;

            return this;
        },

        /**
         * set the Vector x and y properties to 0
         * @name setZero
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        setZero : function () {
            return this.set(0, 0);
        },

        /**
         * set the Vector x and y properties using the passed vector
         * @name setV
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        setV : function (v) {
            this.x = v.x;
            this.y = v.y;
            return this;
        },

        /**
         * Add the passed vector to this vector
         * @name add
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        add : function (v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        },

        /**
         * Substract the passed vector to this vector
         * @name sub
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        sub : function (v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        },

        /**
         * Multiply this vector values by the given scalar
         * @name scale
         * @memberOf me.Vector2d
         * @function
         * @param {Number} x
         * @param {Number} [y=x]
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        scale : function (x, y) {
            this.x *= x;
            this.y *= typeof (y) !== "undefined" ? y : x;
            return this;
        },

        /**
         * Multiply this vector values by the passed vector
         * @name scaleV
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        scaleV : function (v) {
            this.x *= v.x;
            this.y *= v.y;
            return this;
        },

        /**
         * Divide this vector values by the passed value
         * @name div
         * @memberOf me.Vector2d
         * @function
         * @param {Number} value
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        div : function (n) {
            this.x /= n;
            this.y /= n;
            return this;
        },

        /**
         * Update this vector values to absolute values
         * @name abs
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        abs : function () {
            if (this.x < 0) {
                this.x = -this.x;
            }
            if (this.y < 0) {
                this.y = -this.y;
            }
            return this;
        },

        /**
         * Clamp the vector value within the specified value range
         * @name clamp
         * @memberOf me.Vector2d
         * @function
         * @param {Number} low
         * @param {Number} high
         * @return {me.Vector2d} new me.Vector2d
         */
        clamp : function (low, high) {
            return new me.Vector2d(this.x.clamp(low, high), this.y.clamp(low, high));
        },

        /**
         * Clamp this vector value within the specified value range
         * @name clampSelf
         * @memberOf me.Vector2d
         * @function
         * @param {Number} low
         * @param {Number} high
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        clampSelf : function (low, high) {
            this.x = this.x.clamp(low, high);
            this.y = this.y.clamp(low, high);
            return this;
        },

        /**
         * Update this vector with the minimum value between this and the passed vector
         * @name minV
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        minV : function (v) {
            this.x = this.x < v.x ? this.x : v.x;
            this.y = this.y < v.y ? this.y : v.y;
            return this;
        },

        /**
         * Update this vector with the maximum value between this and the passed vector
         * @name maxV
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        maxV : function (v) {
            this.x = this.x > v.x ? this.x : v.x;
            this.y = this.y > v.y ? this.y : v.y;
            return this;
        },

        /**
         * Floor the vector values
         * @name floor
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} new me.Vector2d
         */
        floor : function () {
            return new me.Vector2d(~~this.x, ~~this.y);
        },

        /**
         * Floor this vector values
         * @name floorSelf
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        floorSelf : function () {
            this.x = ~~this.x;
            this.y = ~~this.y;
            return this;
        },

        /**
         * Ceil the vector values
         * @name ceil
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} new me.Vector2d
         */
        ceil : function () {
            return new me.Vector2d(Math.ceil(this.x), Math.ceil(this.y));
        },

        /**
         * Ceil this vector values
         * @name ceilSelf
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        ceilSelf : function () {
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            return this;
        },

        /**
         * Negate the vector values
         * @name negate
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} new me.Vector2d
         */
        negate : function () {
            return new me.Vector2d(-this.x, -this.y);
        },

        /**
         * Negate this vector values
         * @name negateSelf
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        negateSelf : function () {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        },

        /**
         * Copy the x,y values of the passed vector to this one
         * @name copy
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        copy : function (v) {
            this.x = v.x;
            this.y = v.y;
            return this;
        },

        /**
         * return true if the two vectors are the same
         * @name equals
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {Boolean}
         */
        equals : function (v) {
            return ((this.x === v.x) && (this.y === v.y));
        },

        /**
         * normalize this vector (scale the vector so that its magnitude is 1)
         * @name normalize
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        normalize : function () {
            var d = this.length();
            if (d > 0) {
                this.x = this.x / d;
                this.y = this.y / d;
            }
            return this;
        },
        
        /**
         * change this vector to be perpendicular to what it was before.<br>
         * (Effectively rotates it 90 degrees in a clockwise direction)
         * @name perp
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        perp : function () {
            var x = this.x;
            this.x = this.y;
            this.y = -x;
            return this;
        },

        /**
         * Rotate this vector (counter-clockwise) by the specified angle (in radians).
         * @name rotate
         * @memberOf me.Vector2d
         * @function
         * @param {number} angle The angle to rotate (in radians)
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        rotate : function (angle) {
            var x = this.x;
            var y = this.y;
            this.x = x * Math.cos(angle) - y * Math.sin(angle);
            this.y = x * Math.sin(angle) + y * Math.cos(angle);
            return this;
        },
        
         /**
         * Reverse this vector.
         * @name reverse
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        reverse : function () {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        },
        
        /**
         * return the dot product of this vector and the passed one
         * @name dotProduct
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {Number} The dot product.
         */
        dotProduct : function (v) {
            return this.x * v.x + this.y * v.y;
        },

       /**
         * return the square length of this vector
         * @name length2
         * @memberOf me.Vector2d
         * @function
         * @return {Number} The length^2 of this vector.
         */
        length2 : function () {
            return this.dotProduct(this);
        },
        
        /**
         * return the length (magnitude) of this vector
         * @name length
         * @memberOf me.Vector2d
         * @function
         * @return {Number} the length of this vector
         */
        length : function () {
            return Math.sqrt(this.length2());
        },

        /**
         * return the distance between this vector and the passed one
         * @name distance
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {Number}
         */
        distance : function (v) {
            return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
        },

        /**
         * return the angle between this vector and the passed one
         * @name angle
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v
         * @return {Number} angle in radians
         */
        angle : function (v) {
            return Math.atan2((v.y - this.y), (v.x - this.x));
        },
            
        /**
         * project this vector on to another vector.
         * @name project
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v The vector to project onto.
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        project : function (v) {
            var amt = this.dotProduct(v) / v.length2();
            this.x = amt * v.x;
            this.y = amt * v.y;
            return this;
        },

        /**
         * Project this vector onto a vector of unit length.<br>
         * This is slightly more efficient than `project` when dealing with unit vectors.
         * @name projectN
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} v The unit vector to project onto.
         * @return {me.Vector2d} Reference to this object for method chaining
         */
        projectN : function (v) {
            var amt = this.dotProduct(v);
            this.x = amt * v.x;
            this.y = amt * v.y;
            return this;
        },
        
        /**
         * Reflect this vector on an arbitrary axis.
         * @name reflect          
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} axis The vector representing the axis.
         * @return {me.Vector2d} Reference to this object for method chaining.
         */
        reflect : function (axis) {
            var x = this.x;
            var y = this.y;
            this.project(axis).scale(2);
            this.x -= x;
            this.y -= y;
            return this;
        },
 
        /**
         * Reflect this vector on an arbitrary axis (represented by a unit vector) <br>
         * This is slightly more efficient than `reflect` when dealing with unit vectors.
         * @name reflectN
         * @memberOf me.Vector2d
         * @function
         * @param {me.Vector2d} axis The vector representing the axis.
         * @return {me.Vector2d} Reference to this object for method chaining.
         */
        reflectN : function (axis) {
            var x = this.x;
            var y = this.y;
            this.projectN(axis).scale(2);
            this.x -= x;
            this.y -= y;
            return this;
        },
        
        /**
         * return a clone copy of this vector
         * @name clone
         * @memberOf me.Vector2d
         * @function
         * @return {me.Vector2d} new me.Vector2d
         */
        clone : function () {
            return new me.Vector2d(this.x, this.y);
        },

        /**
         * convert the object to a string representation
         * @name toString
         * @memberOf me.Vector2d
         * @function
         * @return {String}
         */
        toString : function () {
            return "x:" + this.x + ",y:" + this.y;
        }
    });

    /**
     * Base class for Vector2d exception handling.
     * @name Error
     * @class
     * @memberOf me.Vector2d
     * @constructor
     * @param {String} msg Error message.
     */
    me.Vector2d.Error = me.Error.extend({
        init : function (msg) {
            me.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Vector2d.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a rectangle Object
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {Number} x position of the Rectangle
     * @param {Number} y position of the Rectangle
     * @param {Number} w width of the rectangle
     * @param {Number} h height of the rectangle
     */
    me.Rect = Object.extend(
    /** @scope me.Rect.prototype */ {

        /** @ignore */
        init : function (x, y, w, h) {
            /**
             * position of the Rectangle
             * @public
             * @type {me.Vector2d}
             * @name pos
             * @memberOf me.Rect
             */
            this.pos = new me.Vector2d(x, y);

            /**
             * width of the Rectangle
             * @public
             * @type {Number}
             * @name width
             * @memberOf me.Rect
             */
            this.width = w;
            /**
             * height of the Rectangle
             * @public
             * @type {Number}
             * @name height
             * @memberOf me.Rect
             */
            this.height = h;

            // the shape type
            this.shapeType = "Rectangle";
        },

        /**
         * set new value to the rectangle shape
         * @name setShape
         * @memberOf me.Rect
         * @function
         * @param {Number} x position of the Rectangle
         * @param {Number} y position of the Rectangle
         * @param {Number} w width of the rectangle
         * @param {Number} h height of the rectangle
         * @return {me.Rect} this rectangle
         */
        setShape : function (x, y, w, h) {
            // set the new position vector
            this.pos.set(x, y);

            // resize
            this.resize(w, h);

            return this;
        },

        /**
         * resize the rectangle
         * @name resize
         * @memberOf me.Rect
         * @function
         * @param {Number} w new width of the rectangle
         * @param {Number} h new height of the rectangle
         * @return {me.Rect} this rectangle
         */
        resize : function (w, h) {
            this.width = w;
            this.height = h;
            return this;
        },

        /**
         * returns the bounding box for this shape, the smallest rectangle object completely containing this shape.
         * @name getBounds
         * @memberOf me.Rect
         * @function
         * @return {me.Rect} this shape bounding box Rectangle object
         */
        getBounds : function () {
            return this;
        },

        /**
         * update the bounding box for this shape.
         * @name updateBounds
         * @memberOf me.Rect
         * @function
         * @return {me.Rect} this shape bounding box Rectangle object
         */
        updateBounds : function () {
            return this;
        },

        /**
         * clone this rectangle
         * @name clone
         * @memberOf me.Rect
         * @function
         * @return {me.Rect} new rectangle
         */
        clone : function () {
            return new me.Rect(this.pos.x, this.pos.y, this.width, this.height);
        },

        /**
         * copy the position and size of the given rectangle into this one
         * @name copy
         * @memberOf me.Rect
         * @function
         * @param {me.Rect} rect Source rectangle
         * @return {me.Rect} new rectangle
         */
        copy : function (rect) {
            return this.setShape(rect.pos.x, rect.pos.y, rect.width, rect.height);
        },

        /**
         * translate the rect by the specified offset
         * @name translate
         * @memberOf me.Rect
         * @function
         * @param {Number} x x offset
         * @param {Number} y y offset
         * @return {me.Rect} this rectangle
         */
        translate : function (x, y) {
            this.pos.x += x;
            this.pos.y += y;
            return this;
        },

        /**
         * translate the rect by the specified vector
         * @name translateV
         * @memberOf me.Rect
         * @function
         * @param {me.Vector2d} v vector offset
         * @return {me.Rect} this rectangle
         */
        translateV : function (v) {
            return this.translate(v.x, v.y);
        },

        /**
         * merge this rectangle with another one
         * @name union
         * @memberOf me.Rect
         * @function
         * @param {me.Rect} rect other rectangle to union with
         * @return {me.Rect} the union(ed) rectangle
         */
        union : function (/** {me.Rect} */ r) {
            var x1 = Math.min(this.left, r.left);
            var y1 = Math.min(this.top, r.top);

            this.resize(
                Math.max(this.right, r.right) - x1,
                Math.max(this.bottom, r.bottom) - y1
            );

            this.pos.set(x1, y1);

            return this;
        },

        /**
         * check if this rectangle is intersecting with the specified one
         * @name overlaps
         * @memberOf me.Rect
         * @function
         * @param  {me.Rect} rect
         * @return {boolean} true if overlaps
         */
        overlaps : function (r)    {
            return (
                this.left < r.right &&
                r.left < this.right &&
                this.top < r.bottom &&
                r.top < this.bottom
            );
        },

        /**
         * check if this rectangle contains the specified one
         * @name contains
         * @memberOf me.Rect
         * @function
         * @param  {me.Rect} rect
         * @return {boolean} true if contains
         */
        contains: function (r) {
            return (
                r.left >= this.left &&
                r.right <= this.right &&
                r.top >= this.top &&
                r.bottom <= this.bottom
            );
        },

        /**
         * check if this rectangle contains the specified point
         * @name containsPointV
         * @memberOf me.Rect
         * @function
         * @param  {me.Vector2d} point
         * @return {boolean} true if contains
         */
        containsPointV: function (v) {
            return this.containsPoint(v.x, v.y);
        },

        /**
         * check if this rectangle contains the specified point
         * @name containsPoint
         * @memberOf me.Rect
         * @function
         * @param  {Number} x x coordinate
         * @param  {Number} y y coordinate
         * @return {boolean} true if contains
         */
        containsPoint: function (x, y) {
            return (
                x >= this.left &&
                x <= this.right &&
                y >= this.top &&
                y <= this.bottom
            );
        },

        /**
         * Returns a polygon whose edges are the same as this box.
         * @name toPolygon
         * @memberOf me.Rect
         * @function
         * @return {me.Polygon} a new Polygon that represents this rectangle.
         */
        toPolygon: function () {
            var pos = this.pos;
            var w = this.width;
            var h = this.height;
            return new me.Polygon(
                pos.x, pos.y, [
                    new me.Vector2d(), new me.Vector2d(w, 0),
                    new me.Vector2d(w, h), new me.Vector2d(0, h)
                ]
            );
        }
    });

    // redefine some properties to ease our life when getting the rectangle coordinates
    /**
     * left coordinate of the Rectangle<br>
     * takes in account the adjusted size of the rectangle (if set)
     * @public
     * @type {Number}
     * @name left
     * @memberOf me.Rect
     */
    Object.defineProperty(me.Rect.prototype, "left", {
        get : function () {
            return this.pos.x;
        },
        configurable : true
    });

    /**
     * right coordinate of the Rectangle<br>
     * takes in account the adjusted size of the rectangle (if set)
     * @public
     * @type {Number}
     * @name right
     * @memberOf me.Rect
     */
    Object.defineProperty(me.Rect.prototype, "right", {
        get : function () {
            return (this.pos.x + this.width) || this.width;
        },
        configurable : true
    });

    /**
     * top coordinate of the Rectangle<br>
     * takes in account the adjusted size of the rectangle (if set)
     * @public
     * @type {Number}
     * @name top
     * @memberOf me.Rect
     */
    Object.defineProperty(me.Rect.prototype, "top", {
        get : function () {
            return this.pos.y;
        },
        configurable : true
    });

    /**
     * bottom coordinate of the Rectangle<br>
     * takes in account the adjusted size of the rectangle (if set)
     * @public
     * @type {Number}
     * @name bottom
     * @memberOf me.Rect
     */
    Object.defineProperty(me.Rect.prototype, "bottom", {
        get : function () {
            return (this.pos.y + this.height) || this.height;
        },
        configurable : true
    });

})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * an ellipse Object
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {Number} x the center x coordinate of the ellipse
     * @param {Number} y the center y coordinate of the ellipse
     * @param {Number} w width (diameter) of the ellipse
     * @param {Number} h height (diameter) of the ellipse
     */
    me.Ellipse = Object.extend(
    {
        /** @scope me.Ellipse.prototype */
        /** @ignore */
        init : function (x, y, w, h) {
            /**
             * the center coordinates of the ellipse
             * @public
             * @type {me.Vector2d}
             * @name pos
             * @memberOf me.Ellipse
             */
            this.pos = new me.Vector2d();

            /**
             * The bounding rectangle for this shape
             * @protected
             * @type {me.Rect}
             * @name bounds
             * @memberOf me.Ellipse
             */
            this.bounds = undefined;

            /**
             * Maximum radius of the ellipse
             * @public
             * @type {Number}
             * @name radius
             * @memberOf me.Ellipse
             */
            this.radius = NaN;

            /**
             * Pre-scaled radius vector for ellipse
             * @public
             * @type {me.Vector2d}
             * @name radiusV
             * @memberOf me.Ellipse
             */
            this.radiusV = new me.Vector2d();

            /**
             * Radius squared, for pythagorean theorom
             * @public
             * @type {me.Vector2d}
             * @name radiusSq
             * @memberOf me.Ellipse
             */
            this.radiusSq = new me.Vector2d();

            /**
             * x/y scaling ratio for ellipse
             * @public
             * @type {me.Vector2d}
             * @name ratio
             * @memberOf me.Ellipse
             */
            this.ratio = new me.Vector2d();

            // the shape type
            this.shapeType = "Ellipse";
            this.setShape(x, y, w, h);
        },

        /**
         * set new value to the Ellipse shape
         * @name setShape
         * @memberOf me.Ellipse
         * @function
         * @param {Number} x position of the ellipse
         * @param {Number} y position of the ellipse
         * @param {Number} w width (diameter) of the ellipse
         * @param {Number} h height (diameter) of the ellipse
         */
        setShape : function (x, y, w, h) {
            var hW = w / 2;
            var hH = h / 2;
            this.pos.set(x, y);
            this.radius = Math.max(hW, hH);
            this.ratio.set(hW / this.radius, hH / this.radius);
            this.radiusV.set(this.radius, this.radius).scaleV(this.ratio);
            var r = this.radius * this.radius;
            this.radiusSq.set(r, r).scaleV(this.ratio);
            this.updateBounds();
            return this;
        },

        /**
         * Rotate this Ellipse (counter-clockwise) by the specified angle (in radians).
         * @name rotate
         * @memberOf me.Ellipse
         * @function
         * @param {Number} angle The angle to rotate (in radians)
         * @return {me.Ellipse} Reference to this object for method chaining
         */
        rotate : function (/*angle*/) {
            // TODO
            return this;
        },

        /**
         * Scale this Ellipse by the specified scalar.
         * @name scale
         * @memberOf me.Ellipse
         * @function
         * @param {Number} x
         * @param {Number} [y=x]
         * @return {me.Ellipse} Reference to this object for method chaining
         */
        scale : function (x, y) {
            y = typeof (y) !== "undefined" ? y : x;
            return this.setShape(
                this.pos.x,
                this.pos.y,
                this.radiusV.x * 2 * x,
                this.radiusV.y * 2 * y
            );
        },

        /**
         * Scale this Ellipse by the specified vector.
         * @name scale
         * @memberOf me.Ellipse
         * @function
         * @param {me.Vector2d} v
         * @return {me.Ellipse} Reference to this object for method chaining
         */
        scaleV : function (v) {
            return this.scale(v.x, v.y);
        },

        /**
         * translate the circle/ellipse by the specified offset
         * @name translate
         * @memberOf me.Ellipse
         * @function
         * @param {Number} x x offset
         * @param {Number} y y offset
         * @return {me.Ellipse} this ellipse
         */
        translate : function (x, y) {
            this.pos.x += x;
            this.pos.y += y;
            this.bounds.translate(x, y);
            return this;
        },

        /**
         * translate the circle/ellipse by the specified vector
         * @name translateV
         * @memberOf me.Ellipse
         * @function
         * @param {me.Vector2d} v vector offset
         * @return {me.Rect} this ellipse
         */
        translateV : function (v) {
            this.pos.add(v);
            this.bounds.translateV(v);
            return this;
        },

        /**
         * check if this circle/ellipse contains the specified point
         * @name containsPointV
         * @memberOf me.Ellipse
         * @function
         * @param  {me.Vector2d} point
         * @return {boolean} true if contains
         */
        containsPointV: function (v) {
            return this.containsPoint(v.x, v.y);
        },

        /**
         * check if this circle/ellipse contains the specified point
         * @name containsPoint
         * @memberOf me.Ellipse
         * @function
         * @param  {Number} x x coordinate
         * @param  {Number} y y coordinate
         * @return {boolean} true if contains
         */
        containsPoint: function (x, y) {
            // Make position relative to object center point.
            x -= this.pos.x;
            y -= this.pos.y;
            // Pythagorean theorem.
            return (
                ((x * x) / this.radiusSq.x) +
                ((y * y) / this.radiusSq.y)
            ) <= 1.0;
        },

        /**
         * returns the bounding box for this shape, the smallest Rectangle object completely containing this shape.
         * @name getBounds
         * @memberOf me.Ellipse
         * @function
         * @return {me.Rect} this shape bounding box Rectangle object
         */
        getBounds : function () {
            return this.bounds;
        },

        /**
         * update the bounding box for this shape.
         * @name updateBounds
         * @memberOf me.Ellipse
         * @function
         * @return {me.Rect} this shape bounding box Rectangle object
         */
        updateBounds : function () {
            var rx = this.radiusV.x,
                ry = this.radiusV.y,
                x = this.pos.x - rx,
                y = this.pos.y - ry,
                w = rx * 2,
                h = ry * 2;

            if (!this.bounds) {
                this.bounds = new me.Rect(x, y, w, h);
            }  else {
                this.bounds.setShape(x, y, w, h);
            }
            return this.bounds;
        },

        /**
         * clone this Ellipse
         * @name clone
         * @memberOf me.Ellipse
         * @function
         * @return {me.Ellipse} new Ellipse
         */
        clone : function () {
            return new me.Ellipse(
                this.pos.x,
                this.pos.y,
                this.radiusV.x * 2,
                this.radiusV.y * 2
            );
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a polygon Object.<br>
     * Please do note that melonJS implements a simple Axis-Aligned Boxes collision algorithm, which requires all polygons used for collision to be convex with all vertices defined with clockwise winding.
     * A polygon is convex when all line segments connecting two points in the interior do not cross any edge of the polygon
     * (which means that all angles are less than 180 degrees), as described here below : <br>
     * <center><img src="images/convex_polygon.png"/></center><br>
     * A polygon's `winding` is clockwise iff its vertices (points) are declared turning to the right. The image above shows COUNTERCLOCKWISE winding.
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {Number} x origin point of the Polygon
     * @param {Number} y origin point of the Polygon
     * @param {me.Vector2d[]} points array of vector defining the Polygon
     */
    me.Polygon = Object.extend(
    /** @scope me.Polygon.prototype */ {

        /** @ignore */
        init : function (x, y, points) {
            /**
             * origin point of the Polygon
             * @public
             * @type {me.Vector2d}
             * @name pos
             * @memberOf me.Polygon
             */
            this.pos = new me.Vector2d();

            /**
             * The bounding rectangle for this shape
             * @protected
             * @type {me.Rect}
             * @name bounds
             * @memberOf me.Polygon
             */
            this.bounds = undefined;

            /**
             * Array of points defining the Polygon <br>
             * Note: If you manually change `points`, you **must** call `recalc`afterwards so that the changes get applied correctly.
             * @public
             * @type {me.Vector2d[]}
             * @name points
             * @memberOf me.Polygon
             */
            this.points = null;

            // the shape type
            this.shapeType = "Polygon";
            this.setShape(x, y, points);
        },

        /**
         * set new value to the Polygon
         * @name setShape
         * @memberOf me.Polygon
         * @function
         * @param {Number} x position of the Polygon
         * @param {Number} y position of the Polygon
         * @param {me.Vector2d[]} points array of vector defining the Polygon
         */
        setShape : function (x, y, points) {
            this.pos.set(x, y);
            this.points = points;
            this.recalc();
            this.updateBounds();
            return this;
        },

        /**
         * Rotate this Polygon (counter-clockwise) by the specified angle (in radians).
         * @name rotate
         * @memberOf me.Polygon
         * @function
         * @param {Number} angle The angle to rotate (in radians)
         * @return {me.Polygon} Reference to this object for method chaining
         */
        rotate : function (angle) {
            if (angle !== 0) {
                var points = this.points;
                var len = points.length;
                for (var i = 0; i < len; i++) {
                    points[i].rotate(angle);
                }
                this.recalc();
                this.updateBounds();
            }
            return this;
        },

        /**
         * Scale this Polygon by the given scalar.
         * @name scale
         * @memberOf me.Polygon
         * @function
         * @param {Number} x
         * @param {Number} [y=x]
         * @return {me.Polygon} Reference to this object for method chaining
         */
        scale : function (x, y) {
            y = typeof (y) !== "undefined" ? y : x;

            var points = this.points;
            var len = points.length;
            for (var i = 0; i < len; i++) {
                points[i].scale(x, y);
            }
            this.recalc();
            this.updateBounds();
            return this;
        },

        /**
         * Scale this Polygon by the given vector
         * @name scaleV
         * @memberOf me.Polygon
         * @function
         * @param {me.Vector2d} v
         * @return {me.Polygon} Reference to this object for method chaining
         */
        scaleV : function (v) {
            return this.scale(v.x, v.y);
        },

        /**
         * Computes the calculated collision polygon.
         * This **must** be called if the `points` array, `angle`, or `offset` is modified manually.
         * @name recalc
         * @memberOf me.Polygon
         * @function
         */
        recalc : function () {
            var i;
            // The edges here are the direction of the `n`th edge of the polygon, relative to
            // the `n`th point. If you want to draw a given edge from the edge value, you must
            // first translate to the position of the starting point.
            var edges = this.edges = [];
            // The normals here are the direction of the normal for the `n`th edge of the polygon, relative
            // to the position of the `n`th point. If you want to draw an edge normal, you must first
            // translate to the position of the starting point.
            var normals = this.normals = [];
            // Copy the original points array and apply the offset/angle
            var points = this.points;
            var len = points.length;

            if (len < 3) {
                throw new me.Polygon.Error("Requires at least 3 points");
            }

            // Calculate the edges/normals
            for (i = 0; i < len; i++) {
                var e = new me.Vector2d().copy(points[(i + 1) % len]).sub(points[i]);
                edges.push(e);
                normals.push(new me.Vector2d().copy(e).perp().normalize());
            }
            return this;
        },

        /**
         * translate the Polygon by the specified offset
         * @name translate
         * @memberOf me.Polygon
         * @function
         * @param {Number} x x offset
         * @param {Number} y y offset
         * @return {me.Polygon} this Polygon
         */
        translate : function (x, y) {
            this.pos.x += x;
            this.pos.y += y;
            this.bounds.translate(x, y);
            return this;
        },

        /**
         * translate the Polygon by the specified vector
         * @name translateV
         * @memberOf me.Polygon
         * @function
         * @param {me.Vector2d} v vector offset
         * @return {me.Polygon} this Polygon
         */
        translateV : function (v) {
            this.pos.add(v);
            this.bounds.translateV(v);
            return this;
        },

        /**
         * check if this Polygon contains the specified point
         * @name containsPointV
         * @memberOf me.Polygon
         * @function
         * @param  {me.Vector2d} point
         * @return {boolean} true if contains
         */
        containsPointV: function (v) {
            return this.containsPoint(v.x, v.y);
        },

        /**
         * check if this Polygon contains the specified point <br>
         * (Note: it is highly recommended to first do a hit test on the corresponding <br>
         *  bounding rect, as the function can be highly consuming with complex shapes)
         * @name containsPoint
         * @memberOf me.Polygon
         * @function
         * @param  {Number} x x coordinate
         * @param  {Number} y y coordinate
         * @return {boolean} true if contains
         */
        containsPoint: function (x, y) {
            var intersects = false;
            var posx = this.pos.x, posy = this.pos.y;
            var points = this.points;
            var len = points.length;

            //http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
            for (var i = 0, j = len - 1; i < len; j = i++) {
                var iy = points[i].y + posy, ix = points[i].x + posx,
                    jy = points[j].y + posy, jx = points[j].x + posx;
                if (((iy > y) !== (jy > y)) && (x < (jx - ix) * (y - iy) / (jy - iy) + ix)) {
                    intersects = !intersects;
                }
            }
            return intersects;
        },

        /**
         * returns the bounding box for this shape, the smallest Rectangle object completely containing this shape.
         * @name getBounds
         * @memberOf me.Polygon
         * @function
         * @return {me.Rect} this shape bounding box Rectangle object
         */
        getBounds : function () {
            return this.bounds;
        },

        /**
         * update the bounding box for this shape.
         * @name updateBounds
         * @memberOf me.Polygon
         * @function
         * @return {me.Rect} this shape bounding box Rectangle object
         */
        updateBounds : function () {
            var x = Infinity, y = Infinity, right = -Infinity, bottom = -Infinity;
            this.points.forEach(function (point) {
                x = Math.min(x, point.x);
                y = Math.min(y, point.y);
                right = Math.max(right, point.x);
                bottom = Math.max(bottom, point.y);
            });

            if (!this.bounds) {
                this.bounds = new me.Rect(x, y, right - x, bottom - y);
            } else {
                this.bounds.setShape(x, y, right - x, bottom - y);
            }

            return this.bounds.translateV(this.pos);
        },

        /**
         * clone this Polygon
         * @name clone
         * @memberOf me.Polygon
         * @function
         * @return {me.Polygon} new Polygon
         */
        clone : function () {
            var copy = [];
            this.points.forEach(function (point) {
                copy.push(new me.Vector2d(point.x, point.y));
            });
            return new me.Polygon(this.pos.x, this.pos.y, copy);
        }
    });

    /**
     * Base class for Polygon exception handling.
     * @name Error
     * @class
     * @memberOf me.Polygon
     * @constructor
     * @param {String} msg Error message.
     */
    me.Polygon.Error = me.Error.extend({
        init : function (msg) {
            me.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Polygon.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a line segment Object.<br>
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {Number} x origin point of the Line
     * @param {Number} y origin point of the Line
     * @param {me.Vector2d[]} points array of vector defining the Line
     */
    me.Line = me.Polygon.extend(
    /** @scope me.Line.prototype */ {

        /**
         * check if this line segment contains the specified point
         * @name containsPointV
         * @memberOf me.Line
         * @function
         * @param  {me.Vector2d} point
         * @return {boolean} true if contains
         */
        containsPointV: function (v) {
            return this.containsPoint(v.x, v.y);
        },

        /**
         * check if this line segment contains the specified point
         * @name containsPoint
         * @memberOf me.Line
         * @function
         * @param  {Number} x x coordinate
         * @param  {Number} y y coordinate
         * @return {boolean} true if contains
         */
        containsPoint: function (x, y) {
            // translate the given coordinates, 
            // rather than creating temp translated vectors 
            x -= this.pos.x; // Cx
            y -= this.pos.y; // Cy
            var start = this.points[0]; // Ax/Ay
            var end = this.points[1]; // Bx/By
            
            //(Cy - Ay) * (Bx - Ax) = (By - Ay) * (Cx - Ax)
            return (y - start.y) * (end.x - start.x) === (end.y - start.y) * (x - start.x);
        },
        
        /**
         * Computes the calculated collision edges and normals. 
         * This **must** be called if the `points` array, `angle`, or `offset` is modified manually.
         * @name recalc
         * @memberOf me.Line
         * @function
         */
        recalc : function () {
            // The edges here are the direction of the `n`th edge of the polygon, relative to
            // the `n`th point. If you want to draw a given edge from the edge value, you must
            // first translate to the position of the starting point.
            var edges = this.edges = [];
            // The normals here are the direction of the normal for the `n`th edge of the polygon, relative
            // to the position of the `n`th point. If you want to draw an edge normal, you must first
            // translate to the position of the starting point.
            var normals = this.normals = [];
            // Copy the original points array and apply the offset/angle
            var points = this.points;

            if (points.length !== 2) {
                throw new me.Line.Error("Requires exactly 2 points");
            }

            // Calculate the edges/normals
            var e = new me.Vector2d().copy(points[1]).sub(points[0]);
            edges.push(e);
            normals.push(new me.Vector2d().copy(e).perp().normalize());

            return this;
        }
    });

    /**
     * Base class for Line exception handling.
     * @name Error
     * @class
     * @memberOf me.Line
     * @constructor
     * @param {String} msg Error message.
     */
    me.Line.Error = me.Error.extend({
        init : function (msg) {
            me.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Line.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, melonJS Team
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a Matrix2d Object.<br>
     * the identity matrix and parameters position : <br>
     * <img src="images/identity-matrix_2x.png"/>
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {me.Matrix2d} an instance of matrix2 to copy from (optional)
     */
    me.Matrix2d = Object.extend(
    /** @scope me.Matrix2d.prototype */    {

        /** @ignore */
        init : function (m) {
            this.val = new Float32Array(6);
            if (m) {
                this.copy(m);
            }
            else {
                this.identity();
            }
        },

        /**
         * reset the transformation matrix to the identity matrix (no transformation).<br>
         * the identity matrix and parameters position : <br>
         * <img src="images/identity-matrix_2x.png"/>
         * @name identity
         * @memberOf me.Matrix2d
         * @function
         * @return {me.Matrix2d} this matrix
         */
        identity : function () {
            this.set(1, 0, 0, 1, 0, 0);
            return this;
        },

        /**
         * set the matrix to the specified value
         * @name set
         * @memberOf me.Matrix2d
         * @function
         * @param {Number} m11
         * @param {Number} m12
         * @param {Number} m21
         * @param {Number} m22
         * @param {Number} dx
         * @param {Number} dy
         * @return {me.Matrix2d} this matrix
         */
        set : function () {
            var a = this.val;
            a[0] = arguments[0];
            a[1] = arguments[1];
            a[2] = arguments[2];
            a[3] = arguments[3];
            a[4] = arguments[4];
            a[5] = arguments[5];
            return this;
        },

        /**
         * multiply both matrix
         * @name multiply
         * @memberOf me.Matrix2d
         * @function
         * @param {me.Matrix2d} otherMat
         * @return {me.Matrix2d} this matrix
         */
        multiply : function (otherMat) {
            var a = this.val, b = otherMat.val;
            var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
            b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];

            a[0] = a0 * b0 + a2 * b1;
            a[1] = a1 * b0 + a3 * b1;
            a[2] = a0 * b2 + a2 * b3;
            a[3] = a1 * b2 + a3 * b3;
            a[4] = a0 * b4 + a2 * b5 + a4;
            a[5] = a1 * b4 + a3 * b5 + a5;
            return this;
        },

        /**
         * scale the matrix
         * @name scale
         * @memberOf me.Matrix2d
         * @function
         * @param {Number} sx a number representing the abscissa of the scaling vector.
         * @param {Number} sy a number representing the abscissa of the scaling vector.
         * @return {me.Matrix2d} this matrix
         */
        scale : function (sx, sy) {
            var a = this.val;
            a[0] *= sx;
            a[1] *= sx;
            a[2] *= sy;
            a[3] *= sy;

            return this;
        },

        /**
         * rotate the matrix
         * @name rotate
         * @memberOf me.Matrix2d
         * @function
         * @param {Number} angle an angle in radians representing the angle of the rotation. A positive angle denotes a clockwise rotation, a negative angle a counter-clockwise one.
         * @return {me.Matrix2d} this matrix
         */
        rotate : function (angle) {
            if (angle !== 0) {
                var a = this.val;
                var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
                    s = Math.sin(angle),
                    c = Math.cos(angle);
                a[0] = a0 * c + a2 * s;
                a[1] = a1 * c + a3 * s;
                a[2] = a0 * -s + a2 * c;
                a[3] = a1 * -s + a3 * c;
            }
            return this;
        },

        /**
         * translate the matrix
         * @name translate
         * @memberOf me.Matrix2d
         * @function
         * @param {Number} x the x coordindates to translate the matrix by
         * @param {Number} y the y coordindates to translate the matrix by
         * @return {me.Matrix2d} this matrix
         */
        translate : function (x, y) {
            var a = this.val;
            /* var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
            a[4] = a0 * x + a2 * y + a4;
            a[5] = a1 * x + a3 * y + a5; */

            a[4] += x;
            a[5] += y;

            return this;
        },

        /**
         * translate the matrix the matrix
         * @name translateV
         * @memberOf me.Matrix2d
         * @function
         * @param {me.Vector2d} v the vector to translate the matrix by
         * @return {me.Matrix2d} this matrix
         */
        translateV : function (v) {
            return this.translate(v.x, v.y);
        },

        /**
         * returns true if the matrix is an identity matrix.
         * @name isIdentity
         * @memberOf me.Matrix2d
         * @function
         * @return {Boolean}
         **/
        isIdentity : function () {
            var a = this.val;
            return (a[0] === 1 && a[1] === 0 && a[2] === 0 && a[3] === 1 && a[4] === 0 && a[5] === 0);
        },

        /**
         * Clone the Matrix
         * @name clone
         * @memberOf me.Matrix2d
         * @function
         * @return {me.Matrix2d}
         */
        clone : function () {
            return new me.Matrix2d(this);
        },
        
        /**
         * convert the object to a string representation
         * @name toString
         * @memberOf me.Matrix2d
         * @function
         * @return {String}
         */
        toString : function () {
            var a = this.val;
            return "mat2d(" + a[0] + ", " + a[1] + ", " + a[2] + ", " +
                a[3] + ", " + a[4] + ", " + a[5] + ")";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, melonJS Team
 * http://www.melonjs.org
 * sourced from: https://github.com/mattdesl/vecmath. To keep in line with other matrix libraries
 */
(function () {
    me.Matrix3d = Object.extend({
        /** @ignore */
        init : function (m) {
            this.val = new Float32Array(9);
            if (m) { //assume Matrix3 with val
                this.copy(m);
            }
            else { //default to identity
                this.identity();
            }
        },

        /**
         * Adjoint the matrix. Returns self
         * @name adjoint
         * @memberOf me.Matrix3d
         * @function
         * @return {me.Matrix3d} this matrix for chaining
         */
        adjoint : function () {
            var a = this.val,
                a00 = a[0], a01 = a[1], a02 = a[2],
                a10 = a[3], a11 = a[4], a12 = a[5],
                a20 = a[6], a21 = a[7], a22 = a[8];

            a[0] = (a11 * a22 - a12 * a21);
            a[1] = (a02 * a21 - a01 * a22);
            a[2] = (a01 * a12 - a02 * a11);
            a[3] = (a12 * a20 - a10 * a22);
            a[4] = (a00 * a22 - a02 * a20);
            a[5] = (a02 * a10 - a00 * a12);
            a[6] = (a10 * a21 - a11 * a20);
            a[7] = (a01 * a20 - a00 * a21);
            a[8] = (a00 * a11 - a01 * a10);
            return this;
        },
        
        /**
         * returns true if the matrix is an identity matrix.
         * @name isIdentity
         * @memberOf me.Matrix3d
         * @function
         * @return {Boolean}
         **/
        isIdentity : function () {
            var a = this.val;
            return (a[0] === 1 && a[1] === 0 && a[2] === 0 &&
                    a[3] === 0 && a[4] === 1 && a[5] === 0 &&
                    a[6] === 0 && a[7] === 0 && a[8] === 1);
        },
        /**
         * Creates a copy of the current matrix, returning that copy
         * @name clone
         * @memberOf me.Matrix3d
         * @function
         * @return {me.Matrix3d} this matrix for chaining
         */
        clone : function () {
            return new me.Matrix3d(this);
        },

        /**
         * Copies over the values from another me.Matrix3d. Returns self
         * @name copy
         * @memberOf me.Matrix3d
         * @function
         * @param {me.Matrix3d} otherMat - the matrix object to copy from
         * @return {me.Matrix3d} this matrix for chaining
         */
        copy : function (otherMat) {
            var out = this.val, a = otherMat.val;
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            return this;
        },

        /**
         * Returns the determinant of the matrix.
         * @name determinant
         * @memberOf me.Matrix3d
         * @function
         * @return {Number}
         */
        determinant : function () {
            var a = this.val,
                a00 = a[0], a01 = a[1], a02 = a[2],
                a10 = a[3], a11 = a[4], a12 = a[5],
                a20 = a[6], a21 = a[7], a22 = a[8];

            return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
        },

        /**
         * Set the matrix to identity
         * @name identity
         * @memberOf me.Matrix3d
         * @function
         * @return {me.Matrix3d} this matrix for chaining
         */
        identity : function () {
            var a = this.val;
            a[0] = 1;
            a[1] = 0;
            a[2] = 0;
            a[3] = 0;
            a[4] = 1;
            a[5] = 0;
            a[6] = 0;
            a[7] = 0;
            a[8] = 1;
            return this;
        },

        /**
         * Inverts the matrix, and returns self
         * @name invert
         * @memberOf me.Matrix3d
         * @function
         * @return {me.Matrix3d} this matrix for chaining
         */
        invert : function () {
            var a = this.val,
                a00 = a[0], a01 = a[1], a02 = a[2],
                a10 = a[3], a11 = a[4], a12 = a[5],
                a20 = a[6], a21 = a[7], a22 = a[8],

                b01 = a22 * a11 - a12 * a21,
                b11 = -a22 * a10 + a12 * a20,
                b21 = a21 * a10 - a11 * a20,

                // Calculate the determinant
                det = a00 * b01 + a01 * b11 + a02 * b21;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            a[0] = b01 * det;
            a[1] = (-a22 * a01 + a02 * a21) * det;
            a[2] = (a12 * a01 - a02 * a11) * det;
            a[3] = b11 * det;
            a[4] = (a22 * a00 - a02 * a20) * det;
            a[5] = (-a12 * a00 + a02 * a10) * det;
            a[6] = b21 * det;
            a[7] = (-a21 * a00 + a01 * a20) * det;
            a[8] = (a11 * a00 - a01 * a10) * det;
            return this;
        },


        /**
         * Multiplies this current matrix by a given Matrix3d object. Returns self
         * @name multiple
         * @memberOf me.Matrix3d
         * @function
         * @param {me.Matrix3d} otherMat
         * @return {me.Matrix3d} this matrix for chaining
         */
        multiply : function (otherMat) {
            return this.multiplyArray(otherMat.val);
        },

        /**
         * @ignore
         */
        multiplyArray : function (array) {
            var a = this.val,
            b = array,
            a00 = a[0], a01 = a[1], a02 = a[2],
            a10 = a[3], a11 = a[4], a12 = a[5],
            a20 = a[6], a21 = a[7], a22 = a[8],

            b00 = b[0], b01 = b[1], b02 = b[2],
            b10 = b[3], b11 = b[4], b12 = b[5],
            b20 = b[6], b21 = b[7], b22 = b[8];

            a[0] = b00 * a00 + b01 * a10 + b02 * a20;
            a[1] = b00 * a01 + b01 * a11 + b02 * a21;
            a[2] = b00 * a02 + b01 * a12 + b02 * a22;

            a[3] = b10 * a00 + b11 * a10 + b12 * a20;
            a[4] = b10 * a01 + b11 * a11 + b12 * a21;
            a[5] = b10 * a02 + b11 * a12 + b12 * a22;

            a[6] = b20 * a00 + b21 * a10 + b22 * a20;
            a[7] = b20 * a01 + b21 * a11 + b22 * a21;
            a[8] = b20 * a02 + b21 * a12 + b22 * a22;
            return this;
        },

        /**
         * Rotates the matrix by the number in radians (rotate the matrix CCW)
         * @name rotate
         * @memberOf me.Matrix3d
         * @function
         * @param {Number} rad - degrees to rotate in radians
         * @return {me.Matrix3d} this matrix for chaining
         */
        rotate : function (rad) {
            var a = this.val,
                a00 = a[0], a01 = a[1], a02 = a[2],
                a10 = a[3], a11 = a[4], a12 = a[5],

                s = Math.sin(rad),
                c = Math.cos(rad);

            a[0] = c * a00 + s * a10;
            a[1] = c * a01 + s * a11;
            a[2] = c * a02 + s * a12;

            a[3] = c * a10 - s * a00;
            a[4] = c * a11 - s * a01;
            a[5] = c * a12 - s * a02;
            return this;
        },

        /**
         * Scales the matrix by x & y values. Returns self
         * @name scale
         * @memberOf me.Matrix3d
         * @function
         * @param {Number} x to scale by
         * @param {Number} y to scale by
         * @return {me.Matrix3d} this matrix for chaining
         */
        scale : function (x, y) {
            var a = this.val;

            a[0] = x * a[0];
            a[1] = x * a[1];
            a[2] = x * a[2];

            a[3] = y * a[3];
            a[4] = y * a[4];
            a[5] = y * a[5];
            return this;
        },

        /**
         * Set the matrix to the specified values
         * @name set
         * @memberOf me.Matrix3d
         * @function
         * @param {Number} m10
         * @param {Number} m11
         * @param {Number} m12
         * @param {Number} m20
         * @param {Number} m21
         * @param {Number} m22
         * @param {Number} m30
         * @param {Number} m31
         * @param {Number} m32
         * @return {me.Matrix3d} this matrix for chaining
         */
        set : function () {
            var a = this.val;
            a[0] = arguments[0];
            a[1] = arguments[1];
            a[2] = arguments[2];
            a[3] = arguments[3];
            a[4] = arguments[4];
            a[5] = arguments[5];
            a[6] = arguments[6];
            a[7] = arguments[7];
            a[8] = arguments[8];
            return this;
        },

        /**
         * Translate the matrix by x & y
         * @name translate
         * @memberOf me.Matrix3d
         * @function
         * @param {Number} x - the x coordinate to translate by
         * @param {Number} y - the y coordinate to translate by
         * @return {me.Matrix3d} this matrix for chaining
         */
        translate : function (x, y) {
            var a = this.val;
            a[6] = x * a[0] + y * a[3] + a[6];
            a[7] = x * a[1] + y * a[4] + a[7];
            a[8] = x * a[2] + y * a[5] + a[8];
            return this;
        },
        
        /**
         * translate the matrix the matrix
         * @name translateV
         * @memberOf me.Matrix3d
         * @function
         * @param {me.Vector2d} v the vector to translate the matrix by
         * @return {me.Matrix3d} this matrix for chaining
         */
        translateV : function (v) {
            return this.translate(v.x, v.y);
        },

        /**
         * Sets the matrix to the specified values from a Matrix2d
         * Created to support the original canvas method on the webgl renderer
         * @name transform
         * @memberOf me.Matrix3d
         * @function
         * @param {Number} a the m1,1 (m11) value in the matrix
         * @param {Number} b the m1,2 (m12) value in the matrix
         * @param {Number} d the m2,1 (m21) value in the matrix
         * @param {Number} e the m2,2 (m12) value in the matrix
         * @param {Number} c the m1,3
         * @param {Number} f the m2,3
         * @return {me.Matrix3d} this matrix for chaining
         */
        transform : function (a, b, c, d, e, f) {
            var m = this.val;
            m[0] = a;
            m[1] = c;
            m[2] = e;
            m[3] = b;
            m[4] = d;
            m[5] = f;
            m[6] = 0;
            m[7] = 0;
            m[8] = 1;
            return this;
        },

        /**
         * Transpose the matrix. Returns self
         * @name transpose
         * @memberOf me.Matrix3d
         * @function
         * @return {me.Matrix3d} this matrix for chaining
         */
        transpose : function () {
            var a = this.val,
                a01 = a[1],
                a02 = a[2],
                a12 = a[5];
            a[1] = a[3];
            a[2] = a[6];
            a[3] = a01;
            a[5] = a[7];
            a[6] = a02;
            a[7] = a12;
            return this;
        },
        
        /**
         * convert the object to a string representation
         * @name toString
         * @memberOf me.Matrix3d
         * @function
         * @return {String}
         */
        toString : function () {
            var a = this.val;
            return "mat3d(" + a[0] + ", " + a[1] + ", " + a[2] + ", " +
                a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */

(function () {

    /**
     * a Generic Body Object <br>
     * @class
     * @extends me.Rect
     * @memberOf me
     * @constructor
     * @param {me.Entity} entity the parent entity
     * @param {me.Polygon[]|me.Line[]|me.Ellipse[]} [shapes] the initial list of shapes
     */
    me.Body = me.Rect.extend(
    /** @scope me.Body.prototype */
    {
        /** @ignore */
        init : function (entity, shapes) {

            /**
             * reference to the parent entity
             * @ignore
             */
            this.entity = entity;

            /**
             * The collision shapes of the entity <br>
             * @ignore
             * @type {me.Polygon[]|me.Line[]|me.Ellipse[]}
             * @name shapes
             * @memberOf me.Body
             */
            this.shapes = shapes || [];

            /**
             * The body collision mask, that defines what should collide with what.<br>
             * (by default will collide with all entities)
             * @ignore
             * @type Number
             * @name collisionMask
             * @see me.collision.types
             * @memberOf me.Body
             */
            this.collisionMask = me.collision.types.ALL_OBJECT;

            /**
             * define the collision type of the body for collision filtering
             * @public
             * @type Number
             * @name collisionType
             * @see me.collision.types
             * @memberOf me.Body
             * @example
             * // set the entity body collision type
             * myEntity.body.collisionType = me.collision.types.PLAYER_OBJECT;
             */
            this.collisionType = me.collision.types.ENEMY_OBJECT;

            /**
             * entity current velocity<br>
             * @public
             * @type me.Vector2d
             * @name vel
             * @memberOf me.Body
             */
            if (typeof(this.vel) === "undefined") {
                this.vel = new me.Vector2d();
            }
            this.vel.set(0, 0);

            /**
             * entity current acceleration<br>
             * @public
             * @type me.Vector2d
             * @name accel
             * @memberOf me.Body
             */
            if (typeof(this.accel) === "undefined") {
                this.accel = new me.Vector2d();
            }
            this.accel.set(0, 0);

            /**
             * entity current friction<br>
             * @public
             * @name friction
             * @memberOf me.Body
             */
            if (typeof(this.friction) === "undefined") {
                this.friction = new me.Vector2d();
            }
            this.friction.set(0, 0);

            /**
             * max velocity (to limit entity velocity)<br>
             * @public
             * @type me.Vector2d
             * @name maxVel
             * @memberOf me.Body
             */
            if (typeof(this.maxVel) === "undefined") {
                this.maxVel = new me.Vector2d();
            }
            this.maxVel.set(1000, 1000);

            /**
             * Default gravity value of the entity<br>
             * default value : 0.98 (earth gravity)<br>
             * to be set to 0 for RPG, shooter, etc...<br>
             * Note: Gravity can also globally be defined through me.sys.gravity
             * @public
             * @see me.sys.gravity
             * @type Number
             * @name gravity
             * @memberOf me.Body
             */
            this.gravity = typeof(me.sys.gravity) !== "undefined" ? me.sys.gravity : 0.98;

            /**
             * falling state of the object<br>
             * true if the object is falling<br>
             * false if the object is standing on something<br>
             * @readonly
             * @public
             * @type Boolean
             * @name falling
             * @memberOf me.Body
             */
            this.falling = false;

            /**
             * jumping state of the object<br>
             * equal true if the entity is jumping<br>
             * @readonly
             * @public
             * @type Boolean
             * @name jumping
             * @memberOf me.Body
             */
            this.jumping = true;

            // call the super constructor
            this._super(
                me.Rect,
                // bounds the body by default
                // to the parent entity
                "init", [
                    0,
                    0,
                    entity.width,
                    entity.height
                ]
            );
        },

        /**
         * add a collision shape to this entity <br>
         * (note: me.Rect objects will be converted to me.Polygon before being added)
         * @name addShape
         * @memberOf me.Body
         * @public
         * @function
         * @param {me.Rect|me.Polygon|me.Line|me.Ellipse} shape a shape object
         * @return {Number} the shape array length
         */
        addShape : function (shape) {
            if (shape.shapeType === "Rectangle") {
                // ensure that rect shape are managed as polygon
                this.shapes.push(shape.toPolygon());
            } else {
                // else polygon or circle
                this.shapes.push(shape);
            }

            // update the body bounds to take in account the added shape
            this.updateBounds();

            // return the length of the shape list
            return this.shapes.length;
        },

        /**
         * return the collision shape at the given index
         * @name getShape
         * @memberOf me.Body
         * @public
         * @function
         * @param {Number} [index=0] the shape object at the specified index
         * @return {me.Polygon|me.Line|me.Ellipse} shape a shape object
         */
        getShape : function (index) {
            return this.shapes[index || 0];
        },

        /**
         * remove the specified shape from the body shape list
         * @name removeShape
         * @memberOf me.Body
         * @public
         * @function
         * @param {me.Polygon|me.Line|me.Ellipse} shape a shape object
         * @return {Number} the shape array length
         */
        removeShape : function (shape) {
            this.shapes.remove(shape);

            // update the body bounds to take in account the removed shape
            this.updateBounds();

            // return the length of the shape list
            return this.shapes.length;
        },

        /**
         * remove the shape at the given index from the body shape list
         * @name removeShapeAt
         * @memberOf me.Body
         * @public
         * @function
         * @param {Number} index the shape object at the specified index
         * @return {Number} the shape array length
         */
        removeShapeAt : function (index) {
            return this.removeShape(this.getShape(index));
        },

        /**
         * By default all entities are able to collide with all other entities, <br>
         * but it's also possible to specificy 'collision filters' to provide a finer <br>
         * control over which entities can collide with each other.
         * @name setCollisionMask
         * @memberOf me.Body
         * @public
         * @function
         * @see me.collision.types
         * @param {Number} bitmask the collision mask
         * @example
         * // filter collision detection with collision shapes, enemies and collectables
         * myEntity.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.ENEMY_OBJECT | me.collision.types.COLLECTABLE_OBJECT);
         * ...
         * // disable collision detection with all other objects
         * myEntity.body.setCollisionMask(me.collision.types.NO_OBJECT);
         */
        setCollisionMask : function (bitmask) {
            this.collisionMask = bitmask;
        },

        /**
         * the built-in function to solve the collision response
         * @protected
         * @name respondToCollision
         * @memberOf me.Body
         * @function
         * @param {me.collision.ResponseObject} response the collision response object
         */
        respondToCollision: function (response) {
            // the overlap vector
            var overlap = response.overlapV;

            // FIXME: Respond proportionally to object mass

            // Move out of the other object shape
            this.entity.pos.sub(overlap);

            // adjust velocity
            if (overlap.x !== 0) {
                this.vel.x = ~~(0.5 + this.vel.x - overlap.x) || 0;
            }
            if (overlap.y !== 0) {
                this.vel.y = ~~(0.5 + this.vel.y - overlap.y) || 0;

                // cancel the falling an jumping flags if necessary
                this.falling = overlap.y >= 1;
                this.jumping = overlap.y <= -1;
            }

            // update the other entity bounds
            this.entity.updateBounds();
        },

        /**
         * update the body bounding rect (private)
         * the body rect size is here used to cache the total bounding rect
         * @protected
         * @name updateBounds
         * @memberOf me.Body
         * @function
         */
        updateBounds : function () {
            if (this.shapes.length > 0) {
                // reset the rect with default values
                var _bounds = this.shapes[0].getBounds();
                this.pos.setV(_bounds.pos);
                this.resize(_bounds.width, _bounds.height);

                for (var i = 1 ; i < this.shapes.length; i++) {
                    this.union(this.shapes[i].getBounds());
                }
            }

            // update the parent entity bounds
            this.entity.updateBounds();

            return this;
        },

        /**
         * set the entity default velocity<br>
         * note : velocity is by default limited to the same value, see
         * setMaxVelocity if needed<br>
         * @name setVelocity
         * @memberOf me.Body
         * @function
         * @param {Number} x velocity on x axis
         * @param {Number} y velocity on y axis
         * @protected
         */
        setVelocity : function (x, y) {
            this.accel.x = x !== 0 ? x : this.accel.x;
            this.accel.y = y !== 0 ? y : this.accel.y;

            // limit by default to the same max value
            this.setMaxVelocity(x, y);
        },

        /**
         * cap the entity velocity to the specified value<br>
         * @name setMaxVelocity
         * @memberOf me.Body
         * @function
         * @param {Number} x max velocity on x axis
         * @param {Number} y max velocity on y axis
         * @protected
         */
        setMaxVelocity : function (x, y) {
            this.maxVel.x = x;
            this.maxVel.y = y;
        },

        /**
         * set the entity default friction<br>
         * @name setFriction
         * @memberOf me.Body
         * @function
         * @param {Number} x horizontal friction
         * @param {Number} y vertical friction
         * @protected
         */
        setFriction : function (x, y) {
            this.friction.x = x || 0;
            this.friction.y = y || 0;
        },

        /**
         * compute the new velocity value
         * @ignore
         */
        computeVelocity : function (vel) {

            // apply gravity (if any)
            if (this.gravity) {
                // apply a constant gravity (if not on a ladder)
                vel.y += this.gravity * me.timer.tick;

                // check if falling / jumping
                this.falling = (vel.y > 0);
                this.jumping = (this.falling ? false : this.jumping);
            }

            // apply friction
            if (this.friction.x) {
                vel.x = me.utils.applyFriction(vel.x, this.friction.x);
            }
            if (this.friction.y) {
                vel.y = me.utils.applyFriction(vel.y, this.friction.y);
            }

            // cap velocity
            if (vel.y !== 0) {
                vel.y = vel.y.clamp(-this.maxVel.y, this.maxVel.y);
            }
            if (vel.x !== 0) {
                vel.x = vel.x.clamp(-this.maxVel.x, this.maxVel.x);
            }
        },

        /**
         * update the body position
         * @name update
         * @memberOf me.Body
         * @function
         * @return {boolean} true if resulting velocity is different than 0
         */
        update : function (/* dt */) {
            // update the velocity
            this.computeVelocity(this.vel);

            // update player entity position
            this.entity.pos.add(this.vel);

            // update the entity and body bounds
            this.entity.updateBounds();

            // returns true if vel is different from 0
            return (this.vel.x !== 0 || this.vel.y !== 0);
        },

        /**
         * Destroy function<br>
         * @ignore
         */
        destroy : function () {
            this.entity = null;
            this.shapes = [];
        }
    });

    /**
     * Base class for Body exception handling.
     * @name Error
     * @class
     * @memberOf me.Body
     * @constructor
     * @param {String} msg Error message.
     */
    me.Body.Error = me.Error.extend({
        init : function (msg) {
            me.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Body.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 * A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.
 * Based on the QuadTree Library by Timo Hausmann and released under the MIT license
 * https://github.com/timohausmann/quadtree-js/
**/

(function () {


    /**
     * a pool of `QuadTree` objects
     */
    var QT_ARRAY = [];
    
    /**
     * will pop a quadtree object from the array
     * or create a new one if the array is empty
     */
    var QT_ARRAY_POP = function (bounds, max_objects, max_levels, level) {
        if (QT_ARRAY.length > 0) {
            var _qt =  QT_ARRAY.pop();
            _qt.bounds = bounds;
            _qt.max_objects = max_objects || 4;
            _qt.max_levels  = max_levels || 4;
            _qt.level = level || 0;
            return _qt;
        } else {
            return new me.QuadTree(bounds, max_objects, max_levels, level);
        }
    };
    
    /**
     * Push back a quadtree back into the array
     */
    var QT_ARRAY_PUSH = function (qt) {
        QT_ARRAY.push(qt);
    };
    

    /**
     * Quadtree Constructor <br>
     * note: the global quadtree instance is available through `me.collision.quadTree`
     * @class
     * @name QuadTree
     * @extends Object
     * @memberOf me
     * @constructor
     * @see me.collision.quadTree
     * @param {me.Rect} bounds bounds of the node
     * @param {external:Number} [max_objects=4] max objects a node can hold before splitting into 4 subnodes
     * @param {external:Number} [max_levels=4] total max levels inside root Quadtree
     * @param {external:Number} [level] deepth level, required for subnodes
     */
    function Quadtree(bounds, max_objects, max_levels, level) {
        this.max_objects = max_objects || 4;
        this.max_levels  = max_levels || 4;

        this.level = level || 0;
        this.bounds = bounds;

        this.objects = [];
        this.nodes = [];
    }


    /*
     * Split the node into 4 subnodes
     */
    Quadtree.prototype.split = function () {

        var nextLevel = this.level + 1,
            subWidth  = ~~(0.5 + this.bounds.width / 2),
            subHeight = ~~(0.5 + this.bounds.height / 2),
            x = ~~(0.5 + this.bounds.pos.x),
            y = ~~(0.5 + this.bounds.pos.y);

         //top right node
        this.nodes[0] = QT_ARRAY_POP({
            pos : {
                x : x + subWidth,
                y : y
            },
            width : subWidth,
            height : subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        //top left node
        this.nodes[1] = QT_ARRAY_POP({
            pos : {
                x : x,
                y : y
            },
            width : subWidth,
            height : subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        //bottom left node
        this.nodes[2] = QT_ARRAY_POP({
            pos : {
                x : x,
                y : y + subHeight
            },
            width : subWidth,
            height : subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        //bottom right node
        this.nodes[3] = QT_ARRAY_POP({
            pos : {
                x : x + subWidth,
                y : y + subHeight
            },
            width : subWidth,
            height : subHeight
        }, this.max_objects, this.max_levels, nextLevel);
    };


    /*
     * Determine which node the object belongs to
     * @param {me.Rect} rect bounds of the area to be checked
     * @return Integer index of the subnode (0-3), or -1 if rect cannot completely fit within a subnode and is part of the parent node
     */
    Quadtree.prototype.getIndex = function (rect) {

        var index = -1,
            verticalMidpoint = this.bounds.pos.x + (this.bounds.width / 2),
            horizontalMidpoint = this.bounds.pos.y + (this.bounds.height / 2),
            //rect can completely fit within the top quadrants
            topQuadrant = (rect.pos.y < horizontalMidpoint && rect.pos.y + rect.height < horizontalMidpoint),
            //rect can completely fit within the bottom quadrants
            bottomQuadrant = (rect.pos.y > horizontalMidpoint);

        //rect can completely fit within the left quadrants
        if (rect.pos.x < verticalMidpoint && rect.pos.x + rect.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        } else if (rect.pos.x > verticalMidpoint) {
            //rect can completely fit within the right quadrants
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    };

    /**
     * Insert the given object container into the node.
     * @name insertContainer
     * @memberOf me.QuadTree
     * @function
     * @param {me.Container} container group of objects to be added
     */
    Quadtree.prototype.insertContainer = function (container) {
        for (var i = container.children.length, child; i--, (child = container.children[i]);) {
            if (child instanceof me.Container) {
                // recursivly insert childs
                this.insertContainer(child);
            } else {
                // only insert object with a "physic body"
                if (typeof (child.body) !== "undefined") {
                    this.insert(child);
                }
            }
        }
    };

    /**
     * Insert the given object into the node. If the node
     * exceeds the capacity, it will split and add all
     * objects to their corresponding subnodes.
     * @name insert
     * @memberOf me.QuadTree
     * @function
     * @param {external:Object} item object to be added
     */
    Quadtree.prototype.insert = function (item) {

        var index = -1;
        
        //if we have subnodes ...
        if (this.nodes.length > 0) {
            index = this.getIndex(item.getBounds());

            if (index !== -1) {
                this.nodes[index].insert(item);
                return;
            }
        }

        this.objects.push(item);

        if (this.objects.length > this.max_objects && this.level < this.max_levels) {

            //split if we don't already have subnodes
            if (this.nodes.length === 0) {
                this.split();
            }

            var i = 0;

            //add all objects to there corresponding subnodes
            while (i < this.objects.length) {

                index = this.getIndex(this.objects[i].getBounds());

                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i = i + 1;
                }
            }
        }
    };

    /**
     * Return all objects that could collide with the given object
     * @name retrieve
     * @memberOf me.QuadTree
     * @function
     * @param {external:Object} object object to be checked against
     * @return {external:Object[]} array with all detected objects
     */
    Quadtree.prototype.retrieve = function (item) {
        
        var returnObjects = this.objects;

        //if we have subnodes ...
        if (this.nodes.length > 0) {

            var index = this.getIndex(item.getBounds());

            //if rect fits into a subnode ..
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(item));
            } else {
                 //if rect does not fit into a subnode, check it against all subnodes
                for (var i = 0; i < this.nodes.length; i = i + 1) {
                    returnObjects = returnObjects.concat(this.nodes[i].retrieve(item));
                }
            }
        }

        return returnObjects;
    };


    /**
     * clear the quadtree
     * @name clear
     * @memberOf me.QuadTree
     * @function
     */
    Quadtree.prototype.clear = function (bounds) {

        this.objects = [];

        for (var i = 0; i < this.nodes.length; i = i + 1) {
            this.nodes[i].clear(bounds);
            // recycle the quadTree object
            QT_ARRAY_PUSH(this.nodes[i]);
        }
        // empty the array
        this.nodes = [];
        
        // resize the root bounds if required
        if (typeof bounds !== "undefined") {
            this.bounds.pos.x = bounds.pos.x;
            this.bounds.pos.y = bounds.pos.y;
            this.bounds.width = bounds.width;
            this.bounds.height = bounds.height;
        }
    };

    //make Quadtree available in the me namespace
    me.QuadTree = Quadtree;

})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 * Separating Axis Theorem implementation, based on the SAT.js library by Jim Riecken <jimr@jimr.ca>
 * Available under the MIT License - https://github.com/jriecken/sat-js
 */

(function () {

    /**
     * Constants for Vornoi regions
     * @ignore
     */
    var LEFT_VORNOI_REGION = -1;

    /**
     * Constants for Vornoi regions
     * @ignore
     */
    var MIDDLE_VORNOI_REGION = 0;

    /**
     * Constants for Vornoi regions
     * @ignore
     */
    var RIGHT_VORNOI_REGION = 1;


    /**
     * A pool of `Vector` objects that are used in calculations to avoid allocating memory.
     * @type {Array.<Vector>}
     */
    var T_VECTORS = [];
    for (var v = 0; v < 10; v++) { T_VECTORS.push(new me.Vector2d()); }

    /**
     * A pool of arrays of numbers used in calculations to avoid allocating memory.
     * @type {Array.<Array.<number>>}
     */
    var T_ARRAYS = [];
    for (var a = 0; a < 5; a++) { T_ARRAYS.push([]); }


    /**
     * Flattens the specified array of points onto a unit vector axis,
     * resulting in a one dimensional range of the minimum and
     * maximum value on that axis.
     * @param {Array.<Vector>} points The points to flatten.
     * @param {Vector} normal The unit vector axis to flatten on.
     * @param {Array.<number>} result An array.  After calling this function,
     *   result[0] will be the minimum value,
     *   result[1] will be the maximum value.
     */
    function flattenPointsOn(points, normal, result) {
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        var len = points.length;
        for (var i = 0; i < len; i++) {
            // The magnitude of the projection of the point onto the normal
            var dot = points[i].dotProduct(normal);
            if (dot < min) { min = dot; }
            if (dot > max) { max = dot; }
        }
        result[0] = min;
        result[1] = max;
    }

    /**
     * Check whether two convex polygons are separated by the specified
     * axis (must be a unit vector).
     * @param {Vector} aPos The position of the first polygon.
     * @param {Vector} bPos The position of the second polygon.
     * @param {Array.<Vector>} aPoints The points in the first polygon.
     * @param {Array.<Vector>} bPoints The points in the second polygon.
     * @param {Vector} axis The axis (unit sized) to test against.  The points of both polygons
     *   will be projected onto this axis.
     * @param {Response=} response A Response object (optional) which will be populated
     *   if the axis is not a separating axis.
     * @return {boolean} true if it is a separating axis, false otherwise.  If false,
     *   and a response is passed in, information about how much overlap and
     *   the direction of the overlap will be populated.
     */
    function isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis, response) {
        var rangeA = T_ARRAYS.pop();
        var rangeB = T_ARRAYS.pop();
        // The magnitude of the offset between the two polygons
        var offsetV = T_VECTORS.pop().copy(bPos).sub(aPos);
        var projectedOffset = offsetV.dotProduct(axis);

        // Project the polygons onto the axis.
        flattenPointsOn(aPoints, axis, rangeA);
        flattenPointsOn(bPoints, axis, rangeB);
        // Move B's range to its position relative to A.
        rangeB[0] += projectedOffset;
        rangeB[1] += projectedOffset;
        // Check if there is a gap. If there is, this is a separating axis and we can stop
        if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
            T_VECTORS.push(offsetV);
            T_ARRAYS.push(rangeA);
            T_ARRAYS.push(rangeB);
            return true;
        }

        // This is not a separating axis. If we're calculating a response, calculate the overlap.
        if (response) {
            var overlap = 0;
            // A starts further left than B
            if (rangeA[0] < rangeB[0]) {
                response.aInB = false;
                // A ends before B does. We have to pull A out of B
                if (rangeA[1] < rangeB[1]) {
                    overlap = rangeA[1] - rangeB[0];
                    response.bInA = false;
                // B is fully inside A.  Pick the shortest way out.
                } else {
                    var option1 = rangeA[1] - rangeB[0];
                    var option2 = rangeB[1] - rangeA[0];
                    overlap = option1 < option2 ? option1 : -option2;
                }
            // B starts further left than A
            } else {
                response.bInA = false;
                // B ends before A ends. We have to push A out of B
                if (rangeA[1] > rangeB[1]) {
                    overlap = rangeA[0] - rangeB[1];
                    response.aInB = false;
                // A is fully inside B.  Pick the shortest way out.
                } else {
                    var option11 = rangeA[1] - rangeB[0];
                    var option22 = rangeB[1] - rangeA[0];
                    overlap = option11 < option22 ? option11 : -option22;
                }
            }

            // If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
            var absOverlap = Math.abs(overlap);
            if (absOverlap < response.overlap) {
                response.overlap = absOverlap;
                response.overlapN.copy(axis);
                if (overlap < 0) {
                    response.overlapN.reverse();
                }
            }
        }
        T_VECTORS.push(offsetV);
        T_ARRAYS.push(rangeA);
        T_ARRAYS.push(rangeB);
        return false;
    }


    /**
     * Calculates which Vornoi region a point is on a line segment. <br>
     * It is assumed that both the line and the point are relative to `(0,0)`<br>
     * <br>
     *             |       (0)      |<br>
     *      (-1)  [S]--------------[E]  (1)<br>
     *             |       (0)      |<br>
     *
     * @ignore
     * @param {Vector} line The line segment.
     * @param {Vector} point The point.
     * @return  {number} LEFT_VORNOI_REGION (-1) if it is the left region,
     *          MIDDLE_VORNOI_REGION (0) if it is the middle region,
     *          RIGHT_VORNOI_REGION (1) if it is the right region.
     */
    function vornoiRegion(line, point) {
        var len2 = line.length2();
        var dp = point.dotProduct(line);
        if (dp < 0) {
            // If the point is beyond the start of the line, it is in the
            // left vornoi region.
            return LEFT_VORNOI_REGION;
        } else if (dp > len2) {
            // If the point is beyond the end of the line, it is in the
            // right vornoi region.
            return RIGHT_VORNOI_REGION;
        } else {
            // Otherwise, it's in the middle one.
            return MIDDLE_VORNOI_REGION;
        }
    }

    /**
     * A singleton for managing collision detection (and projection-based collision response) of 2D shapes.<br>
     * Based on the Separating Axis Theorem and supports detecting collisions between simple Axis-Aligned Boxes, convex polygons and circles based shapes.
     * @namespace
     * @property {Singleton} collision
     * @memberOf me
     */
    me.collision = (function () {
        // hold public stuff in our singleton
        var api = {};

        /*
         * PUBLIC STUFF
         */

        /**
         * the world quadtree used for the collision broadphase
         * @name quadTree
         * @memberOf me.collision
         * @public
         * @type {me.QuadTree}
         */
        api.quadTree = null;

        /**
         * The maximum number of levels that the quadtree will create. Default is 4.
         * @name maxDepth
         * @memberOf me.collision
         * @public
         * @type {number}
         * @see me.collision.quadTree
         *
         */
        api.maxDepth = 4;

        /**
         * The maximum number of children that a quadtree node can contain before it is split into sub-nodes. Default is 8.
         * @name maxChildren
         * @memberOf me.collision
         * @public
         * @type {boolean}
         * @see me.collision.quadTree
         */
        api.maxChildren = 8;

       /**
         * bounds of the physic world.
         * @name bounds
         * @memberOf me.collision
         * @public
         * @type {me.Rect}
         */
        api.bounds = null;

        /**
         * Enum for collision type values. <br>
         * Possible values are : <br>
         * - <b>`NO_OBJECT`</b> (to disable collision check) <br>
         * - <b>`PLAYER_OBJECT`</b> <br>
         * - <b>`NPC_OBJECT`</b> <br>
         * - <b>`ENEMY_OBJECT`</b> <br>
         * - <b>`COLLECTABLE_OBJECT`</b> <br>
         * - <b>`ACTION_OBJECT`</b> <br>
         * - <b>`PROJECTILE_OBJECT`</b> <br>
         * - <b>`WORLD_SHAPE`</b> (for collision check with collision shapes/tiles) <br>
         * - <b>`ALL_OBJECT`</b> <br>
         * @readonly
         * @enum {number}
         * @name types
         * @memberOf me.collision
         * @see me.body.setCollisionMask
         * @see me.body.collisionType
         * @example
         * // set the entity body collision type
         * myEntity.body.setCollisionType = me.collision.types.PLAYER_OBJECT;
         * // filter collision detection with collision shapes, enemies and collectables
         * myEntity.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.ENEMY_OBJECT | me.collision.types.COLLECTABLE_OBJECT);
         */
        api.types = {
            /** to disable collision check */
            NO_OBJECT : 0,

            /**
             * Default object type constant for collision filtering
             * @constant
             * @name PLAYER_OBJECT
             * @memberOf me.collision.types
             */
            PLAYER_OBJECT : 1,

            /**
             * Default object type constant for collision filtering
             * @constant
             * @name NPC_OBJECT
             * @memberOf me.collision.types
             */
            NPC_OBJECT : 2,

            /**
             * Default object type constant for collision filtering
             * @constant
             * @name ENEMY_OBJECT
             * @memberOf me.collision.types
             */
            ENEMY_OBJECT : 4,

            /**
             * Default object type constant for collision filtering
             * @constant
             * @name COLLECTABLE_OBJECT
             * @memberOf me.collision.types
             */
            COLLECTABLE_OBJECT : 8,

            /**
             * Default object type constant for collision filtering
             * @constant
             * @name ACTION_OBJECT
             * @memberOf me.collision.types
             */
            ACTION_OBJECT : 16, // door, etc...

            /**
             * Default object type constant for collision filtering
             * @constant
             * @name PROJECTILE_OBJECT
             * @memberOf me.collision.types
             */
            PROJECTILE_OBJECT : 32, // missiles, etc...

            /**
             * Default object type constant for collision filtering
             * @constant
             * @name WORLD_SHAPE
             * @memberOf me.collision.types
             */
            WORLD_SHAPE : 64, // walls, etc...

            /**
             * Default object type constant for collision filtering
             * @constant
             * @name ALL_OBJECT
             * @memberOf me.collision.types
             */
            ALL_OBJECT : 0xFFFFFFFF // all objects
        };

        /**
         * Initialize the collision/physic world
         * @ignore
         */
        api.init = function () {
            // default bounds to the game viewport
            api.bounds = me.game.viewport.clone();
            // initializa the quadtree
            api.quadTree = new me.QuadTree(api.bounds, api.maxChildren, api.maxDepth);

            // reset the collision detection engine if a TMX level is loaded
            me.event.subscribe(me.event.LEVEL_LOADED, function () {
                // default bounds to game world
                me.collision.bounds = me.game.world.clone();
                // reset the quadtree
                me.collision.quadTree.clear(me.collision.bounds);
            });
        };

        /**
         * An object representing the result of an intersection, contains: <br>
         *  - <b>`a`</b> and <b>`b`</b> {me.Entity} : The two objects participating in the intersection <br>
         *  - <b>`overlap`</b> {number} : Magnitude of the overlap on the shortest colliding axis. <br>
         *  - <b>`overlapV`</b> {me.vector2d}: The overlap vector (i.e. `overlapN.scale(overlap, overlap)`). If this vector is subtracted from the position of a, a and b will no longer be colliding <br>
         *  - <b>`overlapN`</b> {me.vector2d}: The shortest colliding axis (unit-vector) <br>
         *  - <b>`aInB`</b>, <b>`bInA`</b> {boolean} : Whether the first object is entirely inside the second, and vice versa. <br>
         *  - <b>`indexShapeA</b> {number} : the index of the colliding shape for the object a body. <br>
         *  - <b>`indexShapeB</b> {number} : the index of the colliding shape for the object b body. <br>
         *  - <b>`clear()`</b> {function} :  Set some values of the response back to their defaults. Call this between tests if you are going to reuse a single Response object for multiple intersection tests <br>
         * @name ResponseObject
         * @memberOf me.collision
         * @public
         * @type {external:Object}
         * @see me.collision.check
         */
        api.ResponseObject = function () {
            this.a = null;
            this.b = null;
            this.overlapN = new me.Vector2d();
            this.overlapV = new me.Vector2d();
            this.aInB = true;
            this.bInA = true;
            this.indexShapeA = -1;
            this.indexShapeB = -1;
            this.overlap = Number.MAX_VALUE;
        };

        /**
         * Set some values of the response back to their defaults. <br>
         * Call this between tests if you are going to reuse a single <br>
         * Response object for multiple intersection tests <br>
         * (recommended as it will avoid allocating extra memory) <br>
         * @name clear
         * @memberOf me.collision.ResponseObject
         * @public
         * @function
         */
        api.ResponseObject.prototype.clear = function () {
            this.aInB = true;
            this.bInA = true;
            this.overlap = Number.MAX_VALUE;
            this.indexShapeA = -1;
            this.indexShapeB = -1;
            return this;
        };

        /**
         * a global instance of a response object used for collision detection <br>
         * this object will be reused amongst collision detection call if not user-defined response is specified
         * @name response
         * @memberOf me.collision
         * @public
         * @type {me.collision.ResponseObject}
         */
        api.response = new api.ResponseObject();

        /**
         * a callback used to determine if two objects should collide (based on both respective objects collision mask and type).<br>
         * you can redefine this function if you need any specific rules over what should collide with what.
         * @name shouldCollide
         * @memberOf me.collision
         * @public
         * @function
         * @param {me.Entity} a a reference to the object A.
         * @param {me.Entity} b a reference to the object B.
         * @return {Boolean} true if they should collide, false otherwise
         */
        api.shouldCollide = function (a, b) {
            return (
                a.body && b.body &&
                (a.body.collisionMask & b.body.collisionType) !== 0 &&
                (a.body.collisionType & b.body.collisionMask) !== 0
            );
        };

        /**
         * Checks if the specified entity collides with others entities
         * @name check
         * @memberOf me.collision
         * @public
         * @function
         * @param {me.Entity} obj entity to be tested for collision
         * @param {me.collision.ResponseObject} [respObj=me.collision.response] a user defined response object that will be populated if they intersect.
         * @return {Boolean} in case of collision, false otherwise
         * @example
         * update : function (dt) {
         *    ...
         *    // handle collisions against other shapes
         *    me.collision.check(this);
         *    ...
         * };
         *
         * // colision handler
         * onCollision : function (response) {
         *     if (response.b.body.collisionType === me.collision.types.ENEMY_OBJECT) {
         *         // makes the other entity solid, by substracting the overlap vector to the current position
         *         this.pos.sub(response.overlapV);
         *         this.hurt();
         *         // not solid
         *         return false;
         *     }
         *     // Make the object solid
         *     return true;
         * };
         */
        api.check = function (objA, responseObject) {
            var collision = 0;
            var response = responseObject || api.response;

            // retreive a list of potential colliding objects
            var candidates = api.quadTree.retrieve(objA);

            for (var i = candidates.length, objB; i--, (objB = candidates[i]);) {

                // check if both objects "should" collide
                if ((objB !== objA) && api.shouldCollide(objA, objB) &&
                    // fast AABB check if both bounding boxes are overlaping
                    objA.getBounds().overlaps(objB.getBounds())) {

                    // go trough all defined shapes in A
                    var aLen = objA.body.shapes.length;
                    var bLen = objB.body.shapes.length;
                    if (aLen === 0 || bLen === 0) {
                        continue;
                    }

                    var indexA = 0;
                    do {
                        var shapeA = objA.body.getShape(indexA);
                        // go through all defined shapes in B
                        var indexB = 0;
                        do {
                            var shapeB = objB.body.getShape(indexB);

                            // full SAT collision check
                            if (api["test" + shapeA.shapeType + shapeB.shapeType]
                                .call(
                                    this,
                                    objA, // a reference to the object A
                                    shapeA,
                                    objB,  // a reference to the object B
                                    shapeB,
                                     // clear response object before reusing
                                    response.clear()) === true
                            ) {
                                // we touched something !
                                collision++;

                                // set the shape index
                                response.indexShapeA = indexA;
                                response.indexShapeB = indexB;

                                // execute the onCollision callback
                                if (objA.onCollision(response, objB) !== false) {
                                    objA.body.respondToCollision.call(objA.body, response);
                                }
                                if (objB.onCollision(response, objA) !== false) {
                                    objB.body.respondToCollision.call(objB.body, response);
                                }
                            }
                            indexB++;
                        } while (indexB < bLen);
                        indexA++;
                    } while (indexA < aLen);
                }
            }
            // we could return the amount of objects we collided with ?
            return collision > 0;
        };

        /**
         * Checks whether polygons collide.
         * @ignore
         * @param {me.Entity} a a reference to the object A.
         * @param {me.Polygon} polyA a reference to the object A Polygon to be tested
         * @param {me.Entity} b a reference to the object B.
         * @param {me.Polygon} polyB a reference to the object B Polygon to be tested
         * @param {Response=} response Response object (optional) that will be populated if they intersect.
         * @return {boolean} true if they intersect, false if they don't.
         */
        api.testPolygonPolygon = function (a, polyA, b, polyB, response) {
            // specific point for
            var aPoints = polyA.points;
            var aNormals = polyA.normals;
            var aLen = aNormals.length;
            var bPoints = polyB.points;
            var bNormals = polyB.normals;
            var bLen = bNormals.length;
            // aboslute shape position
            var posA = T_VECTORS.pop().copy(a.pos).add(polyA.pos);
            var posB = T_VECTORS.pop().copy(b.pos).add(polyB.pos);
            var i;

            // If any of the edge normals of A is a separating axis, no intersection.
            for (i = 0; i < aLen; i++) {
                if (isSeparatingAxis(posA, posB, aPoints, bPoints, aNormals[i], response)) {
                    T_VECTORS.push(posA);
                    T_VECTORS.push(posB);
                    return false;
                }
            }

            // If any of the edge normals of B is a separating axis, no intersection.
            for (i = 0;i < bLen; i++) {
                if (isSeparatingAxis(posA, posB, aPoints, bPoints, bNormals[i], response)) {
                    T_VECTORS.push(posA);
                    T_VECTORS.push(posB);
                    return false;
                }
            }

            // Since none of the edge normals of A or B are a separating axis, there is an intersection
            // and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
            // final overlap vector.
            if (response) {
                response.a = a;
                response.b = b;
                response.overlapV.copy(response.overlapN).scale(response.overlap);
            }
            T_VECTORS.push(posA);
            T_VECTORS.push(posB);
            return true;
        };

        /**
         * Check if two Ellipse collide.
         * @ignore
         * @param {me.Entity} a a reference to the object A.
         * @param {me.Ellipse} ellipseA a reference to the object A Ellipse to be tested
         * @param {me.Entity} b a reference to the object B.
         * @param {me.Ellipse} ellipseB a reference to the object B Ellipse to be tested
         * @param {Response=} response Response object (optional) that will be populated if
         *   the circles intersect.
         * @return {boolean} true if the circles intersect, false if they don't.
         */
        api.testEllipseEllipse = function (a, ellipseA, b, ellipseB, response) {
            // Check if the distance between the centers of the two
            // circles is greater than their combined radius.
            var differenceV = T_VECTORS.pop().copy(b.pos).add(ellipseB.pos).sub(a.pos).sub(ellipseA.pos);
            var radiusA = ellipseA.radius;
            var radiusB = ellipseB.radius;
            var totalRadius = radiusA + radiusB;
            var totalRadiusSq = totalRadius * totalRadius;
            var distanceSq = differenceV.length2();
            // If the distance is bigger than the combined radius, they don't intersect.
            if (distanceSq > totalRadiusSq) {
                T_VECTORS.push(differenceV);
                return false;
            }
            // They intersect.  If we're calculating a response, calculate the overlap.
            if (response) {
                var dist = Math.sqrt(distanceSq);
                response.a = a;
                response.b = b;
                response.overlap = totalRadius - dist;
                response.overlapN.copy(differenceV.normalize());
                response.overlapV.copy(differenceV).scale(response.overlap);
                response.aInB = radiusA <= radiusB && dist <= radiusB - radiusA;
                response.bInA = radiusB <= radiusA && dist <= radiusA - radiusB;
            }
            T_VECTORS.push(differenceV);
            return true;
        };

        /**
         * Check if a polygon and an ellipse collide.
         * @ignore
         * @param {me.Entity} a a reference to the object A.
         * @param {me.Polygon} polyA a reference to the object A Polygon to be tested
         * @param {me.Entity} b a reference to the object B.
         * @param {me.Ellipse} ellipseB a reference to the object B Ellipse to be tested
         * @param {Response=} response Response object (optional) that will be populated if they intersect.
         * @return {boolean} true if they intersect, false if they don't.
         */
        api.testPolygonEllipse = function (a, polyA, b, ellipseB, response) {
            // Get the position of the circle relative to the polygon.
            var circlePos = T_VECTORS.pop().copy(b.pos).add(ellipseB.pos).sub(a.pos).sub(polyA.pos);
            var radius = ellipseB.radius;
            var radius2 = radius * radius;
            var points = polyA.points;
            var edges = polyA.edges;
            var len = edges.length;
            var edge = T_VECTORS.pop();
            var normal = T_VECTORS.pop();
            var point = T_VECTORS.pop();
            var dist = 0;

            // For each edge in the polygon:
            for (var i = 0; i < len; i++) {
                var next = i === len - 1 ? 0 : i + 1;
                var prev = i === 0 ? len - 1 : i - 1;
                var overlap = 0;
                var overlapN = null;

                // Get the edge.
                edge.copy(edges[i]);
                // Calculate the center of the circle relative to the starting point of the edge.
                point.copy(circlePos).sub(points[i]);

                // If the distance between the center of the circle and the point
                // is bigger than the radius, the polygon is definitely not fully in
                // the circle.
                if (response && point.length2() > radius2) {
                    response.aInB = false;
                }

                // Calculate which Vornoi region the center of the circle is in.
                var region = vornoiRegion(edge, point);
                var inRegion = true;
                // If it's the left region:
                if (region === LEFT_VORNOI_REGION) {
                    var point2 = null;
                    if (len > 1) {
                        // We need to make sure we're in the RIGHT_VORNOI_REGION of the previous edge.
                        edge.copy(edges[prev]);
                        // Calculate the center of the circle relative the starting point of the previous edge
                        point2 = T_VECTORS.pop().copy(circlePos).sub(points[prev]);
                        region = vornoiRegion(edge, point2);
                        if (region !== RIGHT_VORNOI_REGION) {
                            inRegion = false;
                        }
                    }

                    if (inRegion) {
                        // It's in the region we want.  Check if the circle intersects the point.
                        dist = point.length();
                        if (dist > radius) {
                            // No intersection
                            T_VECTORS.push(circlePos);
                            T_VECTORS.push(edge);
                            T_VECTORS.push(normal);
                            T_VECTORS.push(point);
                            if (point2) {
                                T_VECTORS.push(point2);
                            }
                            return false;
                        } else if (response) {
                            // It intersects, calculate the overlap.
                            response.bInA = false;
                            overlapN = point.normalize();
                            overlap = radius - dist;
                        }
                    }

                    if (point2) {
                        T_VECTORS.push(point2);
                    }
                // If it's the right region:
                } else if (region === RIGHT_VORNOI_REGION) {
                    if (len > 1) {
                        // We need to make sure we're in the left region on the next edge
                        edge.copy(edges[next]);
                        // Calculate the center of the circle relative to the starting point of the next edge.
                        point.copy(circlePos).sub(points[next]);
                        region = vornoiRegion(edge, point);
                        if (region !== LEFT_VORNOI_REGION) {
                            inRegion = false;
                        }
                    }

                    if (inRegion) {
                        // It's in the region we want.  Check if the circle intersects the point.
                        dist = point.length();
                        if (dist > radius) {
                            // No intersection
                            T_VECTORS.push(circlePos);
                            T_VECTORS.push(edge);
                            T_VECTORS.push(normal);
                            T_VECTORS.push(point);
                            return false;
                        } else if (response) {
                            // It intersects, calculate the overlap.
                            response.bInA = false;
                            overlapN = point.normalize();
                            overlap = radius - dist;
                        }
                    }
                // Otherwise, it's the middle region:
                } else {
                    // Need to check if the circle is intersecting the edge,
                    // Get the normal.
                    normal.copy(polyA.normals[i]);
                    // Find the perpendicular distance between the center of the
                    // circle and the edge.
                    dist = point.dotProduct(normal);
                    var distAbs = Math.abs(dist);
                    // If the circle is on the outside of the edge, there is no intersection.
                    if ((len === 1 || dist > 0) && distAbs > radius) {
                        // No intersection
                        T_VECTORS.push(circlePos);
                        T_VECTORS.push(edge);
                        T_VECTORS.push(normal);
                        T_VECTORS.push(point);
                        return false;
                    } else if (response) {
                        // It intersects, calculate the overlap.
                        overlapN = normal;
                        overlap = radius - dist;
                        // If the center of the circle is on the outside of the edge, or part of the
                        // circle is on the outside, the circle is not fully inside the polygon.
                        if (dist >= 0 || overlap < 2 * radius) {
                            response.bInA = false;
                        }
                    }
                }

                // If this is the smallest overlap we've seen, keep it.
                // (overlapN may be null if the circle was in the wrong Vornoi region).
                if (overlapN && response && Math.abs(overlap) < Math.abs(response.overlap)) {
                    response.overlap = overlap;
                    response.overlapN.copy(overlapN);
                }
            }

            // Calculate the final overlap vector - based on the smallest overlap.
            if (response) {
                response.a = a;
                response.b = b;
                response.overlapV.copy(response.overlapN).scale(response.overlap);
            }
            T_VECTORS.push(circlePos);
            T_VECTORS.push(edge);
            T_VECTORS.push(normal);
            T_VECTORS.push(point);
            return true;
        };

        /**
         * Check if an ellipse and a polygon collide. <br>
         * **NOTE:** This is slightly less efficient than testPolygonEllipse as it just
         * runs testPolygonEllipse and reverses the response at the end.
         * @ignore
         * @param {me.Entity} a a reference to the object A.
         * @param {me.Ellipse} ellipseA a reference to the object A Ellipse to be tested
         * @param {me.Entity} a a reference to the object B.
         * @param {me.Polygon} polyB a reference to the object B Polygon to be tested
         * @param {Response=} response Response object (optional) that will be populated if
         *   they intersect.
         * @return {boolean} true if they intersect, false if they don't.
         */
        api.testEllipsePolygon = function (a, ellipseA, b, polyB, response) {
            // Test the polygon against the circle.
            var result = api.testPolygonEllipse(b, polyB, a, ellipseA, response);
            if (result && response) {
                // Swap A and B in the response.
                var resa = response.a;
                var aInB = response.aInB;
                response.overlapN.reverse();
                response.overlapV.reverse();
                response.a = response.b;
                response.b = resa;
                response.aInB = response.bInA;
                response.bInA = aInB;
            }
            return result;
        };

        // return our object
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {

    /**
     * A base class for renderable objects.
     * @class
     * @extends me.Rect
     * @memberOf me
     * @constructor
     * @param {Number} x position of the renderable object
     * @param {Number} y position of the renderable object
     * @param {Number} width object width
     * @param {Number} height object height
     */
    me.Renderable = me.Rect.extend(
    /** @scope me.Renderable.prototype */
    {
        /**
         * @ignore
         */
        init : function (x, y, width, height) {
            /**
             * to identify the object as a renderable object
             * @ignore
             */
            this.isRenderable = true;

           /**
            * (G)ame (U)nique (Id)entifier" <br>
            * a GUID will be allocated for any renderable object added <br>
            * to an object container (including the `me.game.world` container)
            * @public
            * @type String
            * @name GUID
            * @memberOf me.Renderable
            */
            this.GUID = undefined;

            /**
             * Whether the renderable object is visible and within the viewport<br>
             * default value : false
             * @public
             * @readonly
             * @type Boolean
             * @name inViewport
             * @memberOf me.Renderable
             */
            this.inViewport = false;

            /**
             * Whether the renderable object will always update, even when outside of the viewport<br>
             * default value : false
             * @public
             * @type Boolean
             * @name alwaysUpdate
             * @memberOf me.Renderable
             */
            this.alwaysUpdate = false;

            /**
             * Whether to update this object when the game is paused.
             * default value : false
             * @public
             * @type Boolean
             * @name updateWhenPaused
             * @memberOf me.Renderable
             */
            this.updateWhenPaused = false;

            /**
             * make the renderable object persistent over level changes<br>
             * default value : false
             * @public
             * @type Boolean
             * @name isPersistent
             * @memberOf me.Renderable
             */
            this.isPersistent = false;

            /**
             * Define if a renderable follows screen coordinates (floating)<br>
             * or the world coordinates (not floating)<br>
             * default value : false
             * @public
             * @type Boolean
             * @name floating
             * @memberOf me.Renderable
             */
            this.floating = false;

            /**
             * Z-order for object sorting<br>
             * default value : NaN; will be automatically set by me.Container.addChild()
             * @private
             * @type Number
             * @name z
             * @memberOf me.Renderable
             */
            this.z = NaN;

            /**
             * Define the object anchoring point<br>
             * This is used when positioning, or scaling the object<br>
             * The anchor point is a value between 0.0 and 1.0 (1.0 being the maximum size of the object) <br>
             * (0, 0) means the top-left corner, <br>
             * (1, 1) means the bottom-right corner, <br>
             * default anchoring point is the center (0.5, 0.5) of the object.
             * @public
             * @type me.Vector2d
             * @name anchorPoint
             * @memberOf me.Renderable
             */
            this.anchorPoint = new me.Vector2d();

            /**
             * Define the renderable opacity<br>
             * Set to zero if you do not wish an object to be drawn
             * @see me.Renderable#setOpacity
             * @see me.Renderable#getOpacity
             * @public
             * @type Number
             * @name me.Renderable#alpha
             */
            this.alpha = 1.0;
            // call the super constructor
            me.Rect.prototype.init.apply(this, [x, y, width, height]);

            // set the default anchor point (middle of the renderable)
            this.anchorPoint.set(0.5, 0.5);

            // ensure it's fully opaque by default
            this.setOpacity(1.0);
        },

        /**
         * get the renderable alpha channel value<br>
         * @name getOpacity
         * @memberOf me.Renderable
         * @function
         * @return {Number} current opacity value between 0 and 1
         */
        getOpacity : function () {
            return this.alpha;
        },

        /**
         * set the renderable alpha channel value<br>
         * @name setOpacity
         * @memberOf me.Renderable
         * @function
         * @param {Number} alpha opacity value between 0 and 1
         */
        setOpacity : function (alpha) {
            if (typeof (alpha) === "number") {
                this.alpha = alpha.clamp(0.0, 1.0);
                // Set to 1 if alpha is NaN
                if (this.alpha !== this.alpha) {
                    this.alpha = 1.0;
                }
            }
        },

        /**
         * update function
         * called by the game manager on each game loop
         * @name update
         * @memberOf me.Renderable
         * @function
         * @protected
         * @param {Number} dt time since the last update in milliseconds.
         * @return false
         **/
        update : function () {
            return false;
        },

        /**
         * object draw
         * called by the game manager on each game loop
         * @name draw
         * @memberOf me.Renderable
         * @function
         * @protected
         * @param {Renderer} a renderer object: me.CanvasRenderer or me.WebGLRenderer
         **/
        draw : function (/*renderer*/) {
            // empty one !
        }
    });

    /**
     * Base class for Renderable exception handling.
     * @name Error
     * @class
     * @memberOf me.Renderable
     * @constructor
     * @param {String} msg Error message.
     */
    me.Renderable.Error = me.Error.extend({
        init : function (msg) {
            me.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Renderable.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * A Simple object to display a sprite on screen.
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the sprite object
     * @param {Number} y the y coordinates of the sprite object
     * @param {Image} image reference to the Sprite Image. See {@link me.loader#getImage}
     * @param {Number} [spritewidth] sprite width. The width to draw the image as. Defaults to image width.
     * @param {Number} [spriteheigth] sprite height. The height to draw the image as. Defaults to image height.
     * @example
     * // create a static Sprite Object
     * mySprite = new me.Sprite (100, 100, me.loader.getImage("mySpriteImage"));
     */
    me.Sprite = me.Renderable.extend(
    /** @scope me.Sprite.prototype */
    {
        /**
         * @ignore
         */
        init : function (x, y, image, spritewidth, spriteheight) {

            /**
             * private/internal scale factor
             * @ignore
             */
            this._scale = new me.Vector2d();

            // if true, image flipping/scaling is needed
            this.scaleFlag = false;

            // just to keep track of when we flip
            this.lastflipX = false;
            this.lastflipY = false;

            // z position (for ordering display)
            this.z = 0;

            // image offset
            this.offset = new me.Vector2d();

            /**
             * Set the angle (in Radians) of a sprite to rotate it <br>
             * WARNING: rotating sprites decreases performances
             * @public
             * @type Number
             * @name me.Sprite#angle
             */
            this.angle = 0;

            /**
             * Source rotation angle for pre-rotating the source image<br>
             * Commonly used for TexturePacker
             * @ignore
             */
            this._sourceAngle = 0;

            // image reference
            this.image = null;

            // to manage the flickering effect
            this.flickering = false;
            this.flickerDuration = 0;
            this.flickercb = null;
            this.flickerState = false;

            // Used by the game engine to adjust visibility as the
            // sprite moves in and out of the viewport
            this.isSprite = true;

            // call the super constructor
            me.Renderable.prototype.init.apply(this, [x, y,
                spritewidth  || image.width,
                spriteheight || image.height]);
            // cache image reference
            this.image = image;

            // scale factor of the object
            this._scale.set(1.0, 1.0);
            this.lastflipX = this.lastflipY = false;
            this.scaleFlag = false;

            // set the default sprite index & offset
            this.offset.set(0, 0);

            // non persistent per default
            this.isPersistent = false;

            // and not flickering
            this.flickering = false;
        },

        /**
         * specify a transparent color
         * @name setTransparency
         * @memberOf me.Sprite
         * @function
         * @deprecated Use PNG or GIF with transparency instead
         * @param {String} color color key in "#RRGGBB" format
         */
        setTransparency : function (col) {
            // remove the # if present
            col = (col.charAt(0) === "#") ? col.substring(1, 7) : col;
            // applyRGB Filter (return a context object)
            this.image = me.video.renderer.applyRGBFilter(
                this.image,
                "transparent",
                col.toUpperCase()
            ).canvas;
        },

        /**
         * return the flickering state of the object
         * @name isFlickering
         * @memberOf me.Sprite
         * @function
         * @return {Boolean}
         */
        isFlickering : function () {
            return this.flickering;
        },

        /**
         * make the object flicker
         * @name flicker
         * @memberOf me.Sprite
         * @function
         * @param {Number} duration expressed in milliseconds
         * @param {Function} callback Function to call when flickering ends
         * @example
         * // make the object flicker for 1 second
         * // and then remove it
         * this.flicker(1000, function ()
         * {
         *    me.game.world.removeChild(this);
         * });
         */
        flicker : function (duration, callback) {
            this.flickerDuration = duration;
            if (this.flickerDuration <= 0) {
                this.flickering = false;
                this.flickercb = null;
            }
            else if (!this.flickering) {
                this.flickercb = callback;
                this.flickering = true;
            }
        },

        /**
         * Flip object on horizontal axis
         * @name flipX
         * @memberOf me.Sprite
         * @function
         * @param {Boolean} flip enable/disable flip
         */
        flipX : function (flip) {
            if (flip !== this.lastflipX) {
                this.lastflipX = flip;

                // invert the scale.x value
                this._scale.x = -this._scale.x;

                // set the scaleFlag
                this.scaleFlag = this._scale.x !== 1.0 || this._scale.y !== 1.0;
            }
        },

        /**
         * Flip object on vertical axis
         * @name flipY
         * @memberOf me.Sprite
         * @function
         * @param {Boolean} flip enable/disable flip
         */
        flipY : function (flip) {
            if (flip !== this.lastflipY) {
                this.lastflipY = flip;

                // invert the scale.x value
                this._scale.y = -this._scale.y;

                // set the scaleFlag
                this.scaleFlag = this._scale.x !== 1.0 || this._scale.y !== 1.0;
            }
        },

        /**
         * scale the sprite around his center<br>
         * @name scale
         * @memberOf me.Sprite
         * @function
         * @param {Number} ratioX x scaling ratio
         * @param {Number} ratioY y scaling ratio
         */
        scale : function (ratioX, ratioY) {
            var x = ratioX;
            var y = typeof(ratioY) === "undefined" ? ratioX : ratioY;
            if (x > 0) {
                this._scale.x = this._scale.x < 0.0 ? -x : x;
            }
            if (y > 0) {
                this._scale.y = this._scale.y < 0.0 ? -y : y;
            }
            // set the scaleFlag
            this.scaleFlag = this._scale.x !== 1.0 || this._scale.y !== 1.0;

        },

        /**
         * scale the sprite around his center<br>
         * @name scaleV
         * @memberOf me.Sprite
         * @function
         * @param {me.Vector2d} vector ratio
         */
        scaleV : function (ratio) {
            this.scale(ratio.x, ratio.y);
        },

        /**
         * sprite update<br>
         * not to be called by the end user<br>
         * called by the game manager on each game loop
         * @name update
         * @memberOf me.Sprite
         * @function
         * @protected
         * @return false
         **/
        update : function (dt) {
            //update the "flickering" state if necessary
            if (this.flickering) {
                this.flickerDuration -= dt;
                if (this.flickerDuration < 0) {
                    if (this.flickercb) {
                        this.flickercb();
                    }
                    this.flicker(-1);
                }
                return true;
            }
            return false;
        },

        /**
         * object draw<br>
         * not to be called by the end user<br>
         * called by the game manager on each game loop
         * @name draw
         * @memberOf me.Sprite
         * @function
         * @protected
         * @param {Renderer} a renderer object: me.CanvasRenderer or me.WebGLRenderer
         **/
        draw : function (renderer) {
            // do nothing if we are flickering
            if (this.flickering) {
                this.flickerState = !this.flickerState;
                if (!this.flickerState) {
                    return;
                }
            }
            // save context
            renderer.save();
            // sprite alpha value
            renderer.setGlobalAlpha(renderer.globalAlpha() * this.getOpacity());

            // clamp position vector to pixel grid
            var xpos = ~~this.pos.x, ypos = ~~this.pos.y;

            var w = this.width, h = this.height;
            var angle = this.angle + this._sourceAngle;

            if ((this.scaleFlag) || (angle !== 0)) {
                // calculate pixel pos of the anchor point
                var ax = w * this.anchorPoint.x, ay = h * this.anchorPoint.y;
                // translate to the defined anchor point
                renderer.translate(xpos + ax, ypos + ay);
                // scale
                if (this.scaleFlag) {
                    renderer.scale(this._scale.x, this._scale.y);
                }
                if (angle !== 0) {
                    renderer.rotate(angle);
                }

                if (this._sourceAngle !== 0) {
                    // swap w and h for rotated source images
                    w = this.height;
                    h = this.width;

                    xpos = -ay;
                    ypos = -ax;
                }
                else {
                    // reset coordinates back to upper left coordinates
                    xpos = -ax;
                    ypos = -ay;
                }
            }


            renderer.drawImage(
                this.image,
                this.offset.x, this.offset.y,   // sx,sy
                w, h,                           // sw,sh
                xpos, ypos,                     // dx,dy
                w, h                            // dw,dh
            );

            // restore context
            renderer.restore();
        },

        /**
         * Destroy function<br>
         * @ignore
         */
        destroy : function () {
            this.onDestroyEvent.apply(this, arguments);
        },

        /**
         * OnDestroy Notification function<br>
         * Called by engine before deleting the object
         * @name onDestroyEvent
         * @memberOf me.Sprite
         * @function
         */
        onDestroyEvent : function () {
            // to be extended !
        }
    });
    
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {

    /**
     * an object to manage animation
     * @class
     * @extends me.Sprite
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the sprite object
     * @param {Number} y the y coordinates of the sprite object
     * @param {Object} settings Contains additional parameters for the animation sheet:
     * <ul>
     * <li>{Image} image to use for the animation</li>
     * <li>{Number} spritewidth - of a single frame within the spritesheet</li>
     * <li>{Number} spriteheight - height of a single frame within the spritesheet</li>
     * <li>{Object} region an instance of: me.TextureAtlas#getRegion. The region for when the animation sheet is part of a me.TextureAtlas</li>
     * </ul>
     * @example
     * // standalone image
     * var animationSheet = new me.AnimationSheet(0, 0, {
     *   image: me.loader.getImage('animationsheet'),
     *   spritewidth: 64,
     *   spriteheight: 64
     * });
     * // from a texture
     * var texture = new me.TextureAtlas(me.loader.getJSON('texture'), me.loader.getImage('texture'));
     * var animationSheet = new me.AnimationSheet(0, 0, {
     *   image: texture.getTexture(),
     *   spritewidth: 64,
     *   spriteheight: 64,
     *   region: texture.getRegion('animationsheet')
     * });
     */
    me.AnimationSheet = me.Sprite.extend(
    /** @scope me.AnimationSheet.prototype */
    {
        /** @ignore */
        init : function (x, y, settings) {
            // Spacing and margin
            /** @ignore */
            this.spacing = 0;
            /** @ignore */
            this.margin = 0;

            /**
             * pause and resume animation<br>
             * default value : false;
             * @public
             * @type Boolean
             * @name me.AnimationSheet#animationpause
             */
            this.animationpause = false;

            /**
             * animation cycling speed (delay between frame in ms)<br>
             * default value : 100ms;
             * @public
             * @type Number
             * @name me.AnimationSheet#animationspeed
             */
            this.animationspeed = 100;
            // hold all defined animation
            this.anim = {};

            // a flag to reset animation
            this.resetAnim = null;

            // default animation sequence
            this.current = null;
            // default animation speed (ms)
            this.animationspeed = 100;

            // Spacing and margin

            this.spacing = settings.spacing || 0;
            this.margin = settings.margin || 0;

            var image = settings.region || settings.image;

            // call the constructor
            me.Sprite.prototype.init.apply(this, [x, y, settings.image, settings.spritewidth, settings.spriteheight, this.spacing, this.margin]);
            // store the current atlas information
            this.textureAtlas = null;
            this.atlasIndices = null;

            // build the local textureAtlas

            this.buildLocalAtlas(settings.atlas, settings.atlasIndices, image);

            // create a default animation sequence with all sprites
            this.addAnimation("default", null);

            // set as default
            this.setCurrentAnimation("default");
        },
        /**
         * build the local (private) atlas
         * @ignore
         */

        buildLocalAtlas : function (atlas, indices, image) {
            // reinitialze the atlas
            if (image === null || typeof image === "undefined") {
                image = this.image;
            }
            if (typeof(atlas) !== "undefined") {
                this.textureAtlas = atlas;
                this.atlasIndices = indices;
            }
            else {
                // regular spritesheet
                this.textureAtlas = [];
                // calculate the sprite count (line, col)

                if ((image.width - this.margin) % (this.width + this.spacing) !== 0 ||
                    (image.height - this.margin) % (this.height + this.spacing) !== 0) {
                    throw new me.Renderable.Error(
                        "Animation sheet for image: " + image.src +
                        " is not divisible by " + (this.width + this.spacing) +
                        "x" + (this.height + this.spacing)
                    );
                }

                var spritecount = new me.Vector2d(
                    ~~((image.width - this.margin) / (this.width + this.spacing)),
                    ~~((image.height - this.margin) / (this.height + this.spacing))
                );
                var offsetX = 0;
                var offsetY = 0;
                if (image.offset) {
                    offsetX = image.offset.x;
                    offsetY = image.offset.y;
                }
                // build the local atlas
                for (var frame = 0, count = spritecount.x * spritecount.y; frame < count ; frame++) {
                    this.textureAtlas[frame] = {
                        name: "" + frame,
                        offset: new me.Vector2d(
                            this.margin + (this.spacing + this.width) * (frame % spritecount.x) + offsetX,
                            this.margin + (this.spacing + this.height) * ~~(frame / spritecount.x) + offsetY
                        ),
                        width: this.width,
                        height: this.height,
                        hWidth: this.width / 2,
                        hHeight: this.height / 2,
                        angle: 0
                    };
                }
            }
        },

        /**
         * add an animation <br>
         * For fixed-sized cell sprite sheet, the index list must follow the
         * logic as per the following example :<br>
         * <img src="images/spritesheet_grid.png"/>
         * @name addAnimation
         * @memberOf me.AnimationSheet
         * @function
         * @param {String} name animation id
         * @param {Number[]|String[]} index list of sprite index or name
         * defining the animation
         * @param {Number} [animationspeed] cycling speed for animation in ms
         * (delay between each frame).
         * @see me.AnimationSheet#animationspeed
         * @example
         * // walking animation
         * this.addAnimation("walk", [ 0, 1, 2, 3, 4, 5 ]);
         * // eating animation
         * this.addAnimation("eat", [ 6, 6 ]);
         * // rolling animation
         * this.addAnimation("roll", [ 7, 8, 9, 10 ]);
         * // slower animation
         * this.addAnimation("roll", [ 7, 8, 9, 10 ], 200);
         */
        addAnimation : function (name, index, animationspeed) {
            this.anim[name] = {
                name : name,
                frame : [],
                idx : 0,
                length : 0,
                animationspeed: animationspeed || this.animationspeed,
                nextFrame : 0
            };

            if (index == null) {
                index = [];
                var j = 0;
                // create a default animation with all frame
                this.textureAtlas.forEach(function () {
                    index[j] = j++;
                });
            }

            // set each frame configuration (offset, size, etc..)
            for (var i = 0, len = index.length; i < len; i++) {
                if (typeof(index[i]) === "number") {
                    this.anim[name].frame[i] = this.textureAtlas[index[i]];
                } else { // string
                    if (this.atlasIndices === null) {
                        throw new me.Renderable.Error("string parameters for addAnimation are only allowed for TextureAtlas");
                    } else {
                        this.anim[name].frame[i] = this.textureAtlas[this.atlasIndices[index[i]]];
                    }
                }
            }
            this.anim[name].length = this.anim[name].frame.length;
        },

        /**
         * set the current animation
         * this will always change the animation & set the frame to zero
         * @name setCurrentAnimation
         * @memberOf me.AnimationSheet
         * @function
         * @param {String} name animation id
         * @param {String|Function} [onComplete] animation id to switch to when
         * complete, or callback
         * @example
         * // set "walk" animation
         * this.setCurrentAnimation("walk");
         *
         * // set "walk" animation if it is not the current animation
         * if (this.isCurrentAnimation("walk")) {
         *   this.setCurrentAnimation("walk");
         * }
         *
         * // set "eat" animation, and switch to "walk" when complete
         * this.setCurrentAnimation("eat", "walk");
         *
         * // set "die" animation, and remove the object when finished
         * this.setCurrentAnimation("die", (function () {
         *    me.game.world.removeChild(this);
         *    return false; // do not reset to first frame
         * }).bind(this));
         *
         * // set "attack" animation, and pause for a short duration
         * this.setCurrentAnimation("die", (function () {
         *    this.animationpause = true;
         *
         *    // back to "standing" animation after 1 second
         *    setTimeout(function () {
         *        this.setCurrentAnimation("standing");
         *    }, 1000);
         *
         *    return false; // do not reset to first frame
         * }).bind(this));
         **/
        setCurrentAnimation : function (name, resetAnim) {
            if (this.anim[name]) {
                this.current = this.anim[name];
                this.resetAnim = resetAnim || null;
                this.setAnimationFrame(this.current.idx); // or 0 ?
                this.current.nextFrame = this.current.animationspeed;
            } else {
                throw new me.Renderable.Error("animation id '" + name + "' not defined");
            }
        },

        /**
         * return true if the specified animation is the current one.
         * @name isCurrentAnimation
         * @memberOf me.AnimationSheet
         * @function
         * @param {String} name animation id
         * @return {Boolean}
         * @example
         * if (!this.isCurrentAnimation("walk")) {
         *    // do something funny...
         * }
         */
        isCurrentAnimation : function (name) {
            return this.current.name === name;
        },

        /**
         * force the current animation frame index.
         * @name setAnimationFrame
         * @memberOf me.AnimationSheet
         * @function
         * @param {Number} [index=0] animation frame index
         * @example
         * //reset the current animation to the first frame
         * this.setAnimationFrame();
         */
        setAnimationFrame : function (idx) {
            this.current.idx = (idx || 0) % this.current.length;
            var frame = this.current.frame[this.current.idx];
            this.offset = frame.offset;
            this.width = frame.width;
            this.height = frame.height;
            this.hWidth = frame.hWidth;
            this.hHeight = frame.hHeight;
            this._sourceAngle = frame.angle;
        },

        /**
         * return the current animation frame index.
         * @name getCurrentAnimationFrame
         * @memberOf me.AnimationSheet
         * @function
         * @return {Number} current animation frame index
         */
        getCurrentAnimationFrame : function () {
            return this.current.idx;
        },

        /**
         * update the animation<br>
         * this is automatically called by the game manager {@link me.game}
         * @name update
         * @memberOf me.AnimationSheet
         * @function
         * @protected
         * @param {Number} dt time since the last update in milliseconds.
         */
        update : function (dt) {
            // update animation if necessary
            if (!this.animationpause && this.current.length > 1) {
                this.current.nextFrame -= dt;
                if (this.current.nextFrame <= 0) {
                    this.setAnimationFrame(++this.current.idx);

                    // switch animation if we reach the end of the strip
                    // and a callback is defined
                    if (this.current.idx === 0 && this.resetAnim)  {
                        // if string, change to the corresponding animation
                        if (typeof this.resetAnim === "string") {
                            this.setCurrentAnimation(this.resetAnim);
                        }
                        // if function (callback) call it
                        else if (typeof this.resetAnim === "function" &&
                                 this.resetAnim() === false) {
                            this.current.idx = this.current.length - 1;
                            this.setAnimationFrame(this.current.idx);
                            me.Sprite.prototype.update.apply(this, [dt]);
                            return false;
                        }
                    }

                    // set next frame timestamp
                    this.current.nextFrame = this.current.animationspeed;
                    return me.Sprite.prototype.update.apply(this, [dt]) || true;
                }
            }
            return me.Sprite.prototype.update.apply(this, [dt]);
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a local constant for the -(Math.PI / 2) value
     * @ignore
     */
    var nhPI = -(Math.PI / 2);

    /**
     * A Texture atlas object<br>
     * Currently support : <br>
     * - [TexturePacker]{@link http://www.codeandweb.com/texturepacker/} : through JSON export <br>
     * - [ShoeBox]{@link http://renderhjs.net/shoebox/} : through JSON export using the melonJS setting [file]{@link https://github.com/melonjs/melonJS/raw/master/media/shoebox_JSON_export.sbx}
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {Object} atlas atlas information. See {@link me.loader#getJSON}
     * @param {Image} [texture=atlas.meta.image] texture name
     * @example
     * // create a texture atlas
     * texture = new me.TextureAtlas (
     *    me.loader.getJSON("texture"),
     *    me.loader.getImage("texture")
     * );
     *
     * // or if you wish to specify the atlas
     */
    me.TextureAtlas = Object.extend(
    /** @scope me.TextureAtlas.prototype */
    {
        /**
         * @ignore
         */
        init : function (atlas, texture) {
            /**
             * to identify the atlas format (e.g. texture packer)
             * @ignore
             */
            this.format = null;

            /**
             * the image texture itself
             * @ignore
             */
            this.texture = texture || null;

            /**
             * the atlas dictionnary
             * @ignore
             */
            this.atlas = atlas || null;

            if (atlas && atlas.meta) {
                // Texture Packer
                if (atlas.meta.app.contains("texturepacker")) {
                    this.format = "texturepacker";
                    // set the texture
                    if (typeof(texture) === "undefined") {
                        var name = me.utils.getBasename(atlas.meta.image);
                        this.texture = me.loader.getImage(name);
                        if (this.texture === null) {
                            throw new me.TextureAtlas.Error("Atlas texture '" + name + "' not found");
                        }
                    } else {
                        this.texture = texture;
                    }
                }
                // ShoeBox
                if (atlas.meta.app.contains("ShoeBox")) {
                    if (!atlas.meta.exporter || !atlas.meta.exporter.contains("melonJS")) {
                        throw new me.TextureAtlas.Error("ShoeBox requires the JSON exporter : https://github.com/melonjs/melonJS/tree/master/media/shoebox_JSON_export.sbx");
                    }
                    this.format = "ShoeBox";
                    // set the texture
                    this.texture = texture;
                }
                // initialize the atlas
                this.atlas = this.initFromTexturePacker(atlas);
            }

            // if format not recognized
            if (this.atlas === null) {
                throw new me.TextureAtlas.Error("texture atlas format not supported");
            }
        },

        /**
         * @ignore
         */
        initFromTexturePacker : function (data) {
            var atlas = {};
            data.frames.forEach(function (frame) {
                // fix wrongly formatted JSON (e.g. last dummy object in ShoeBox)
                if (frame.hasOwnProperty("filename")) {
                    atlas[frame.filename] = {
                        frame: new me.Rect(
                            frame.frame.x, frame.frame.y,
                            frame.frame.w, frame.frame.h
                        ),
                        source: new me.Rect(
                            frame.spriteSourceSize.x, frame.spriteSourceSize.y,
                            frame.spriteSourceSize.w, frame.spriteSourceSize.h
                        ),
                        // non trimmed size, but since we don't support trimming both value are the same
                        //sourceSize: new me.Vector2d(frame.sourceSize.w,frame.sourceSize.h),
                        rotated : frame.rotated === true,
                        trimmed : frame.trimmed === true
                    };
                }
            });
            return atlas;
        },

        /**
         * return the Atlas texture
         * @name getTexture
         * @memberOf me.TextureAtlas
         * @function
         * @return {Image}
         */
        getTexture : function () {
            return this.texture;
        },

        /**
         * return a normalized region/frame information for the specified sprite name
         * @name getRegion
         * @memberOf me.TextureAtlas
         * @function
         * @param {String} name name of the sprite
         * @return {Object}
         */
        getRegion : function (name) {
            var region = this.atlas[name];
            if (region) {
                return {
                    name: name, // frame name
                    pos: region.source.pos.clone(), // unused for now
                    offset: region.frame.pos.clone(),
                    width: region.frame.width,
                    height: region.frame.height,
                    hWidth: region.frame.width / 2,
                    hHeight: region.frame.height / 2,
                    angle : (region.rotated === true) ? nhPI : 0
                };
            }
            return null;
        },

        /**
         * Create a sprite object using the first region found using the specified name
         * @name createSpriteFromName
         * @memberOf me.TextureAtlas
         * @function
         * @param {String} name name of the sprite
         * @return {me.Sprite}
         * @example
         * // create a new texture atlas object under the `game` namespace
         * game.texture = new me.TextureAtlas(
         *    me.loader.getJSON("texture"),
         *    me.loader.getImage("texture")
         * );
         * ...
         * ...
         * // add the coin sprite as renderable for the entity
         * this.renderable = game.texture.createSpriteFromName("coin.png");
         * // set the renderable position to bottom center
         * this.anchorPoint.set(0.5, 1.0);
         */
        createSpriteFromName : function (name) {
            var region = this.getRegion(name);
            if (region) {
                // instantiate a new sprite object
                var sprite = new me.Sprite(
                    0, 0,
                    this.getTexture(),
                    region.width, region.height
                );
                // set the sprite offset within the texture
                sprite.offset.setV(region.offset);
                // set angle if defined
                sprite._sourceAngle = region.angle;

                /* -> when using anchor positioning, this is not required
                   -> and makes final position wrong...
                if (tex.trimmed===true) {
                    // adjust default position
                    sprite.pos.add(tex.source.pos);
                }
                */
                // return our object
                return sprite;
            }
            // throw an error
            throw new me.TextureAtlas.Error("TextureAtlas - region for " + name + " not found");
        },

        /**
         * Create an animation object using the first region found using all specified names
         * @name createAnimationFromName
         * @memberOf me.TextureAtlas
         * @function
         * @param {String[]} names list of names for each sprite
         * @return {me.AnimationSheet}
         * @example
         * // create a new texture atlas object under the `game` namespace
         * game.texture = new me.TextureAtlas(
         *    me.loader.getJSON("texture"),
         *    me.loader.getImage("texture")
         * );
         * ...
         * ...
         * // create a new animationSheet as renderable for the entity
         * this.renderable = game.texture.createAnimationFromName([
         *   "walk0001.png", "walk0002.png", "walk0003.png",
         *   "walk0004.png", "walk0005.png", "walk0006.png",
         *   "walk0007.png", "walk0008.png", "walk0009.png",
         *   "walk0010.png", "walk0011.png"
         * ]);
         *
         * // define an additional basic walking animatin
         * this.renderable.addAnimation ("simple_walk", [0,2,1]);
         * // you can also use frame name to define your animation
         * this.renderable.addAnimation ("speed_walk", ["walk0007.png", "walk0008.png", "walk0009.png", "walk0010.png"]);
         * // set the default animation
         * this.renderable.setCurrentAnimation("simple_walk");
         * // set the renderable position to bottom center
         * this.anchorPoint.set(0.5, 1.0);
         */
        createAnimationFromName : function (names) {
            var tpAtlas = [], indices = {};
            // iterate through the given names
            // and create a "normalized" atlas
            for (var i = 0; i < names.length;++i) {
                tpAtlas[i] = this.getRegion(names[i]);
                indices[names[i]] = i;
                if (tpAtlas[i] == null) {
                    // throw an error
                    throw new me.TextureAtlas.Error("TextureAtlas - region for " + names[i] + " not found");
                }
            }
            // instantiate a new animation sheet object
            return new me.AnimationSheet(0, 0, {
                image: this.texture,
                spritewidth: 0,
                spriteheight: 0,
                margin: 0,
                spacing: 0,
                atlas: tpAtlas,
                atlasIndices: indices
            });
        }
    });

    /**
     * Base class for TextureAtlas exception handling.
     * @name Error
     * @class
     * @memberOf me.TextureAtlas
     * @constructor
     * @param {String} msg Error message.
     */
    me.TextureAtlas.Error = me.Error.extend({
        init : function (msg) {
            me.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.TextureAtlas.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */

(function () {
    // some ref shortcut
    var MIN = Math.min, MAX = Math.max;

    /**
     * a camera/viewport Object
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {Number} minX start x offset
     * @param {Number} minY start y offset
     * @param {Number} maxX end x offset
     * @param {Number} maxY end y offset
     */
    me.Viewport = me.Renderable.extend(
    /** @scope me.Viewport.prototype */ {
        /** @ignore */
        init : function (minX, minY, maxX, maxY) {
            /**
             * Axis definition :<br>
             * <p>
             * AXIS.NONE<br>
             * AXIS.HORIZONTAL<br>
             * AXIS.VERTICAL<br>
             * AXIS.BOTH
             * </p>
             * @public
             * @constant
             * @type enum
             * @name AXIS
             * @memberOf me.Viewport
             */
            this.AXIS = {
                NONE : 0,
                HORIZONTAL : 1,
                VERTICAL : 2,
                BOTH : 3
            };

            /**
             * Camera bounds
             * @public
             * @constant
             * @type me.Rect
             * @name bounds
             * @memberOf me.Viewport
             */
            this.bounds = null;

            // camera deadzone
            this.deadzone = null;

            // target to follow
            this.target = null;

            // axis to follow
            this.follow_axis = 0;

            // shake parameters
            this._shake = null;
            // fade parameters
            this._fadeIn = null;
            this._fadeOut = null;

            // cache the screen rendering position
            this.screenX = 0;
            this.screenY = 0;
            // viewport coordinates
            me.Renderable.prototype.init.apply(this, [minX, minY, maxX - minX, maxY - minY]);

            // real world limits
            this.bounds = new me.Rect(-Infinity, -Infinity, Infinity, Infinity);

            // offset for shake effect
            this.offset = new me.Vector2d();

            // target to follow
            this.target = null;

            // default value follow
            this.follow_axis = this.AXIS.NONE;

            // shake variables
            this._shake = {
                intensity : 0,
                duration : 0,
                axis : this.AXIS.BOTH,
                onComplete : null
            };

            // flash variables
            this._fadeOut = {
                color : null,
                duration : 0,
                tween : null
            };
            // fade variables
            this._fadeIn = {
                color : null,
                duration : 0,
                tween : null
            };

            // set a default deadzone
            this.setDeadzone(this.width / 6, this.height / 6);
        },

        // -- some private function ---

        /** @ignore */
        _followH : function (target) {
            var _x = this.pos.x;
            if ((target.x - this.pos.x) > (this.deadzone.right)) {
                this.pos.x = ~~MIN((target.x) - (this.deadzone.right), this.bounds.width - this.width);
            }
            else if ((target.x - this.pos.x) < (this.deadzone.pos.x)) {
                this.pos.x = ~~MAX((target.x) - this.deadzone.pos.x, this.bounds.pos.x);
            }
            return (_x !== this.pos.x);
        },

        /** @ignore */
        _followV : function (target) {
            var _y = this.pos.y;
            if ((target.y - this.pos.y) > (this.deadzone.bottom)) {
                this.pos.y = ~~MIN((target.y) - (this.deadzone.bottom),    this.bounds.height - this.height);
            }
            else if ((target.y - this.pos.y) < (this.deadzone.pos.y)) {
                this.pos.y = ~~MAX((target.y) - this.deadzone.pos.y, this.bounds.pos.y);
            }
            return (_y !== this.pos.y);
        },

        // -- public function ---

        /**
         * reset the viewport to specified coordinates
         * @name reset
         * @memberOf me.Viewport
         * @function
         * @param {Number} [x=0]
         * @param {Number} [y=0]
         */
        reset : function (x, y) {
            // reset the initial viewport position to 0,0
            this.pos.x = x || 0;
            this.pos.y = y || 0;

            // reset the target
            this.target = null;

            // reset default axis value for follow
            this.follow_axis = null;
        },

        /**
         * change the deadzone settings.
         * the "deadzone" defines an area within the current viewport in which 
         * the followed entity can move without scrolling the viewport.
         * @name setDeadzone
         * @see me.Viewport.follow
         * @memberOf me.Viewport
         * @function
         * @param {Number} w deadzone width
         * @param {Number} h deadzone height
         */
        setDeadzone : function (w, h) {
            if (this.deadzone === null) {
                this.deadzone = new me.Rect(0, 0, 0, 0);
            }

            // reusing the old code for now...
            this.deadzone.pos.set(
                ~~((this.width - w) / 2),
                ~~((this.height - h) / 2 - h * 0.25)
            );
            this.deadzone.resize(w, h);

            // force a camera update
            this.updateTarget();
        },

        /**
         * set the viewport boundaries (set to the world limit by default).
         * the viewport is bound to the given coordinates and cannot move/be scrolled outside of it.
         * @name setBounds
         * @memberOf me.Viewport
         * @function
         * @param {Number} x world left limit
         * @param {Number} y world top limit
         * @param {Number} w world width limit
         * @param {Number} h world height limit
         */
        setBounds : function (x, y, w, h) {
            this.bounds.pos.set(x, y);
            this.bounds.resize(w, h);
        },

        /**
         * set the viewport to follow the specified entity
         * @name follow
         * @memberOf me.Viewport
         * @function
         * @param {me.Entity|me.Vector2d} target Entity or Position
         * Vector to follow
         * @param {me.Viewport#AXIS} [axis=AXIS.BOTH] Which axis to follow
         */
        follow : function (target, axis) {
            if (target instanceof me.Entity) {
                this.target = target.pos;
            }
            else if (target instanceof me.Vector2d) {
                this.target = target;
            }
            else {
                throw new me.Renderable.Error("invalid target for viewport.follow");
            }
            // if axis is null, camera is moved on target center
            this.follow_axis = (
                typeof(axis) === "undefined" ? this.AXIS.BOTH : axis
            );
            // force a camera update
            this.updateTarget();
        },

        /**
         * move the viewport position by the specified offset
         * @name move
         * @memberOf me.Viewport
         * @function
         * @param {Number} x
         * @param {Number} y
         * @example
         * // Move the viewport up by four pixels
         * me.game.viewport.move(0, -4);
         */
        move : function (x, y) {
            this.moveTo(~~(this.pos.x + x), ~~(this.pos.y + y));
        },

        /**
         * move the viewport to the specified coordinates
         * @name moveTo
         * @memberOf me.Viewport
         * @function
         * @param {Number} x
         * @param {Number} y
         */

        moveTo : function (x, y) {
            this.pos.x = (~~x).clamp(
                this.bounds.pos.x,
                this.bounds.width - this.width
            );
            this.pos.y = (~~y).clamp(
                this.bounds.pos.y,
                this.bounds.height - this.height
            );

            //publish the corresponding message
            me.event.publish(me.event.VIEWPORT_ONCHANGE, [this.pos]);
        },

        /** @ignore */
        updateTarget : function () {
            var updated = false;

            if (this.target) {
                switch (this.follow_axis) {
                    case this.AXIS.NONE:
                        //this.focusOn(this.target);
                        break;

                    case this.AXIS.HORIZONTAL:
                        updated = this._followH(this.target);
                        break;

                    case this.AXIS.VERTICAL:
                        updated = this._followV(this.target);
                        break;

                    case this.AXIS.BOTH:
                        updated = this._followH(this.target);
                        updated = this._followV(this.target) || updated;
                        break;

                    default:
                        break;
                }
            }

            return updated;
        },

        /** @ignore */
        update : function (dt) {
            var updated = this.updateTarget();

            if (this._shake.duration > 0) {
                this._shake.duration -= dt;
                if (this._shake.duration <= 0) {
                    this._shake.duration = 0;
                    this.offset.setZero();
                    if (typeof(this._shake.onComplete) === "function") {
                        this._shake.onComplete();
                    }
                }
                else {
                    if (this._shake.axis === this.AXIS.BOTH ||
                        this._shake.axis === this.AXIS.HORIZONTAL) {
                        this.offset.x = (Math.random() - 0.5) * this._shake.intensity;
                    }
                    if (this._shake.axis === this.AXIS.BOTH ||
                        this._shake.axis === this.AXIS.VERTICAL) {
                        this.offset.y = (Math.random() - 0.5) * this._shake.intensity;
                    }
                }
                // updated!
                updated = true;
            }

            if (updated === true) {
                //publish the corresponding message
                me.event.publish(me.event.VIEWPORT_ONCHANGE, [this.pos]);
            }

            // check for fade/flash effect
            if ((this._fadeIn.tween != null) || (this._fadeOut.tween != null)) {
                updated = true;
            }

            return updated;
        },

        /**
         * shake the camera
         * @name shake
         * @memberOf me.Viewport
         * @function
         * @param {Number} intensity maximum offset that the screen can be moved
         * while shaking
         * @param {Number} duration expressed in milliseconds
         * @param {me.Viewport#AXIS} [axis=AXIS.BOTH] specify on which axis you
         * want the shake effect (AXIS.HORIZONTAL, AXIS.VERTICAL, AXIS.BOTH)
         * @param {Function} [onComplete] callback once shaking effect is over
         * @example
         * // shake it baby !
         * me.game.viewport.shake(10, 500, me.game.viewport.AXIS.BOTH);
         */
        shake : function (intensity, duration, axis, onComplete) {
            if (this._shake.duration > 0) {
                return;
            }

            this._shake = {
                intensity : intensity,
                duration : duration,
                axis : axis || this.AXIS.BOTH,
                onComplete : onComplete
            };
        },

        /**
         * fadeOut(flash) effect<p>
         * screen is filled with the specified color and slowly goes back to normal
         * @name fadeOut
         * @memberOf me.Viewport
         * @function
         * @param {me.Color|String} color a CSS color value
         * @param {Number} [duration=1000] expressed in milliseconds
         * @param {Function} [onComplete] callback once effect is over
         */
        fadeOut : function (color, duration, onComplete) {
            this._fadeOut.color = me.pool.pull("me.Color").copy(color);
            this._fadeOut.color.alpha = 1.0;
            this._fadeOut.duration = duration || 1000; // convert to ms
            this._fadeOut.tween = me.pool.pull("me.Tween", this._fadeOut.color)
                .to({ alpha: 0.0 }, this._fadeOut.duration)
                .onComplete(onComplete || null);
            this._fadeOut.tween.start();
        },

        /**
         * fadeIn effect <p>
         * fade to the specified color
         * @name fadeIn
         * @memberOf me.Viewport
         * @function
         * @param {me.Color|String} color a CSS color value
         * @param {Number} [duration=1000] expressed in milliseconds
         * @param {Function} [onComplete] callback once effect is over
         */
        fadeIn : function (color, duration, onComplete) {
            this._fadeIn.color = me.pool.pull("me.Color").copy(color);
            this._fadeIn.color.alpha = 0.0;
            this._fadeIn.duration = duration || 1000; //convert to ms
            this._fadeIn.tween = me.pool.pull("me.Tween", this._fadeIn.color)
                .to({ alpha: 1.0 }, this._fadeIn.duration)
                .onComplete(onComplete || null);
            this._fadeIn.tween.start();
        },

        /**
         * return the viewport width
         * @name getWidth
         * @memberOf me.Viewport
         * @function
         * @return {Number}
         */
        getWidth : function () {
            return this.width;
        },

        /**
         * return the viewport height
         * @name getHeight
         * @memberOf me.Viewport
         * @function
         * @return {Number}
         */
        getHeight : function () {
            return this.height;
        },

        /**
         * set the viewport position around the specified object
         * @name focusOn
         * @memberOf me.Viewport
         * @function
         * @param {me.Renderable}
         */
        focusOn : function (target) {
            var bounds = target.getBounds();
            this.moveTo(
                target.pos.x + bounds.pos.x + (bounds.width / 2),
                target.pos.y + bounds.pos.y + (bounds.height / 2)
            );
        },

        /**
         * check if the specified rectangle is in the viewport
         * @name isVisible
         * @memberOf me.Viewport
         * @function
         * @param {me.Rect} rect
         * @return {Boolean}
         */
        isVisible : function (rect) {
            return rect.overlaps(this);
        },

        /**
         * convert the given "local" (screen) coordinates into world coordinates
         * @name localToWorld
         * @memberOf me.Viewport
         * @function
         * @param {Number} x
         * @param {Number} y
         * @param {Number} [v] an optional vector object where to set the
         * converted value
         * @return {me.Vector2d}
         */
        localToWorld : function (x, y, v) {
            v = v || new me.Vector2d();
            return (v.set(x, y)).add(this.pos).sub(me.game.currentLevel.pos);
        },

        /**
         * convert the given world coordinates into "local" (screen) coordinates
         * @name worldToLocal
         * @memberOf me.Viewport
         * @function
         * @param {Number} x
         * @param {Number} y
         * @param {Number} [v] an optional vector object where to set the
         * converted value
         * @return {me.Vector2d}
         */
        worldToLocal : function (x, y, v) {
            v = v || new me.Vector2d();
            return (v.set(x, y)).sub(this.pos).add(me.game.currentLevel.pos);
        },

        /**
         * render the camera effects
         * @ignore
         */
        draw : function () {
            // fading effect
            if (this._fadeIn.tween) {
                me.video.renderer.clearSurface(null, this._fadeIn.color);
                // remove the tween if over
                if (this._fadeIn.color.alpha === 1.0) {
                    this._fadeIn.tween = null;
                    me.pool.push(this._fadeIn.color);
                    this._fadeIn.color = null;
                }
            }

            // flashing effect
            if (this._fadeOut.tween) {
                me.video.renderer.clearSurface(null, this._fadeOut.color);
                // remove the tween if over
                if (this._fadeOut.color.alpha === 0.0) {
                    this._fadeOut.tween = null;
                    me.pool.push(this._fadeOut.color);
                    this._fadeOut.color = null;
                }
            }
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {

    /**
     * GUI Object<br>
     * A very basic object to manage GUI elements <br>
     * The object simply register on the "pointerdown" <br>
     * or "touchstart" event and call the onClick function"
     * @class
     * @extends me.Sprite
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinate of the GUI Object
     * @param {Number} y the y coordinate of the GUI Object
     * @param {me.ObjectSettings} settings Object settings
     * @example
     *
     * // create a basic GUI Object
     * var myButton = me.GUI_Object.extend(
     * {
     *    init:function (x, y)
     *    {
     *       var settings = {}
     *       settings.image = "button";
     *       settings.spritewidth = 100;
     *       settings.spriteheight = 50;
     *       // super constructor
     *       me.GUI_Object.prototype.init.apply(this, [x, y, settings]);
     *       // define the object z order
     *       this.z = 4;
     *    },
     *
     *    // output something in the console
     *    // when the object is clicked
     *    onClick:function (event)
     *    {
     *       console.log("clicked!");
     *       // don't propagate the event
     *       return false;
     *    }
     * });
     *
     * // add the object at pos (10,10)
     * me.game.world.addChild(new myButton(10,10));
     *
     */
    me.GUI_Object = me.Sprite.extend({
    /** @scope me.GUI_Object.prototype */

        /**
         * @ignore
         */
        init : function (x, y, settings) {
            /**
             * object can be clicked or not
             * @public
             * @type boolean
             * @name me.GUI_Object#isClickable
             */
            this.isClickable = true;
           
            /**
             * Tap and hold threshold timeout in ms (default 250)
             * @type {number}
             * @name me.GUI_Object#holdThreshold
             */
            this.holdThreshold = 250;

            /**
             * object can be tap and hold
             * @public
             * @type boolean
             * @name me.GUI_Object#isHoldable
             */
            this.isHoldable = false;
            
            // object has been updated (clicked,etc..)
            this.holdTimeout = null;
            this.updated = false;
            this.released = true;
            
            // call the parent constructor
            me.Sprite.prototype.init.apply(this, [x, y,
                ((typeof settings.image === "string") ? me.loader.getImage(settings.image) : settings.image),
                settings.spritewidth,
                settings.spriteheight]);

            // GUI items use screen coordinates
            this.floating = true;

            // register on mouse event
            me.input.registerPointerEvent("pointerdown", this, this.clicked.bind(this));
            me.input.registerPointerEvent("pointerup", this, this.release.bind(this));
        },

        /**
         * return true if the object has been clicked
         * @ignore
         */
        update : function () {
            if (this.updated) {
                // clear the flag
                if (!this.released) {
                    this.updated = false;
                }
                return true;
            }
            return false;
        },

        /**
         * function callback for the pointerdown event
         * @ignore
         */
        clicked : function (event) {
            if (this.isClickable) {
                this.updated = true;
                if (this.isHoldable) {
                    if (this.holdTimeout !== null) {
                        me.timer.clearTimeout(this.holdTimeout);
                    }
                    this.holdTimeout = me.timer.setTimeout(this.hold.bind(this), this.holdThreshold, false);
                    this.released = false;
                }
                return this.onClick(event);
            }
        },

        /**
         * function called when the object is clicked <br>
         * to be extended <br>
         * return false if we need to stop propagating the event
         * @name onClick
         * @memberOf me.GUI_Object
         * @public
         * @function
         * @param {Event} event the event object
         */
        onClick : function () {
            return false;
        },

        /**
         * function callback for the pointerup event
         * @ignore
         */
        release : function (event) {
            this.released = true;
            me.timer.clearTimeout(this.holdTimeout);
            return this.onRelease(event);
        },

        /**
         * function called when the object is clicked <br>
         * to be extended <br>
         * return false if we need to stop propagating the event
         * @name onClick
         * @memberOf me.GUI_Object
         * @public
         * @function
         * @param {Event} event the event object
         */
        onRelease : function () {
            return false;
        },

        /**
         * function callback for the tap and hold timer event
         * @ignore
         */
        hold : function () {
            me.timer.clearTimeout(this.holdTimeout);
            if (!this.released) {
                this.onHold();
            }
        },

        /**
         * function called when the object is clicked and holded<br>
         * to be extended <br>
         * @name onHold
         * @memberOf me.GUI_Object
         * @public
         * @function
         */
        onHold : function () {
        },

        /**
         * OnDestroy notification function<br>
         * Called by engine before deleting the object<br>
         * be sure to call the parent function if overwritten
         * @name onDestroyEvent
         * @memberOf me.GUI_Object
         * @public
         * @function
         */
        onDestroyEvent : function () {
            me.input.releasePointerEvent("pointerdown", this);
            me.input.releasePointerEvent("pointerup", this);
            me.timer.clearTimeout(this.holdTimeout);
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier Biot, Jason Oster
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * Private function to re-use for object removal in a defer
     * @ignore
     */
    var deferredRemove = function (child, keepalive) {
        if (child.ancestor) {
            child.ancestor.removeChildNow(child, keepalive);
        }
    };

    /**
     * A global "translation context" for nested Containers
     * @ignore
     */
    var globalTranslation = new me.Rect(0, 0, 0, 0);

    /**
     * A global "floating children" reference counter for nested ObjectContainers
     * @ignore
     */
    var globalFloatingCounter = 0;

    /**
     * me.Container represents a collection of child objects
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {Number} [x=0] position of the container
     * @param {Number} [y=0] position of the container
     * @param {Number} [w=me.game.viewport.width] width of the container
     * @param {number} [h=me.game.viewport.height] height of the container
     */
    me.Container = me.Renderable.extend(
    /** @scope me.Container.prototype */
    {
        /**
         * constructor
         * @ignore
         */
        init : function (x, y, width, height) {
            /**
             * keep track of pending sort
             * @ignore
             */
            this.pendingSort = null;

            // TODO; container do not have a physic body
            // ADD child container child one by one to the quadtree?

            /**
             * the container default transformation matrix
             * @public
             * @type me.Matrix2d
             * @name transform
             * @memberOf me.Container
             */
            this.transform = new me.Matrix2d();
            // call the _super constructor
            me.Renderable.prototype.init.apply(this,
                [x, y,
                width || Infinity,
                height || Infinity]
            );
            // init the bounds to an empty rect

            /**
             * Container bounds
             * @ignore
             */
            this.bounds = undefined;

            /**
             * The array of children of this container.
             * @ignore
             */
            this.children = [];
            // by default reuse the global me.game.setting
            /**
             * The property of the child object that should be used to sort on <br>
             * value : "x", "y", "z" (default: me.game.sortOn)
             * @public
             * @type String
             * @name sortOn
             * @memberOf me.Container
             */
            this.sortOn = me.game.sortOn;
            /**
             * Specify if the children list should be automatically sorted when adding a new child
             * @public
             * @type Boolean
             * @name autoSort
             * @memberOf me.Container
             */

            this.autoSort = true;
            this.transform.identity();

            /**
             * Used by the debug panel plugin
             * @ignore
             */
            this.drawCount = 0;
        },


        /**
         * Add a child to the container <br>
         * if auto-sort is disable, the object will be appended at the bottom of the list
         * @name addChild
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         * @param {number} [zIndex] forces the z index of the child to the specified value.
         * @return {me.Renderable} the added child
         */
        addChild : function (child, zIndex) {
            if (typeof(child.ancestor) !== "undefined") {
                child.ancestor.removeChildNow(child);
            }
            else {
                // only allocate a GUID if the object has no previous ancestor
                // (e.g. move one child from one container to another)
                if (child.isRenderable) {
                    // allocated a GUID value
                    child.GUID = me.utils.createGUID();
                }
            }

            // change the child z-index if one is specified
            if (typeof(zIndex) === "number") {
                child.z = zIndex;
            }

            // specify a z property to infinity if not defined
            if ((typeof child.z === "undefined") || (child.z !== child.z)) {
                child.z = this.children.length;
            }

            child.ancestor = this;
            this.children.push(child);
            if (this.autoSort === true) {
                this.sort();
            }

            if (typeof child.onActivateEvent === "function") {
                child.onActivateEvent();
            }

            return child;
        },
        /**
         * Add a child to the container at the specified index<br>
         * (the list won't be sorted after insertion)
         * @name addChildAt
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         * @param {Number} index
         * @return {me.Renderable} the added child
         */
        addChildAt : function (child, index) {
            if (index >= 0 && index < this.children.length) {
                if (typeof(child.ancestor) !== "undefined") {
                    child.ancestor.removeChildNow(child);
                }
                else {
                    // only allocate a GUID if the object has no previous ancestor
                    // (e.g. move one child from one container to another)
                    if (child.isRenderable) {
                        // allocated a GUID value
                        child.GUID = me.utils.createGUID();
                    }
                }
                child.ancestor = this;

                this.children.splice(index, 0, child);

                if (typeof child.onActivateEvent === "function") {
                    child.onActivateEvent();
                }

                return child;
            }
            else {
                throw new me.Container.Error("Index (" + index + ") Out Of Bounds for addChildAt()");
            }
        },

        /**
         * Swaps the position (z depth) of 2 childs
         * @name swapChildren
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         * @param {me.Renderable} child
         */
        swapChildren : function (child, child2) {
            var index = this.getChildIndex(child);
            var index2 = this.getChildIndex(child2);

            if ((index !== -1) && (index2 !== -1)) {
                // swap z index
                var _z = child.z;
                child.z = child2.z;
                child2.z = _z;
                // swap the positions..
                this.children[index] = child2;
                this.children[index2] = child;
            }
            else {
                throw new me.Container.Error(child + " Both the supplied childs must be a child of the caller " + this);
            }
        },

        /**
         * Returns the Child at the specified index
         * @name getChildAt
         * @memberOf me.Container
         * @function
         * @param {Number} index
         */
        getChildAt : function (index) {
            if (index >= 0 && index < this.children.length) {
                return this.children[index];
            }
            else {
                throw new me.Container.Error("Index (" + index + ") Out Of Bounds for getChildAt()");
            }
        },

        /**
         * Returns the index of the Child
         * @name getChildAt
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         */
        getChildIndex : function (child) {
            return this.children.indexOf(child);
        },

        /**
         * Returns true if contains the specified Child
         * @name hasChild
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         * @return {Boolean}
         */
        hasChild : function (child) {
            return this === child.ancestor;
        },

        /**
         * return the child corresponding to the given property and value.<br>
         * note : avoid calling this function every frame since
         * it parses the whole object tree each time
         * @name getChildByProp
         * @memberOf me.Container
         * @public
         * @function
         * @param {String} prop Property name
         * @param {String} value Value of the property
         * @return {me.Renderable[]} Array of childs
         * @example
         * // get the first child object called "mainPlayer" in a specific container :
         * ent = myContainer.getChildByProp("name", "mainPlayer");
         * // or query the whole world :
         * ent = me.game.world.getChildByProp("name", "mainPlayer");
         */
        getChildByProp : function (prop, value)    {
            var objList = [];
            // for string comparaisons
            var _regExp = new RegExp(value, "i");

            function compare(obj, prop) {
                if (typeof (obj[prop]) === "string") {
                    if (obj[prop].match(_regExp)) {
                        objList.push(obj);
                    }
                }
                else if (obj[prop] === value) {
                    objList.push(obj);
                }
            }

            for (var i = this.children.length - 1; i >= 0; i--) {
                var obj = this.children[i];
                if (obj instanceof me.Container) {
                    compare(obj, prop);
                    objList = objList.concat(obj.getChildByProp(prop, value));
                }
                else {
                    compare(obj, prop);
                }
            }
            return objList;
        },

        /**
         * returns the list of childs with the specified name<br>
         * as defined in Tiled (Name field of the Object Properties)<br>
         * note : avoid calling this function every frame since
         * it parses the whole object list each time
         * @name getChildByName
         * @memberOf me.Container
         * @public
         * @function
         * @param {String} name entity name
         * @return {me.Renderable[]} Array of childs
         */

        getChildByName : function (name) {
            return this.getChildByProp("name", name);
        },

        /**
         * return the child corresponding to the specified GUID<br>
         * note : avoid calling this function every frame since
         * it parses the whole object list each time
         * @name getChildByGUID
         * @memberOf me.Container
         * @public
         * @function
         * @param {String} GUID entity GUID
         * @return {me.Renderable} corresponding child or null
         */
        getChildByGUID : function (guid) {
            var obj = this.getChildByProp("GUID", guid);
            return (obj.length > 0) ? obj[0] : null;
        },

        /**
         * returns the bounding box for this container, the smallest rectangle object completely containing all childrens
         * @name getBounds
         * @memberOf me.Container
         * @function
         * @param {me.Rect} [rect] an optional rectangle object to use when returning the bounding rect(else returns a new object)
         * @return {me.Rect} new rectangle
         */
        getBounds : function () {
            if (!this.bounds) {
                this.bounds = new me.Rect(Infinity, Infinity, -Infinity, -Infinity);
            } else {
                // reset the rect with default values
                this.bounds.pos.set(Infinity, Infinity);
                this.bounds.resize(-Infinity, -Infinity);
            }
            var childBounds;
            for (var i = this.children.length, child; i--, (child = this.children[i]);) {
                if (child.isRenderable) {
                    childBounds = child.getBounds();
                    // TODO : returns an "empty" rect instead of null (e.g. EntityObject)
                    // TODO : getBounds should always return something anyway
                    if (childBounds !== null) {
                        this.bounds.union(childBounds);
                    }
                }
            }
            // TODO : cache the value until any childs are modified? (next frame?)
            return this.bounds;
        },

        /**
         * Invokes the removeChildNow in a defer, to ensure the child is removed safely after the update & draw stack has completed
         * @name removeChild
         * @memberOf me.Container
         * @public
         * @function
         * @param {me.Renderable} child
         * @param {Boolean} [keepalive=False] True to prevent calling child.destroy()
         */
        removeChild : function (child, keepalive) {
            if (child.ancestor) {
                deferredRemove.defer(this, child, keepalive);
            }
        },


        /**
         * Removes (and optionally destroys) a child from the container.<br>
         * (removal is immediate and unconditional)<br>
         * Never use keepalive=true with objects from {@link me.pool}. Doing so will create a memory leak.
         * @name removeChildNow
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         * @param {Boolean} [keepalive=False] True to prevent calling child.destroy()
         */
        removeChildNow : function (child, keepalive) {
            if  (this.hasChild(child)) {

                child.ancestor = undefined;

                if (typeof child.onDeactivateEvent === "function") {
                    child.onDeactivateEvent();
                }

                if (!keepalive) {
                    if (typeof (child.destroy) === "function") {
                        child.destroy();
                    }

                    me.pool.push(child);
                }

                this.children.splice(this.getChildIndex(child), 1);

            }
            else {
                throw new me.Container.Error(child + " The supplied child must be a child of the caller " + this);
            }
        },

        /**
         * Automatically set the specified property of all childs to the given value
         * @name setChildsProperty
         * @memberOf me.Container
         * @function
         * @param {String} property property name
         * @param {Object} value property value
         * @param {Boolean} [recursive=false] recursively apply the value to child containers if true
         */

        setChildsProperty : function (prop, val, recursive) {
            for (var i = this.children.length; i >= 0; i--) {
                var obj = this.children[i];
                if ((recursive === true) && (obj instanceof me.Container)) {
                    obj.setChildsProperty(prop, val, recursive);
                }
                obj[prop] = val;
            }
        },

        /**
         * Move the child in the group one step forward (z depth).
         * @name moveUp
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         */
        moveUp : function (child) {
            var childIndex = this.getChildIndex(child);
            if (childIndex - 1 >= 0) {
                // note : we use an inverted loop
                this.swapChildren(child, this.getChildAt(childIndex - 1));
            }
        },

        /**
         * Move the child in the group one step backward (z depth).
         * @name moveDown
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         */
        moveDown : function (child) {
            var childIndex = this.getChildIndex(child);
            if (childIndex + 1 < this.children.length) {
                // note : we use an inverted loop
                this.swapChildren(child, this.getChildAt(childIndex + 1));
            }
        },

        /**
         * Move the specified child to the top(z depth).
         * @name moveToTop
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         */
        moveToTop : function (child) {
            var childIndex = this.getChildIndex(child);
            if (childIndex > 0) {
                // note : we use an inverted loop
                this.children.splice(0, 0, this.children.splice(childIndex, 1)[0]);
                // increment our child z value based on the previous child depth
                child.z = this.children[1].z + 1;
            }
        },

        /**
         * Move the specified child the bottom (z depth).
         * @name moveToBottom
         * @memberOf me.Container
         * @function
         * @param {me.Renderable} child
         */
        moveToBottom : function (child) {
            var childIndex = this.getChildIndex(child);
            if (childIndex < (this.children.length - 1)) {
                // note : we use an inverted loop
                this.children.splice((this.children.length - 1), 0, this.children.splice(childIndex, 1)[0]);
                // increment our child z value based on the next child depth
                child.z = this.children[(this.children.length - 2)].z - 1;
            }
        },

        /**
         * Manually trigger the sort of all the childs in the container</p>
         * @name sort
         * @memberOf me.Container
         * @public
         * @function
         * @param {Boolean} [recursive=false] recursively sort all containers if true
         */
        sort : function (recursive) {

            // do nothing if there is already a pending sort
            if (this.pendingSort === null) {
                if (recursive === true) {
                    // trigger other child container sort function (if any)
                    for (var i = this.children.length, obj; i--, (obj = this.children[i]);) {
                        if (obj instanceof me.Container) {
                            // note : this will generate one defered sorting function
                            // for each existing containe
                            obj.sort(recursive);
                        }
                    }
                }
                /** @ignore */
                this.pendingSort = function (self) {
                    // sort everything in this container
                    self.children.sort(self["_sort" + self.sortOn.toUpperCase()]);
                    // clear the defer id
                    self.pendingSort = null;
                    // make sure we redraw everything
                    me.game.repaint();
                }.defer(this, this);
            }
        },

        /**
         * Z Sorting function
         * @ignore
         */
        _sortZ : function (a, b) {
            return (b.z) - (a.z);
        },

        /**
         * X Sorting function
         * @ignore
         */
        _sortX : function (a, b) {
            /* ? */
            var result = (b.z - a.z);
            return (result ? result : ((b.pos && b.pos.x) - (a.pos && a.pos.x)) || 0);
        },

        /**
         * Y Sorting function
         * @ignore
         */
        _sortY : function (a, b) {
            var result = (b.z - a.z);
            return (result ? result : ((b.pos && b.pos.y) - (a.pos && a.pos.y)) || 0);
        },

        /**
         * Destroy function<br>
         * @ignore
         */
        destroy : function () {
            // cancel any sort operation
            if (this.pendingSort) {
                clearTimeout(this.pendingSort);
                this.pendingSort = null;
            }

            // delete all children
            for (var i = this.children.length, obj; i--, (obj = this.children[i]);) {
                // don't remove it if a persistent object
                if (!obj.isPersistent) {
                    this.removeChildNow(obj);
                }
            }

            // reset the transformation matrix
            this.transform.identity();
        },

        /**
         * @ignore
         */
        update : function (dt) {
            var isDirty = false;
            var isFloating = false;
            var isPaused = me.state.isPaused();
            var isTranslated = false;
            var isStacked = false;
            var stack = [];
            var x = 0;
            var y = 0;
            var z = 0;
            var viewport = me.game.viewport;

            for (var i = this.children.length, obj; i--, (obj = this.children[i]);) {
                if (isPaused && (!obj.updateWhenPaused)) {
                    // skip this object
                    continue;
                }

                if (obj.isRenderable) {
                    isFloating = (globalFloatingCounter > 0 || obj.floating);
                    if (isFloating) {
                        globalFloatingCounter++;
                    }

                    // Translate global context
                    isTranslated = !isFloating;
                    if (isTranslated) {
                        x = obj.pos.x;
                        y = obj.pos.y;
                        z = Math.abs(x + y + obj.width + obj.height);
                        if (z !== z || z === Infinity) {
                            isStacked = true;
                            stack.push(globalTranslation.clone());
                        }
                        globalTranslation.translateV(obj.pos);
                        globalTranslation.resize(obj.width, obj.height);
                    }

                    // check if object is visible
                    obj.inViewport = isFloating || viewport.isVisible(globalTranslation);

                    // update our object
                    isDirty = ((obj.inViewport || obj.alwaysUpdate) && obj.update(dt)) || isDirty;

                    // Undo global context translation
                    if (isTranslated) {
                        if (isStacked) {
                            isStacked = false;
                            globalTranslation.copy(stack.pop());
                        }
                        else {
                            globalTranslation.translate(-x, -y);
                        }
                    }

                    if (globalFloatingCounter > 0) {
                        globalFloatingCounter--;
                    }
                }
                else {
                    // just directly call update() for non renderable object
                    isDirty = obj.update(dt) || isDirty;
                }
            }
            return isDirty;
        },

        /**
         * @ignore
         */
        draw : function (renderer, rect) {
            var viewport = me.game.viewport;
            var isFloating = false;

            this.drawCount = 0;

            renderer.save();

            // apply the container current transform
            renderer.transform.apply(renderer, this.transform.val);

            // apply the group opacity
            renderer.setGlobalAlpha(renderer.globalAlpha() * this.getOpacity());

            // translate to the container position
            renderer.translate(this.pos.x, this.pos.y);

            for (var i = this.children.length, obj; i--, (obj = this.children[i]);) {
                isFloating = obj.floating;
                if ((obj.inViewport || isFloating) && obj.isRenderable) {
                    if (isFloating === true) {
                        // translate to object
                        renderer.translate(
                            viewport.screenX - this.pos.x,
                            viewport.screenY - this.pos.y
                        );
                    }

                    // draw the object
                    obj.draw(renderer, rect);

                    if (isFloating === true) {
                        // translate back to viewport
                        renderer.translate(
                            this.pos.x - viewport.screenX,
                            this.pos.y - viewport.screenY
                        );
                    }

                    this.drawCount++;
                }
            }

            renderer.restore();
        }
    });

    /**
     * Base class for ObjectContainer exception handling.
     * @name Error
     * @class
     * @memberOf me.Container
     * @constructor
     * @param {String} msg Error message.
     */
    me.Container.Error = me.Renderable.Error.extend({
        init : function (msg) {
            me.Renderable.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Container.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */

(function () {


    /**
     * a Generic Object Entity<br>
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the entity object
     * @param {Number} y the y coordinates of the entity object
     * @param {Object} settings Entity properties, to be defined through Tiled or when caling the entity constructor
     * <img src="images/object_properties.png"/>
     * @param {String} [settings.name] object entity name
     * @param {String} [settings.image] resource name of a spritesheet to use for the entity renderable component
     * @param {Number} [settings.spritewidth] width of a single sprite in the given spritesheet
     * @param {Number} [settings.spriteheight] height of a single sprite in the given spritesheet
     * @param {String} [settings.type] object type
     * @param {Number} [settings.collisionMask] Mask collision detection for this object
     */
    me.Entity = me.Renderable.extend(
    /** @scope me.Entity.prototype */
    {
        /** @ignore */
        init : function (x, y, settings) {

            /**
             * The entity renderable object (if defined)
             * @public
             * @type me.Renderable
             * @name renderable
             * @memberOf me.Entity
             */
            this.renderable = null;

            /**
             * The bounding rectangle for this entity
             * @protected
             * @type {me.Rect}
             * @name bounds
             * @memberOf me.Ellipse
             */
            this.bounds = undefined;

            // ensure mandatory properties are defined
            if ((typeof settings.width !== "number") || (typeof settings.height !== "number")) {
                throw new me.Entity.Error("height and width properties are mandatory when passing settings parameters to an object entity");
            }

            // call the super constructor
            me.Renderable.prototype.init.apply(this, [x, y,
                        settings.width,
                        settings.height]);

            if (settings.image) {
                var image = typeof settings.image === "object" ? settings.image : me.loader.getImage(settings.image);
                this.renderable = new me.AnimationSheet(0, 0, {
                    "image" : image,
                    "spritewidth" : ~~(settings.spritewidth || settings.width),
                    "spriteheight" : ~~(settings.spriteheight || settings.height),
                    "spacing" : ~~settings.spacing,
                    "margin" : ~~settings.margin
                });

                // check for user defined transparent color
                if (settings.transparent_color) {
                    this.renderable.setTransparency(settings.transparent_color);
                }
            }

            /**
             * Entity name<br>
             * as defined in the Tiled Object Properties
             * @public
             * @property String name
             * @memberOf me.Entity
             */
            this.name = settings.name ? settings.name.toLowerCase() : "";

            /**
             * object type (as defined in Tiled)
             * @public
             * @property String type
             * @memberOf me.Entity
             */
            this.type = settings.type;

            /**
             * dead/living state of the entity<br>
             * default value : true
             * @public
             * @type Boolean
             * @name alive
             * @memberOf me.Entity
             */
            this.alive = true;

            /**
             * the entity body object
             * @public
             * @type me.Body
             * @name body
             * @memberOf me.Entity
             */
            // initialize the default body
            this.body = new me.Body(this, (
                typeof (settings.getTMXShapes) === "function" ?
                settings.getTMXShapes() : []
            ));

            // ensure the entity bounds and pos are up-to-date
            this.body.updateBounds();

            // resize the entity if required
            if (this.width === 0 && this.height === 0) {
                this.resize(this.body.width, this.body.height);
            }

            // set the  collision mask if defined
            if (typeof(settings.collisionMask) !== "undefined") {
                this.body.setCollisionMask(settings.collisionMask);
            }

            // set the  collision mask if defined
            if (typeof(settings.collisionType) !== "undefined") {
                if (typeof me.collision.types[settings.collisionType] !== "undefined") {
                    this.body.collisionType = me.collision.types[settings.collisionType];
                } else {
                    throw new me.Entity.Error("Invalid value for the collisionType property");
                }
            }
        },

       /**
         * returns the bounding box for this entity, the smallest rectangle object completely containing this entity body shapes
         * @name getBounds
         * @memberOf me.Entity
         * @function
         * @return {me.Rect} this entity bounding box Rectangle object
         */
        getBounds : function () {
            return this.bounds;
        },

        /**
         * update the entity bounding rect (private)
         * when manually update the entity pos, you need to call this function
         * @protected
         * @name updateBounds
         * @memberOf me.Entity
         * @function
         */
        updateBounds : function () {
            if (!this.bounds) {
                this.bounds = new me.Rect(0, 0, 0, 0);
            }
            this.bounds.pos.setV(this.pos).add(this.body.pos);
            this.bounds.resize(this.body.width, this.body.height);
            return this.bounds;
        },

        /**
         * return the distance to the specified entity
         * @name distanceTo
         * @memberOf me.Entity
         * @function
         * @param {me.Entity} entity Entity
         * @return {Number} distance
         */
        distanceTo: function (e) {
            // the me.Vector2d object also implements the same function, but
            // we have to use here the center of both entities
            var dx = (this.pos.x + (this.width / 2))  - (e.pos.x + (e.width / 2));
            var dy = (this.pos.y + (this.height / 2)) - (e.pos.y + (e.height / 2));
            return Math.sqrt(dx * dx + dy * dy);
        },

        /**
         * return the distance to the specified point
         * @name distanceToPoint
         * @memberOf me.Entity
         * @function
         * @param {me.Vector2d} vector vector
         * @return {Number} distance
         */
        distanceToPoint: function (v) {
            // the me.Vector2d object also implements the same function, but
            // we have to use here the center of both entities
            var dx = (this.pos.x + (this.width / 2))  - (v.x);
            var dy = (this.pos.y + (this.height / 2)) - (v.y);
            return Math.sqrt(dx * dx + dy * dy);
        },

        /**
         * return the angle to the specified entity
         * @name angleTo
         * @memberOf me.Entity
         * @function
         * @param {me.Entity} entity Entity
         * @return {Number} angle in radians
         */
        angleTo: function (e) {
            var a = this.getBounds();
            var b = e.getBounds();
            // the me.Vector2d object also implements the same function, but
            // we have to use here the center of both entities
            var ax = (b.pos.x + (b.width / 2)) - (a.pos.x + (a.width / 2));
            var ay = (b.pos.y + (b.height / 2)) - (a.pos.y + (a.height / 2));
            return Math.atan2(ay, ax);
        },

        /**
         * return the angle to the specified point
         * @name angleToPoint
         * @memberOf me.Entity
         * @function
         * @param {me.Vector2d} vector vector
         * @return {Number} angle in radians
         */
        angleToPoint: function (v) {
            var a = this.getBounds();
            // the me.Vector2d object also implements the same function, but
            // we have to use here the center of both entities
            var ax = (v.x) - (a.pos.x + (a.width / 2));
            var ay = (v.y) - (a.pos.y + (a.height / 2));
            return Math.atan2(ay, ax);
        },

        /** @ignore */
        update : function (dt) {
            if (this.renderable) {
                return this.renderable.update(dt);
            }
            return false;
        },

        /**
         * object draw<br>
         * not to be called by the end user<br>
         * called by the game manager on each game loop
         * @name draw
         * @memberOf me.Entity
         * @function
         * @protected
         * @param {Context2d} context 2d Context on which draw our object
         **/
        draw : function (renderer) {
            // draw the sprite if defined
            if (this.renderable) {
                // translate the renderable position (relative to the entity)
                // and keeps it in the entity defined bounds
                var _bounds = this.getBounds();

                var x = ~~(0.5 + _bounds.pos.x + (
                    this.anchorPoint.x * (_bounds.width - this.renderable.width)
                ));
                var y = ~~(0.5 + _bounds.pos.y + (
                    this.anchorPoint.y * (_bounds.height - this.renderable.height)
                ));
                renderer.translate(x, y);
                this.renderable.draw(renderer);
                renderer.translate(-x, -y);
            }
        },

        /**
         * Destroy function<br>
         * @ignore
         */
        destroy : function () {
            // free some property objects
            if (this.renderable) {
                this.renderable.destroy.apply(this.renderable, arguments);
                this.renderable = null;
            }
            this.body.destroy.apply(this.body, arguments);
            this.body = null;
        },

        /**
         * OnDestroy Notification function<br>
         * Called by engine before deleting the object
         * @name onDestroyEvent
         * @memberOf me.Entity
         * @function
         */
        onDestroyEvent : function () {
            // to be extended !
        },

        /**
         * onCollision callback<br>
         * triggered in case of collision, when this entity body is being "touched" by another one<br>
         * @name onCollision
         * @memberOf me.Entity
         * @function
         * @param {me.collision.ResponseObject} response the collision response object
         * @param {me.Entity} other the other entity touching this one (a reference to response.a or response.b)
         * @return {Boolean} true if the object should respond to the collision (its position and velocity will be corrected)
         */
        onCollision : function () {
            return false;
        }
    });

    /*
     * A Collectable entity
     */

    /**
     * @class
     * @extends me.Entity
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the entity object
     * @param {Number} y the y coordinates of the entity object
     * @param {me.ObjectSettings} settings Object Properties as defined in Tiled<br>
     */
    me.CollectableEntity = me.Entity.extend(
    /** @scope me.CollectableEntity.prototype */
    {
        /** @ignore */
        init : function (x, y, settings) {
            // call the super constructor
            me.Entity.prototype.init.apply(this, [x, y, settings]);
            this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
        }
    });

    /*
     * A level entity
     */

    /**
     * @class
     * @extends me.Entity
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the object
     * @param {Number} y the y coordinates of the object
     * @param {me.ObjectSettings} settings object settings
     * @example
     * me.game.world.addChild(new me.LevelEntity(
     *     x, y, {
     *         "duration" : 250, // Fade duration (in ms)
     *         "color" : "#000", // Fade color
     *         "to" : "mymap2"   // TMX level to load
     *     }
     * ));
     */
    me.LevelEntity = me.Entity.extend(
    /** @scope me.LevelEntity.prototype */
    {
        /** @ignore */
        init : function (x, y, settings) {
            me.Entity.prototype.init.apply(this, [x, y, settings]);

            this.nextlevel = settings.to;

            this.fade = settings.fade;
            this.duration = settings.duration;
            this.fading = false;

            this.name = "levelEntity";

            // a temp variable
            this.gotolevel = settings.to;

            this.body.collisionType = me.collision.types.ACTION_OBJECT;
        },

        /**
         * @ignore
         */
        onFadeComplete : function () {
            me.levelDirector.loadLevel(this.gotolevel);
            me.game.viewport.fadeOut(this.fade, this.duration);
        },

        /**
         * go to the specified level
         * @name goTo
         * @memberOf me.LevelEntity
         * @function
         * @param {String} [level=this.nextlevel] name of the level to load
         * @protected
         */
        goTo : function (level) {
            this.gotolevel = level || this.nextlevel;
            // load a level
            //console.log("going to : ", to);
            if (this.fade && this.duration) {
                if (!this.fading) {
                    this.fading = true;
                    me.game.viewport.fadeIn(this.fade, this.duration,
                            this.onFadeComplete.bind(this));
                }
            } else {
                me.levelDirector.loadLevel(this.gotolevel);
            }
        },

        /** @ignore */
        onCollision : function () {
            if (this.name === "levelEntity") {
                this.goTo();
            }
            return false;
        }
    });

    /**
     * Base class for Entity exception handling.
     * @name Error
     * @class
     * @memberOf me.Entity
     * @constructor
     * @param {String} msg Error message.
     */
    me.Entity.Error = me.Renderable.Error.extend({
        init : function (msg) {
            me.Renderable.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Entity.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Screens objects & State machine
 *
 */

(function () {
    /**
     * A class skeleton for "Screen" Object <br>
     * every "screen" object (title screen, credits, ingame, etc...) to be managed <br>
     * through the state manager must inherit from this base class.
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @see me.state
     */
    me.ScreenObject = Object.extend(
    /** @scope me.ScreenObject.prototype */
    {
        /** @ignore */
        init: function () {},

        /**
         * Object reset function
         * @ignore
         */
        reset : function () {
            // reset the game manager
            me.game.reset();
            // call the onReset Function
            this.onResetEvent.apply(this, arguments);
        },

        /**
         * destroy function
         * @ignore
         */
        destroy : function () {
            // notify the object
            this.onDestroyEvent.apply(this, arguments);
        },

        /**
         * onResetEvent function<br>
         * called by the state manager when reseting the object<br>
         * this is typically where you will load a level, etc...
         * to be extended
         * @name onResetEvent
         * @memberOf me.ScreenObject
         * @function
         * @param {} [arguments...] optional arguments passed when switching state
         * @see me.state#change
         */
        onResetEvent : function () {
            // to be extended
        },

        /**
         * onDestroyEvent function<br>
         * called by the state manager before switching to another state<br>
         * @name onDestroyEvent
         * @memberOf me.ScreenObject
         * @function
         */
        onDestroyEvent : function () {
            // to be extended
        }
    });

    // based on the requestAnimationFrame polyfill by Erik Möller
    (function () {
        var lastTime = 0;
        var frameDuration = 1000 / 60;
        // get unprefixed rAF and cAF, if present
        var requestAnimationFrame = me.agent.prefixed("requestAnimationFrame");
        var cancelAnimationFrame = me.agent.prefixed("cancelAnimationFrame") ||
                                   me.agent.prefixed("cancelRequestAnimationFrame");

        if (!requestAnimationFrame || !cancelAnimationFrame) {
            requestAnimationFrame = function (callback) {
                var currTime = window.performance.now();
                var timeToCall = Math.max(0, frameDuration - (currTime - lastTime));
                var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

            cancelAnimationFrame = function (id) {
                window.clearTimeout(id);
            };
        }

         // put back in global namespace
        window.requestAnimationFrame = requestAnimationFrame;
        window.cancelAnimationFrame = cancelAnimationFrame;
    }());


    /**
     * a State Manager (state machine)<p>
     * There is no constructor function for me.state.
     * @namespace me.state
     * @memberOf me
     */

    me.state = (function () {
        // hold public stuff in our singleton
        var api = {};

        /*-------------------------------------------
            PRIVATE STUFF
         --------------------------------------------*/

        // current state
        var _state = -1;

        // requestAnimeFrame Id
        var _animFrameId = -1;

        // whether the game state is "paused"
        var _isPaused = false;

        // list of screenObject
        var _screenObject = {};

        // fading transition parameters between screen
        var _fade = {
            color : "",
            duration : 0
        };

        // callback when state switch is done
        /** @ignore */
        var _onSwitchComplete = null;

        // just to keep track of possible extra arguments
        var _extraArgs = null;

        // store the elapsed time during pause/stop period
        var _pauseTime = 0;

        /**
         * @ignore
         */
        function _startRunLoop() {
            // ensure nothing is running first and in valid state
            if ((_animFrameId === -1) && (_state !== -1)) {
                // reset the timer
                me.timer.reset();

                // start the main loop
                _animFrameId = window.requestAnimationFrame(_renderFrame);
            }
        }

        /**
         * Resume the game loop after a pause.
         * @ignore
         */
        function _resumeRunLoop() {
            // ensure game is actually paused and in valid state
            if (_isPaused && (_state !== -1)) {
                // reset the timer
                me.timer.reset();

                _isPaused = false;
            }
        }

        /**
         * Pause the loop for most screen objects.
         * @ignore
         */
        function _pauseRunLoop() {
            // Set the paused boolean to stop updates on (most) entities
            _isPaused = true;
        }

        /**
         * this is only called when using requestAnimFrame stuff
         * @param {Number} time current timestamp in milliseconds
         * @ignore
         */
        function _renderFrame(time) {
            // update all game objects
            me.game.update(time);
            // render all game objects
            me.game.draw();
            // schedule the next frame update
            if (_animFrameId !== -1) {
                _animFrameId = window.requestAnimationFrame(_renderFrame);
            }
        }

        /**
         * stop the SO main loop
         * @ignore
         */
        function _stopRunLoop() {
            // cancel any previous animationRequestFrame
            window.cancelAnimationFrame(_animFrameId);
            _animFrameId = -1;
        }

        /**
         * start the SO main loop
         * @ignore
         */
        function _switchState(state) {
            // clear previous interval if any
            _stopRunLoop();

            // call the screen object destroy method
            if (_screenObject[_state]) {
                // just notify the object
                _screenObject[_state].screen.destroy();
            }

            if (_screenObject[state]) {
                // set the global variable
                _state = state;

                // call the reset function with _extraArgs as arguments
                _screenObject[_state].screen.reset.apply(_screenObject[_state].screen, _extraArgs);

                // and start the main loop of the
                // new requested state
                _startRunLoop();

                // execute callback if defined
                if (_onSwitchComplete) {
                    _onSwitchComplete();
                }

                // force repaint
                me.game.repaint();
            }
        }

        /*
         * PUBLIC STUFF
         */

        /**
         * default state ID for Loading Screen
         * @constant
         * @name LOADING
         * @memberOf me.state
         */
        api.LOADING = 0;

        /**
         * default state ID for Menu Screen
         * @constant
         * @name MENU
         * @memberOf me.state
         */

        api.MENU = 1;
        /**
         * default state ID for "Ready" Screen
         * @constant
         * @name READY
         * @memberOf me.state
         */

        api.READY = 2;
        /**
         * default state ID for Play Screen
         * @constant
         * @name PLAY
         * @memberOf me.state
         */

        api.PLAY = 3;
        /**
         * default state ID for Game Over Screen
         * @constant
         * @name GAMEOVER
         * @memberOf me.state
         */

        api.GAMEOVER = 4;
        /**
         * default state ID for Game End Screen
         * @constant
         * @name GAME_END
         * @memberOf me.state
         */

        api.GAME_END = 5;
        /**
         * default state ID for High Score Screen
         * @constant
         * @name SCORE
         * @memberOf me.state
         */

        api.SCORE = 6;
        /**
         * default state ID for Credits Screen
         * @constant
         * @name CREDITS
         * @memberOf me.state
         */

        api.CREDITS = 7;
        /**
         * default state ID for Settings Screen
         * @constant
         * @name SETTINGS
         * @memberOf me.state
         */
        api.SETTINGS = 8;

        /**
         * default state ID for user defined constants<br>
         * @constant
         * @name USER
         * @memberOf me.state
         * @example
         * var STATE_INFO = me.state.USER + 0;
         * var STATE_WARN = me.state.USER + 1;
         * var STATE_ERROR = me.state.USER + 2;
         * var STATE_CUTSCENE = me.state.USER + 3;
         */
        api.USER = 100;

        /**
         * onPause callback
         * @callback
         * @name onPause
         * @memberOf me.state
         */
        api.onPause = null;

        /**
         * onResume callback
         * @callback
         * @name onResume
         * @memberOf me.state
         */
        api.onResume = null;

        /**
         * onStop callback
         * @callback
         * @name onStop
         * @memberOf me.state
         */
        api.onStop = null;

        /**
         * onRestart callback
         * @callback
         * @name onRestart
         * @memberOf me.state
         */
        api.onRestart = null;

        /**
         * @ignore
         */
        api.init = function () {
            // set the embedded loading screen
            api.set(api.LOADING, new me.DefaultLoadingScreen());
        };

        /**
         * Stop the current screen object.
         * @name stop
         * @memberOf me.state
         * @public
         * @function
         * @param {Boolean} pauseTrack pause current track on screen stop.
         */
        api.stop = function (music) {
            // only stop when we are not loading stuff
            if ((_state !== api.LOADING) && api.isRunning()) {
                // stop the main loop
                _stopRunLoop();
                // current music stop
                if (music === true) {
                    me.audio.pauseTrack();
                }

                // store time when stopped
                _pauseTime = window.performance.now();

                // publish the stop notification
                me.event.publish(me.event.STATE_STOP);
                // any callback defined ?
                if (typeof(api.onStop) === "function") {
                    api.onStop();
                }
            }
        };

        /**
         * pause the current screen object
         * @name pause
         * @memberOf me.state
         * @public
         * @function
         * @param {Boolean} pauseTrack pause current track on screen pause
         */
        api.pause = function (music) {
            // only pause when we are not loading stuff
            if ((_state !== api.LOADING) && !api.isPaused()) {
                // stop the main loop
                _pauseRunLoop();
                // current music stop
                if (music === true) {
                    me.audio.pauseTrack();
                }

                // store time when paused
                _pauseTime = window.performance.now();

                // publish the pause event
                me.event.publish(me.event.STATE_PAUSE);
                // any callback defined ?
                if (typeof(api.onPause) === "function") {
                    api.onPause();
                }
            }
        };

        /**
         * Restart the screen object from a full stop.
         * @name restart
         * @memberOf me.state
         * @public
         * @function
         * @param {Boolean} resumeTrack resume current track on screen resume
         */
        api.restart = function (music) {
            if (!api.isRunning()) {
                // restart the main loop
                _startRunLoop();
                // current music stop
                if (music === true) {
                    me.audio.resumeTrack();
                }

                // calculate the elpased time
                _pauseTime = window.performance.now() - _pauseTime;

                // force repaint
                me.game.repaint();

                // publish the restart notification
                me.event.publish(me.event.STATE_RESTART, [ _pauseTime ]);
                // any callback defined ?
                if (typeof(api.onRestart) === "function") {
                    api.onRestart();
                }
            }
        };

        /**
         * resume the screen object
         * @name resume
         * @memberOf me.state
         * @public
         * @function
         * @param {Boolean} resumeTrack resume current track on screen resume
         */
        api.resume = function (music) {
            if (api.isPaused()) {
                // resume the main loop
                _resumeRunLoop();
                // current music stop
                if (music === true) {
                    me.audio.resumeTrack();
                }

                // calculate the elpased time
                _pauseTime = window.performance.now() - _pauseTime;

                // publish the resume event
                me.event.publish(me.event.STATE_RESUME, [ _pauseTime ]);
                // any callback defined ?
                if (typeof(api.onResume) === "function") {
                    api.onResume();
                }
            }
        };

        /**
         * return the running state of the state manager
         * @name isRunning
         * @memberOf me.state
         * @public
         * @function
         * @return {Boolean} true if a "process is running"
         */
        api.isRunning = function () {
            return _animFrameId !== -1;
        };

        /**
         * Return the pause state of the state manager
         * @name isPaused
         * @memberOf me.state
         * @public
         * @function
         * @return {Boolean} true if the game is paused
         */
        api.isPaused = function () {
            return _isPaused;
        };

        /**
         * associate the specified state with a screen object
         * @name set
         * @memberOf me.state
         * @public
         * @function
         * @param {Number} state State ID (see constants)
         * @param {me.ScreenObject} so Instantiated ScreenObject to associate
         * with state ID
         * @example
         * var MenuButton = me.GUI_Object.extend({
         *     "onClick" : function () {
         *         // Change to the PLAY state when the button is clicked
         *         me.state.change(me.state.PLAY);
         *         return true;
         *     }
         * });
         *
         * var MenuScreen = me.ScreenObject.extend({
         *     onResetEvent: function() {
         *         // Load background image
         *         me.game.world.addChild(
         *             new me.ImageLayer("bg", 0, 0, "bg"),
         *             0 // z-index
         *         );
         *
         *         // Add a button
         *         me.game.world.addChild(
         *             new MenuButton(350, 200, { "image" : "start" }),
         *             1 // z-index
         *         );
         *
         *         // Play music
         *         me.audio.playTrack("menu");
         *     },
         *
         *     "onDestroyEvent" : function () {
         *         // Stop music
         *         me.audio.stopTrack();
         *     }
         * });
         *
         * me.state.set(me.state.MENU, new MenuScreen());
         */
        api.set = function (state, so) {
            _screenObject[state] = {};
            _screenObject[state].screen = so;
            _screenObject[state].transition = true;
        };

        /**
         * return a reference to the current screen object<br>
         * useful to call a object specific method
         * @name current
         * @memberOf me.state
         * @public
         * @function
         * @return {me.ScreenObject}
         */
        api.current = function () {
            return _screenObject[_state].screen;
        };

        /**
         * specify a global transition effect
         * @name transition
         * @memberOf me.state
         * @public
         * @function
         * @param {String} effect (only "fade" is supported for now)
         * @param {me.Color|String} color a CSS color value
         * @param {Number} [duration=1000] expressed in milliseconds
         */
        api.transition = function (effect, color, duration) {
            if (effect === "fade") {
                _fade.color = color;
                _fade.duration = duration;
            }
        };

        /**
         * enable/disable transition for a specific state (by default enabled for all)
         * @name setTransition
         * @memberOf me.state
         * @public
         * @function
         * @param {Number} state State ID (see constants)
         * @param {Boolean} enable
         */
        api.setTransition = function (state, enable) {
            _screenObject[state].transition = enable;
        };

        /**
         * change the game/app state
         * @name change
         * @memberOf me.state
         * @public
         * @function
         * @param {Number} state State ID (see constants)
         * @param {} [arguments...] extra arguments to be passed to the reset functions
         * @example
         * // The onResetEvent method on the play screen will receive two args:
         * // "level_1" and the number 3
         * me.state.change(me.state.PLAY, "level_1", 3);
         */
        api.change = function (state) {
            // Protect against undefined ScreenObject
            if (typeof(_screenObject[state]) === "undefined") {
                throw new me.Error("Undefined ScreenObject for state '" + state + "'");
            }

            _extraArgs = null;
            if (arguments.length > 1) {
                // store extra arguments if any
                _extraArgs = Array.prototype.slice.call(arguments, 1);
            }
            // if fading effect
            if (_fade.duration && _screenObject[state].transition) {
                /** @ignore */
                _onSwitchComplete = function () {
                    me.game.viewport.fadeOut(_fade.color, _fade.duration);
                };
                me.game.viewport.fadeIn(
                    _fade.color,
                    _fade.duration,
                    function () {
                        _switchState.defer(this, state);
                    }
                );

            }
            // else just switch without any effects
            else {
                // wait for the last frame to be
                // "finished" before switching
                _switchState.defer(this, state);
            }
        };

        /**
         * return true if the specified state is the current one
         * @name isCurrent
         * @memberOf me.state
         * @public
         * @function
         * @param {Number} state State ID (see constants)
         */
        api.isCurrent = function (state) {
            return _state === state;
        };

        // return our object
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * @copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 */
(function () {
    // a basic progress bar object
    var ProgressBar = me.Renderable.extend({

        init: function (v, w, h) {
            me.Renderable.prototype.init.apply(this, [v.x, v.y, w, h]);
            // flag to know if we need to refresh the display
            this.invalidate = false;

            // default progress bar height
            this.barHeight = 4;

            // current progress
            this.progress = 0;
        },

        // make sure the screen is refreshed every frame
        onProgressUpdate : function (progress) {
            this.progress = ~~(progress * this.width);
            this.invalidate = true;
        },

        // make sure the screen is refreshed every frame
        update : function () {
            if (this.invalidate === true) {
                // clear the flag
                this.invalidate = false;
                // and return true
                return true;
            }
            // else return false
            return false;
        },

         // draw function
        draw : function (renderer) {
            // draw the progress bar
            renderer.setColor("#000000");
            renderer.fillRect(0, (this.height / 2) - (this.barHeight / 2), this.width, this.barHeight);
            renderer.setColor("#55aa00");
            renderer.fillRect(2, (this.height / 2) - (this.barHeight / 2), this.progress, this.barHeight);
        }
    });

    // the melonJS Logo
    var IconLogo = me.Renderable.extend({
        init : function (iconCanvas, x, y) {
            me.Renderable.prototype.init.apply(this, [x, y, 100, 85]);

            this.iconCanvas = iconCanvas;

            var context = me.CanvasRenderer.getContext2d(this.iconCanvas);

            context.translate(this.pos.x, this.pos.y);
            context.beginPath();
            context.moveTo(0.7, 48.9);
            context.bezierCurveTo(10.8, 68.9, 38.4, 75.8, 62.2, 64.5);
            context.bezierCurveTo(86.1, 53.1, 97.2, 27.7, 87.0, 7.7);
            context.lineTo(87.0, 7.7);
            context.bezierCurveTo(89.9, 15.4, 73.9, 30.2, 50.5, 41.4);
            context.bezierCurveTo(27.1, 52.5, 5.2, 55.8, 0.7, 48.9);
            context.lineTo(0.7, 48.9);
            context.lineTo(0.7, 48.9);
            context.closePath();
            context.fillStyle = "rgb(255, 255, 255)";
            context.fill();

            context.beginPath();
            context.moveTo(84.0, 7.0);
            context.bezierCurveTo(87.6, 14.7, 72.5, 30.2, 50.2, 41.6);
            context.bezierCurveTo(27.9, 53.0, 6.9, 55.9, 3.2, 48.2);
            context.bezierCurveTo(-0.5, 40.4, 14.6, 24.9, 36.9, 13.5);
            context.bezierCurveTo(59.2, 2.2, 80.3, -0.8, 84.0, 7.0);
            context.lineTo(84.0, 7.0);
            context.closePath();
            context.lineWidth = 5.3;
            context.strokeStyle = "rgb(255, 255, 255)";
            context.lineJoin = "miter";
            context.miterLimit = 4.0;
            context.stroke();
        },

        draw : function (renderer) {
            renderer.drawImage(this.iconCanvas, 0, 0);
        }
    });

    // the melonJS Text Logo
    var TextLogo = me.Renderable.extend({
        // constructor
        init : function (w, h) {
            me.Renderable.prototype.init.apply(this, [0, 0, w, h]);
            this.logo1 = new me.Font("century gothic", 32, "white", "middle");
            this.logo2 = new me.Font("century gothic", 32, "#55aa00", "middle");
            this.logo2.bold();
            this.logo1.textBaseline = this.logo2.textBaseline = "alphabetic";
        },

        draw : function (renderer) {
            // measure the logo size
            var logo1_width = renderer.measureText(this.logo1, "melon").width;
            var xpos = (this.width - logo1_width - renderer.measureText(this.logo2, "JS").width) / 2;
            var ypos = (this.height / 2) + (renderer.measureText(this.logo2, "melon").height);

            // draw the melonJS string
            renderer.drawFont(this.logo1, "melon", xpos, ypos);
            xpos += logo1_width;
            renderer.drawFont(this.logo2, "JS", xpos, ypos);
        }

    });

    /**
     * a default loading screen
     * @memberOf me
     * @ignore
     * @constructor
     */
    me.DefaultLoadingScreen = me.ScreenObject.extend({
        // call when the loader is resetted
        onResetEvent : function () {
            me.game.reset();

            // background color
            me.game.world.addChild(new me.ColorLayer("background", "#202020", 0));

            // progress bar
            var progressBar = new ProgressBar(
                new me.Vector2d(),
                me.video.renderer.getWidth(),
                me.video.renderer.getHeight()
            );
            this.handle = me.event.subscribe(
                me.event.LOADER_PROGRESS,
                progressBar.onProgressUpdate.bind(progressBar)
            );
            me.game.world.addChild(progressBar, 1);
            this.iconCanvas = me.video.createCanvas(me.game.viewport.width, me.game.viewport.height, false);
            // melonJS text & logo
            var icon = new IconLogo(
                this.iconCanvas,
                (me.video.renderer.getWidth() - 100) / 2,
                (me.video.renderer.getHeight() / 2) - (progressBar.barHeight / 2) - 90
            );
            me.game.world.addChild(icon, 1);
            me.game.world.addChild(new TextLogo(me.video.renderer.getWidth(), me.video.renderer.getHeight()), 1);
        },

        // destroy object at end of loading
        onDestroyEvent : function () {
            // cancel the callback
            if (this.handle)  {
                me.event.unsubscribe(this.handle);
                this.handle = null;
            }
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a small class to manage loading of stuff and manage resources
     * There is no constructor function for me.input.
     * @namespace me.loader
     * @memberOf me
     */
    me.loader = (function () {
        // hold public stuff in our singleton
        var api = {};

        // contains all the images loaded
        var imgList = {};
        // contains all the TMX loaded
        var tmxList = {};
        // contains all the binary files loaded
        var binList = {};
        // contains all the JSON files
        var jsonList = {};
        // flag to check loading status
        var resourceCount = 0;
        var loadCount = 0;
        var timerId = 0;

        /**
         * check the loading status
         * @ignore
         */
        function checkLoadStatus() {
            if (loadCount === resourceCount) {
                // wait 1/2s and execute callback (cheap workaround to ensure everything is loaded)
                if (api.onload) {
                    // make sure we clear the timer
                    clearTimeout(timerId);
                    // trigger the onload callback
                    setTimeout(function () {
                        api.onload();
                        me.event.publish(me.event.LOADER_COMPLETE);
                    }, 300);
                }
                else {
                    console.error("no load callback defined");
                }
            }
            else {
                timerId = setTimeout(checkLoadStatus, 100);
            }
        }

        /**
         * load Images
         * @example
         * preloadImages([
         *     { name : 'image1', src : 'images/image1.png'},
         *     { name : 'image2', src : 'images/image2.png'},
         *     { name : 'image3', src : 'images/image3.png'},
         *     { name : 'image4', src : 'images/image4.png'}
         * ]);
         * @ignore
         */
        function preloadImage(img, onload, onerror) {
            // create new Image object and add to list
            imgList[img.name] = new Image();
            imgList[img.name].onload = onload;
            imgList[img.name].onerror = onerror;
            imgList[img.name].src = img.src + api.nocache;
        }

        /**
         * preload TMX files
         * @ignore
         */
        function preloadTMX(tmxData, onload, onerror) {
            function addToTMXList(data, format) {
                // set the TMX content
                tmxList[tmxData.name] = {
                    data: data,
                    isTMX: (tmxData.type === "tmx"),
                    format : format
                };
            }

            // add the tmx to the levelDirector
            if (tmxData.type === "tmx") {
                me.levelDirector.addTMXLevel(tmxData.name);
            }

            //if the data is in the tmxData object, don't get it via a XMLHTTPRequest
            if (tmxData.data) {
                addToTMXList(tmxData.data, tmxData.format);
                onload();
                return;
            }

            var xmlhttp = new XMLHttpRequest();
            // check the data format ('tmx', 'json')
            var format = me.utils.getFileExtension(tmxData.src).toLowerCase();

            if (xmlhttp.overrideMimeType) {
                if (format === "json") {
                    xmlhttp.overrideMimeType("application/json");
                }
                else {
                    xmlhttp.overrideMimeType("text/xml");
                }
            }

            xmlhttp.open("GET", tmxData.src + api.nocache, true);


            // set the callbacks
            xmlhttp.ontimeout = onerror;
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4) {
                    // status = 0 when file protocol is used, or cross-domain origin,
                    // (With Chrome use "--allow-file-access-from-files --disable-web-security")
                    if ((xmlhttp.status === 200) || ((xmlhttp.status === 0) && xmlhttp.responseText)) {
                        var result = null;

                        // parse response
                        switch (format) {
                            case "xml":
                            case "tmx":
                            case "tsx":
                                // ie9 does not fully implement the responseXML
                                if (me.device.ua.match(/msie/i) || !xmlhttp.responseXML) {
                                    // manually create the XML DOM
                                    result = (new DOMParser()).parseFromString(xmlhttp.responseText, "text/xml");
                                }
                                else {
                                    result = xmlhttp.responseXML;
                                }
                                // converts to a JS object
                                // (returns with map as a the root object, to match native json format)
                                result = me.TMXUtils.parse(result);
                                if (format === "tmx") {
                                    result = result.map;
                                }
                                // force format to json
                                format = "json";
                                break;

                            case "json":
                                result = JSON.parse(xmlhttp.responseText);
                                break;

                            default:
                                throw new api.Error("TMX file format " + format + "not supported !");
                        }

                        //set the TMX content
                        addToTMXList(result, format);

                        // fire the callback
                        onload();
                    }
                    else {
                        onerror();
                    }
                }
            };
            // send the request
            xmlhttp.send(null);
        }

        /**
         * preload TMX files
         * @ignore
         */
        function preloadJSON(data, onload, onerror) {
            var xmlhttp = new XMLHttpRequest();

            if (xmlhttp.overrideMimeType) {
                xmlhttp.overrideMimeType("application/json");
            }

            xmlhttp.open("GET", data.src + api.nocache, true);

            // set the callbacks
            xmlhttp.ontimeout = onerror;
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4) {
                    // status = 0 when file protocol is used, or cross-domain origin,
                    // (With Chrome use "--allow-file-access-from-files --disable-web-security")
                    if ((xmlhttp.status === 200) || ((xmlhttp.status === 0) && xmlhttp.responseText)) {
                        // get the Texture Packer Atlas content
                        jsonList[data.name] = JSON.parse(xmlhttp.responseText);
                        // fire the callback
                        onload();
                    }
                    else {
                        onerror();
                    }
                }
            };
            // send the request
            xmlhttp.send(null);
        }

        /**
         * preload Binary files
         * @ignore
         */
        function preloadBinary(data, onload, onerror) {
            var httpReq = new XMLHttpRequest();

            // load our file
            httpReq.open("GET", data.src + api.nocache, true);
            httpReq.responseType = "arraybuffer";
            httpReq.onerror = onerror;
            httpReq.onload = function () {
                var arrayBuffer = httpReq.response;
                if (arrayBuffer) {
                    var byteArray = new Uint8Array(arrayBuffer);
                    var buffer = [];
                    for (var i = 0; i < byteArray.byteLength; i++) {
                        buffer[i] = String.fromCharCode(byteArray[i]);
                    }
                    binList[data.name] = buffer.join("");
                    // callback
                    onload();
                }
            };
            httpReq.send();
        }

        /**
         * to enable/disable caching
         * @ignore
         */
        api.nocache = "";

        /*
         * PUBLIC STUFF
         */

        /**
         * onload callback
         * @public
         * @callback
         * @name onload
         * @memberOf me.loader
         * @example
         *
         * // set a callback when everything is loaded
         * me.loader.onload = this.loaded.bind(this);
         */
        api.onload = undefined;

        /**
         * onProgress callback<br>
         * each time a resource is loaded, the loader will fire the specified function,
         * giving the actual progress [0 ... 1], as argument, and an object describing the resource loaded
         * @public
         * @callback
         * @name onProgress
         * @memberOf me.loader
         * @example
         *
         * // set a callback for progress notification
         * me.loader.onProgress = this.updateProgress.bind(this);
         */
        api.onProgress = undefined;

        /**
         * Base class for Loader exception handling.
         * @name Error
         * @class
         * @memberOf me.loader
         * @constructor
         * @param {String} msg Error message.
         */
        api.Error = me.Error.extend({
            init : function (msg) {
                me.Error.prototype.init.apply(this, [ msg ]);
                this.name = "me.loader.Error";
            }
        });

        /**
         *  just increment the number of already loaded resources
         * @ignore
         */
        api.onResourceLoaded = function (res) {
            // increment the loading counter
            loadCount++;

            // callback ?
            var progress = api.getLoadProgress();
            if (api.onProgress) {
                // pass the load progress in percent, as parameter
                api.onProgress(progress, res);
            }
            me.event.publish(me.event.LOADER_PROGRESS, [progress, res]);
        };

        /**
         * on error callback for image loading
         * @ignore
         */
        api.onLoadingError = function (res) {
            throw new api.Error("Failed loading resource " + res.src);
        };

        /**
         * enable the nocache mechanism
         * @ignore
         */
        api.setNocache = function (enable) {
            api.nocache = enable ? "?" + ~~(Math.random() * 10000000) : "";
        };


        /**
         * set all the specified game resources to be preloaded.<br>
         * each resource item must contain the following fields :<br>
         * - name    : internal name of the resource<br>
         * - type    : "binary", "image", "tmx", "tsx", "audio"<br>
         * each resource except type "tmx" must contain the following field :<br>
         * - src     : path and file name of the resource<br>
         * (!) for tmx :<br>
         * - src     : path and file name of the resource<br>
         * or<br>
         * - data    : the json or xml object representation of the tmx file<br>
         * - format  : "xml" or "json"<br>
         * (!) for audio :<br>
         * - src     : path (only) where resources are located<br>
         * <br>
         * @name preload
         * @memberOf me.loader
         * @public
         * @function
         * @param {Object[]} resources
         * @example
         * var g_resources = [
         *   // PNG tileset
         *   {name: "tileset-platformer", type: "image",  src: "data/map/tileset.png"},
         *   // PNG packed texture
         *   {name: "texture", type:"image", src: "data/gfx/texture.png"}
         *   // TSX file
         *   {name: "meta_tiles", type: "tsx", src: "data/map/meta_tiles.tsx"},
         *   // TMX level (XML & JSON)
         *   {name: "map1", type: "tmx", src: "data/map/map1.json"},
         *   {name: "map2", type: "tmx", src: "data/map/map2.tmx"},
         *   {name: "map3", type: "tmx", format: "json", data: {"height":15,"layers":[...],"tilewidth":32,"version":1,"width":20}},
         *   {name: "map4", type: "tmx", format: "xml", data: {xml representation of tmx}},
         *   // audio resources
         *   {name: "bgmusic", type: "audio",  src: "data/audio/"},
         *   {name: "cling",   type: "audio",  src: "data/audio/"},
         *   // binary file
         *   {name: "ymTrack", type: "binary", src: "data/audio/main.ym"},
         *   // JSON file (used for texturePacker)
         *   {name: "texture", type: "json", src: "data/gfx/texture.json"}
         * ];
         * ...
         *
         * // set all resources to be loaded
         * me.loader.preload(g_resources);
         */
        api.preload = function (res) {
            // parse the resources
            for (var i = 0; i < res.length; i++) {
                resourceCount += api.load(
                    res[i],
                    api.onResourceLoaded.bind(api, res[i]),
                    api.onLoadingError.bind(api, res[i])
                );
            }
            // check load status
            checkLoadStatus();
        };

        /**
         * Load a single resource (to be used if you need to load additional resource during the game)<br>
         * Given parameter must contain the following fields :<br>
         * - name    : internal name of the resource<br>
         * - type    : "audio", binary", "image", "json", "tmx", "tsx"<br>
         * each resource except type "tmx" must contain the following field :<br>
         * - src     : path and file name of the resource<br>
         * (!) for tmx :<br>
         * - src     : path and file name of the resource<br>
         * or<br>
         * - data    : the json or xml object representation of the tmx file<br>
         * - format  : "xml" or "json"<br>
         * (!) for audio :<br>
         * - src     : path (only) where resources are located<br>
         * @name load
         * @memberOf me.loader
         * @public
         * @function
         * @param {Object} resource
         * @param {Function} onload function to be called when the resource is loaded
         * @param {Function} onerror function to be called in case of error
         * @example
         * // load an image asset
         * me.loader.load({name: "avatar",  type:"image",  src: "data/avatar.png"}, this.onload.bind(this), this.onerror.bind(this));
         *
         * // start loading music
         * me.loader.load({
         *     name   : "bgmusic",
         *     type   : "audio",
         *     src    : "data/audio/"
         * }, function () {
         *     me.audio.play("bgmusic");
         * });
         */
        api.load = function (res, onload, onerror) {
            // fore lowercase for the resource name
            res.name = res.name.toLowerCase();
            // check ressource type
            switch (res.type) {
                case "binary":
                    // reuse the preloadImage fn
                    preloadBinary.call(this, res, onload, onerror);
                    return 1;

                case "image":
                    // reuse the preloadImage fn
                    preloadImage.call(this, res, onload, onerror);
                    return 1;

                case "json":
                    preloadJSON.call(this, res, onload, onerror);
                    return 1;

                case "tmx":
                case "tsx":
                    preloadTMX.call(this, res, onload, onerror);
                    return 1;

                case "audio":
                    me.audio.load(res, onload, onerror);
                    return 1;

                default:
                    throw new api.Error("load : unknown or invalid resource type : " + res.type);
            }
        };

        /**
         * unload specified resource to free memory
         * @name unload
         * @memberOf me.loader
         * @public
         * @function
         * @param {Object} resource
         * @return {Boolean} true if unloaded
         * @example me.loader.unload({name: "avatar",  type:"image",  src: "data/avatar.png"});
         */
        api.unload = function (res) {
            res.name = res.name.toLowerCase();
            switch (res.type) {
                case "binary":
                    if (!(res.name in binList)) {
                        return false;
                    }

                    delete binList[res.name];
                    return true;

                case "image":
                    if (!(res.name in imgList)) {
                        return false;
                    }
                    if (typeof(imgList[res.name].dispose) === "function") {
                        // cocoonJS implements a dispose function to free
                        // corresponding allocated texture in memory
                        imgList[res.name].dispose();
                    }
                    delete imgList[res.name];
                    return true;

                case "json":
                    if (!(res.name in jsonList)) {
                        return false;
                    }

                    delete jsonList[res.name];
                    return true;

                case "tmx":
                case "tsx":
                    if (!(res.name in tmxList)) {
                        return false;
                    }

                    delete tmxList[res.name];
                    return true;

                case "audio":
                    return me.audio.unload(res.name);

                default:
                    throw new api.Error("unload : unknown or invalid resource type : " + res.type);
            }
        };

        /**
         * unload all resources to free memory
         * @name unloadAll
         * @memberOf me.loader
         * @public
         * @function
         * @example me.loader.unloadAll();
         */
        api.unloadAll = function () {
            var name;

            // unload all binary resources
            for (name in binList) {
                if (binList.hasOwnProperty(name)) {
                    api.unload({
                        "name" : name,
                        "type" : "binary"
                    });
                }
            }

            // unload all image resources
            for (name in imgList) {
                if (imgList.hasOwnProperty(name)) {
                    api.unload({
                        "name" : name,
                        "type" : "image"
                    });
                }
            }

            // unload all tmx resources
            for (name in tmxList) {
                if (tmxList.hasOwnProperty(name)) {
                    api.unload({
                        "name" : name,
                        "type" : "tmx"
                    });
                }
            }

            // unload all in json resources
            for (name in jsonList) {
                if (jsonList.hasOwnProperty(name)) {
                    api.unload({
                        "name" : name,
                        "type" : "json"
                    });
                }
            }

            // unload all audio resources
            me.audio.unloadAll();
        };

        /**
         * return the specified TMX/TSX object
         * @name getTMX
         * @memberOf me.loader
         * @public
         * @function
         * @param {String} tmx name of the tmx/tsx element ("map1");
         * @return {TMx}
         */
        api.getTMX = function (elt) {
            // avoid case issue
            elt = "" + elt;
            elt = elt.toLowerCase();
            if (elt in tmxList) {
                return tmxList[elt].data;
            }
            else {
                //console.log ("warning %s resource not yet loaded!",name);
                return null;
            }
        };

        /**
         * return the specified Binary object
         * @name getBinary
         * @memberOf me.loader
         * @public
         * @function
         * @param {String} name of the binary object ("ymTrack");
         * @return {Object}
         */
        api.getBinary = function (elt) {
            // avoid case issue
            elt = "" + elt;
            elt = elt.toLowerCase();
            if (elt in binList) {
                return binList[elt];
            }
            else {
                //console.log ("warning %s resource not yet loaded!",name);
                return null;
            }

        };

        /**
         * return the specified Image Object
         * @name getImage
         * @memberOf me.loader
         * @public
         * @function
         * @param {String} Image name of the Image element ("tileset-platformer");
         * @return {Image}
         */
        api.getImage = function (elt) {
            // avoid case issue
            elt = "" + elt;
            elt = elt.toLowerCase();
            if (elt in imgList) {
                // return the corresponding Image object
                return imgList[elt];
            }
            else {
                //console.log ("warning %s resource not yet loaded!",name);
                return null;
            }

        };

        /**
         * return the specified JSON Object
         * @name getJSON
         * @memberOf me.loader
         * @public
         * @function
         * @param {String} Name for the json file to load
         * @return {Object}
         */
        api.getJSON = function (elt) {
            elt = "" + elt;
            elt = elt.toLowerCase();
            if (elt in jsonList) {
                return jsonList[elt];
            }
            else {
                return null;
            }
        };

        /**
         * Return the loading progress in percent
         * @name getLoadProgress
         * @memberOf me.loader
         * @public
         * @function
         * @deprecated use callback instead
         * @return {Number}
         */
        api.getLoadProgress = function () {
            return loadCount / resourceCount;
        };

        // return our object
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Font / Bitmap font
 *
 * ASCII Table
 * http://www.asciitable.com/
 * [ !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz]
 *
 * -> first char " " 32d (0x20);
 */
(function () {
    /**
     * a generic system font object.
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {String} font a CSS font name
     * @param {Number|String} size size, or size + suffix (px, em, pt)
     * @param {String} fillStyle a CSS color value
     * @param {String} [textAlign="left"] horizontal alignment
     */
    me.Font = me.Renderable.extend(
    /** @scope me.Font.prototype */ {

        /** @ignore */
        init : function (font, size, fillStyle, textAlign) {
            // private font properties
            /** @ignore */
            this.fontSize = new me.Vector2d();

            /**
             * defines the color used to draw the font.<br>
             * Default value : "#000000"
             * @public
             * @type String
             * @name me.Font#fillStyle
             */
            this.fillStyle = fillStyle || "#000000";

            /**
             * defines the color used to draw the font stroke.<br>
             * Default value : "#000000"
             * @public
             * @type String
             * @name me.Font#strokeStyle
             */
            this.strokeStyle = "#000000";

            /**
             * sets the current line width, in pixels, when drawing stroke
             * Default value : 1
             * @public
             * @type Number
             * @name me.Font#lineWidth
             */
            this.lineWidth = 1;

            /**
             * Set the default text alignment (or justification),<br>
             * possible values are "left", "right", and "center".<br>
             * Default value : "left"
             * @public
             * @type String
             * @name me.Font#textAlign
             */
            this.textAlign = textAlign || "left";

            /**
             * Set the text baseline (e.g. the Y-coordinate for the draw operation), <br>
             * possible values are "top", "hanging, "middle, "alphabetic, "ideographic, "bottom"<br>
             * Default value : "top"
             * @public
             * @type String
             * @name me.Font#textBaseline
             */
            this.textBaseline = "top";

            /**
             * Set the line spacing height (when displaying multi-line strings). <br>
             * Current font height will be multiplied with this value to set the line height.
             * Default value : 1.0
             * @public
             * @type Number
             * @name me.Font#lineHeight
             */
            this.lineHeight = 1.0;
            // font name and type
            this.setFont(font, size, fillStyle, textAlign);
            // super constructor
            this.pos = new me.Vector2d(0, 0);
            me.Renderable.prototype.init.apply(this, [this.pos.x, this.pos.y, 0, this.fontSize.y]);

            if (!this.gid) {
                this.gid = me.utils.createGUID();
            }
        },

        /**
         * make the font bold
         * @name bold
         * @memberOf me.Font
         * @function
         */
        bold : function () {
            this.font = "bold " + this.font;
        },

        /**
         * make the font italic
         * @name italic
         * @memberOf me.Font
         * @function
         */
        italic : function () {
            this.font = "italic " + this.font;
        },

        /**
         * Change the font settings
         * @name setFont
         * @memberOf me.Font
         * @function
         * @param {String} font a CSS font name
         * @param {Number|String} size size, or size + suffix (px, em, pt)
         * @param {String} fillStyle a CSS color value
         * @param {String} [textAlign="left"] horizontal alignment
         * @example
         * font.setFont("Arial", 20, "white");
         * font.setFont("Arial", "1.5em", "white");
         */
        setFont : function (font, size, fillStyle, textAlign) {
            // font name and type
            var font_names = font.split(",").map(function (value) {
                value = value.trim();
                return (
                    !/(^".*"$)|(^'.*'$)/.test(value)
                ) ? "\"" + value + "\"" : value;
            });

            this.fontSize.y = +size;
            this.height = this.fontSize.y;

            if (typeof size === "number") {
                size += "px";
            }
            this.font = size + " " + font_names.join(",");
            this.fillStyle = fillStyle;
            if (textAlign) {
                this.textAlign = textAlign;
            }
        },

        /**
         * measure the given text size in pixels
         * @name measureText
         * @memberOf me.Font
         * @function
         * @param {Context} context 2D Context
         * @param {String} text
         * @return {Object} returns an object, with two attributes: width (the width of the text) and height (the height of the text).
         */
        measureText : function (context, text) {
            // draw the text
            context.font = this.font;
            context.fillStyle = this.fillStyle;
            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;

            this.height = this.width = 0;

            var strings = ("" + text).split("\n");
            for (var i = 0; i < strings.length; i++) {
                this.width = Math.max(context.measureText(strings[i].trimRight()).width, this.width);
                this.height += this.fontSize.y * this.lineHeight;
            }
            return {
                width : this.width,
                height : this.height
            };
        },

        /**
         * draw a text at the specified coord
         * @name draw
         * @memberOf me.Font
         * @function
         * @param {Context} context 2D Context
         * @param {String} text
         * @param {Number} x
         * @param {Number} y
         */

        draw : function (context, text, x, y) {
            x = ~~x;
            y = ~~y;

            // save the previous global alpha value
            var _alpha = context.globalAlpha;
            context.globalAlpha *= this.getOpacity();

            // update initial position
            this.pos.set(x, y);
            // draw the text
            context.font = this.font;
            context.fillStyle = this.fillStyle;
            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;

            var strings = ("" + text).split("\n");
            for (var i = 0; i < strings.length; i++) {
                // draw the string
                context.fillText(strings[i].trimRight(), x, y);
                // add leading space
                y += this.fontSize.y * this.lineHeight;
            }

            // restore the previous global alpha value
            context.globalAlpha = _alpha;
        },

        /**
         * draw a stroke text at the specified coord, as defined <br>
         * by the `lineWidth` and `fillStroke` properties. <br>
         * Note : using drawStroke is not recommended for performance reasons
         * @name drawStroke
         * @memberOf me.Font
         * @function
         * @param {Context} context 2D Context
         * @param {String} text
         * @param {Number} x
         * @param {Number} y
         */
        drawStroke : function (context, text, x, y) {
            x = ~~x;
            y = ~~y;
            
            // save the previous global alpha value
            var _alpha = context.globalAlpha;
            context.globalAlpha *= this.getOpacity();

            // update initial position
            this.pos.set(x, y);
            // draw the text
            context.font = this.font;
            context.fillStyle = this.fillStyle;
            context.strokeStyle = this.strokeStyle;
            context.lineWidth = this.lineWidth;
            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;

            var strings = ("" + text).split("\n");
            for (var i = 0; i < strings.length; i++) {
                var _string = strings[i].trimRight();
                // draw the border
                context.strokeText(_string, x, y);
                // draw the string
                context.fillText(_string, x, y);
                // add leading space
                y += this.fontSize.y * this.lineHeight;
            }

            // restore the previous global alpha value
            context.globalAlpha = _alpha;
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Font / Bitmap font
 *
 * ASCII Table
 * http://www.asciitable.com/
 * [ !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz]
 *
 * -> first char " " 32d (0x20);
 */
(function () {
    /**
     * a bitpmap font object
     * @class
     * @extends me.Font
     * @memberOf me
     * @constructor
     * @param {String} font
     * @param {Number|Object} size either an int value, or an object like {x:16,y:16}
     * @param {Number} [scale="1.0"]
     * @param {String} [firstChar="0x20"]
     */
    me.BitmapFont = me.Font.extend(
    /** @scope me.BitmapFont.prototype */ {
        /** @ignore */
        init : function (font, size, scale, firstChar) {
            /** @ignore */
            // scaled font size;
            this.sSize = new me.Vector2d();
            // first char in the ascii table
            this.firstChar = 0x20;

            // #char per row
            this.charCount = 0;
            // font name and type
            me.Font.prototype.init.apply(this, [font, null, null]);
            // first char in the ascii table
            this.firstChar = firstChar || 0x20;

            // load the font metrics
            this.loadFontMetrics(font, size);

            // set a default alignement
            this.textAlign = "left";
            this.textBaseline = "top";
            // resize if necessary
            if (scale) {
                this.resize(scale);
            }
        },

        /**
         * Load the font metrics
         * @ignore
         */
        loadFontMetrics : function (font, size) {
            this.font = me.loader.getImage(font);

            // some cheap metrics
            this.fontSize.x = size.x || size;
            this.fontSize.y = size.y || this.font.height;
            this.sSize.copy(this.fontSize);
            this.height = this.sSize.y;

            // #char per row
            this.charCount = ~~(this.font.width / this.fontSize.x);
        },

        /**
         * change the font settings
         * @name set
         * @memberOf me.BitmapFont
         * @function
         * @param {String} textAlign ("left", "center", "right")
         * @param {Number} [scale]
         */
        set : function (textAlign, scale) {
            this.textAlign = textAlign;
            // updated scaled Size
            if (scale) {
                this.resize(scale);
            }
        },

        /**
         * change the font display size
         * @name resize
         * @memberOf me.BitmapFont
         * @function
         * @param {Number} scale ratio
         */
        resize : function (scale) {
            // updated scaled Size
            this.sSize.setV(this.fontSize);
            this.sSize.x *= scale;
            this.sSize.y *= scale;
            this.height = this.sSize.y;
        },

        /**
         * measure the given text size in pixels
         * @name measureText
         * @memberOf me.BitmapFont
         * @function
         * @param {me.CanvasRenderer|me.WebGLRenderer} renderer Reference to the destination renderer instance
         * @param {String} text
         * @return {Object} returns an object, with two attributes: width (the width of the text) and height (the height of the text).
         */
        measureText : function (renderer, text) {
            var strings = ("" + text).split("\n");

            this.height = this.width = 0;

            for (var i = 0; i < strings.length; i++) {
                this.width = Math.max((strings[i].trimRight().length * this.sSize.x), this.width);
                this.height += this.sSize.y * this.lineHeight;
            }
            return {width: this.width, height: this.height};
        },

        /**
         * draw a text at the specified coord
         * @name draw
         * @memberOf me.BitmapFont
         * @function
         * @param {me.CanvasRenderer|me.WebGLRenderer} renderer Reference to the destination renderer instance
         * @param {String} text
         * @param {Number} x
         * @param {Number} y
         */
        draw : function (renderer, text, x, y) {
            var strings = ("" + text).split("\n");
            var lX = x;
            var height = this.sSize.y * this.lineHeight;

            // save the previous global alpha value
            var _alpha = renderer.globalAlpha();
            renderer.setGlobalAlpha(_alpha * this.getOpacity());

            // update initial position
            this.pos.set(x, y);
            for (var i = 0; i < strings.length; i++) {
                x = lX;
                var string = strings[i].trimRight();
                // adjust x pos based on alignment value
                var width = string.length * this.sSize.x;
                switch (this.textAlign) {
                    case "right":
                        x -= width;
                        break;

                    case "center":
                        x -= width * 0.5;
                        break;

                    default :
                        break;
                }

                // adjust y pos based on alignment value
                switch (this.textBaseline) {
                    case "middle":
                        y -= height * 0.5;
                        break;

                    case "ideographic":
                    case "alphabetic":
                    case "bottom":
                        y -= height;
                        break;

                    default :
                        break;
                }

                // draw the string
                for (var c = 0, len = string.length; c < len; c++) {
                    // calculate the char index
                    var idx = string.charCodeAt(c) - this.firstChar;
                    if (idx >= 0) {
                        // draw it
                        renderer.drawImage(this.font,
                            this.fontSize.x * (idx % this.charCount),
                            this.fontSize.y * ~~(idx / this.charCount),
                            this.fontSize.x, this.fontSize.y,
                            ~~x, ~~y,
                            this.sSize.x, this.sSize.y);
                    }
                    x += this.sSize.x;
                }
                // increment line
                y += height;
            }
            // restore the previous global alpha value
            renderer.setGlobalAlpha(_alpha);
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Audio Mngt Objects
 *
 *
 */
(function () {
    /**
     * There is no constructor function for me.audio.
     * @namespace me.audio
     * @memberOf me
     */
    me.audio = (function () {
        /*
         * PRIVATE STUFF
         */

        // hold public stuff in our singleton
        var api = {};

        // audio channel list
        var audioTracks = {};

        // current music
        var current_track_id = null;

        // a retry counter
        var retry_counter = 0;

        /**
         * event listener callback on load error
         * @ignore
         */
        function soundLoadError(sound_name, onerror_cb) {
            // check the retry counter
            if (retry_counter++ > 3) {
                // something went wrong
                var errmsg = "melonJS: failed loading " + sound_name;
                if (me.sys.stopOnAudioError === false) {
                    // disable audio
                    me.audio.disable();
                    // call error callback if defined
                    if (onerror_cb) {
                        onerror_cb();
                    }
                    // warning
                    console.log(errmsg + ", disabling audio");
                }
                else {
                    // throw an exception and stop everything !
                    throw new api.Error(errmsg);
                }
            // else try loading again !
            }
            else {
                audioTracks[sound_name].load();
            }
        }

        /*
         * PUBLIC STUFF
         */

        /**
         * Base class for Audio exception handling.
         * @name Error
         * @class
         * @memberOf me.audio
         * @constructor
         * @param {String} msg Error message.
         */
        api.Error = me.Error.extend({
            init : function (msg) {
                me.Error.prototype.init.apply(this, [ msg ]);
                this.name = "me.audio.Error";
            }
        });

        /**
         * initialize the audio engine<br>
         * the melonJS loader will try to load audio files corresponding to the
         * browser supported audio format<br>
         * if no compatible audio codecs are found, audio will be disabled
         * @name init
         * @memberOf me.audio
         * @public
         * @function
         * @param {String}
         *          audioFormat audio format provided ("mp3, ogg, m4a, wav")
         * @return {Boolean} Indicates whether audio initialization was successful
         * @example
         * // initialize the "sound engine", giving "mp3" and "ogg" as desired audio format
         * // i.e. on Safari, the loader will load all audio.mp3 files,
         * // on Opera the loader will however load audio.ogg files
         * if (!me.audio.init("mp3,ogg")) {
         *     alert("Sorry but your browser does not support html 5 audio !");
         *     return;
         * }
         */
        api.init = function (audioFormat) {
            if (!me.initialized) {
                throw new api.Error("me.audio.init() called before engine initialization.");
            }
            // if no param is given to init we use mp3 by default
            audioFormat = typeof audioFormat === "string" ? audioFormat : "mp3";
            // convert it into an array
            this.audioFormats = audioFormat.split(",");

            return !Howler.noAudio;
        };

        /**
         * enable audio output <br>
         * only useful if audio supported and previously disabled through
         *
         * @see me.audio#disable
         * @name enable
         * @memberOf me.audio
         * @public
         * @function
         */
        api.enable = function () {
            this.unmuteAll();
        };

        /**
         * disable audio output
         *
         * @name disable
         * @memberOf me.audio
         * @public
         * @function
         */
        api.disable = function () {
            this.muteAll();
        };

        /**
         * Load an audio file.<br>
         * <br>
         * sound item must contain the following fields :<br>
         * - name    : name of the sound<br>
         * - src     : source path<br>
         * @ignore
         */
        api.load = function (sound, onload_cb, onerror_cb) {
            var urls = [];
            if (typeof(this.audioFormats) === "undefined" || this.audioFormats.length === 0) {
                throw new api.Error("target audio extension(s) should be set through me.audio.init() before calling the preloader.");
            }
            for (var i = 0; i < this.audioFormats.length; i++) {
                urls.push(sound.src + sound.name + "." + this.audioFormats[i] + me.loader.nocache);
            }
            audioTracks[sound.name] = new Howl({
                src : urls,
                volume : Howler.volume(),
                onloaderror : function () {
                    audioTracks[sound.name] = this;
                    soundLoadError.call(me.audio, sound.name, onerror_cb);
                },
                onload : function () {
                    audioTracks[sound.name] = this;
                    retry_counter = 0;
                    if (onload_cb) {
                        onload_cb();
                    }
                }
            });

            return 1;
        };

        /**
         * play the specified sound
         * @name play
         * @memberOf me.audio
         * @public
         * @function
         * @param {String} sound_name audio clip name
         * @param {Boolean} [loop=false] loop audio
         * @param {Function} [onend] Function to call when sound instance ends playing.
         * @param {Number} [volume=default] Float specifying volume (0.0 - 1.0 values accepted).
         * @return {Number} the sound instance ID.
         * @example
         * // play the "cling" audio clip
         * me.audio.play("cling");
         * // play & repeat the "engine" audio clip
         * me.audio.play("engine", true);
         * // play the "gameover_sfx" audio clip and call myFunc when finished
         * me.audio.play("gameover_sfx", false, myFunc);
         * // play the "gameover_sfx" audio clip with a lower volume level
         * me.audio.play("gameover_sfx", false, null, 0.5);
         */
        api.play = function (sound_name, loop, onend, volume) {
            var sound = audioTracks[sound_name.toLowerCase()];
            if (sound && typeof sound !== "undefined") {
                var instance_id = sound.play();
                if (typeof loop === "boolean") {
                    // arg[0] can take different types in howler 2.0
                    sound.loop(loop, instance_id);
                }
                sound.volume(typeof(volume) === "number" ? volume.clamp(0.0, 1.0) : Howler.volume(), instance_id);
                if (typeof(onend) === "function") {
                    if (loop === true) {
                        sound.on("end", onend, instance_id);
                    }
                    else {
                        sound.once("end", onend, instance_id);
                    }
                }
                return instance_id;
            }
        };

        /**
         * Fade a currently playing sound between two volumee.
         * @name fade
         * @memberOf me.audio
         * @public
         * @function
         * @param {String} sound_name audio clip name
         * @param {Number} from Volume to fade from (0.0 to 1.0).
         * @param {Number} to Volume to fade to (0.0 to 1.0).
         * @param {Number} duration Time in milliseconds to fade.
         * @param {Number} [id] the sound instance ID. If none is passed, all sounds in group will fade.
         */
        api.fade = function (sound_name, from, to, duration, instance_id) {
            var sound = audioTracks[sound_name.toLowerCase()];
            if (sound && typeof sound !== "undefined") {
                sound.fade(from, to, duration, instance_id);
            }
        };

        /**
         * stop the specified sound on all channels
         * @name stop
         * @memberOf me.audio
         * @public
         * @function
         * @param {String} sound_name audio clip name
         * @param {Number} [id] the sound instance ID. If none is passed, all sounds in group will stop.
         * @example
         * me.audio.stop("cling");
         */
        api.stop = function (sound_name, instance_id) {
            var sound = audioTracks[sound_name.toLowerCase()];
            if (sound && typeof sound !== "undefined") {
                sound.stop(instance_id);
                // remove the defined onend callback (if any defined)
                sound.off("end", instance_id);
            }
        };

        /**
         * pause the specified sound on all channels<br>
         * this function does not reset the currentTime property
         * @name pause
         * @memberOf me.audio
         * @public
         * @function
         * @param {String} sound_name audio clip name
         * @param {Number} [id] the sound instance ID. If none is passed, all sounds in group will pause.
         * @example
         * me.audio.pause("cling");
         */
        api.pause = function (sound_name, instance_id) {
            var sound = audioTracks[sound_name.toLowerCase()];
            if (sound && typeof sound !== "undefined") {
                sound.pause(instance_id);
            }
        };

        /**
         * play the specified audio track<br>
         * this function automatically set the loop property to true<br>
         * and keep track of the current sound being played.
         * @name playTrack
         * @memberOf me.audio
         * @public
         * @function
         * @param {String} sound_name audio track name
         * @param {Number} [volume=default] Float specifying volume (0.0 - 1.0 values accepted).
         * @return {Number} the sound instance ID.
         * @example
         * me.audio.playTrack("awesome_music");
         */
        api.playTrack = function (sound_name, volume) {
            current_track_id = sound_name.toLowerCase();
            return me.audio.play(
                current_track_id,
                true,
                null,
                volume
            );
        };

        /**
         * stop the current audio track
         *
         * @see me.audio#playTrack
         * @name stopTrack
         * @memberOf me.audio
         * @public
         * @function
         * @example
         * // play a awesome music
         * me.audio.playTrack("awesome_music");
         * // stop the current music
         * me.audio.stopTrack();
         */
        api.stopTrack = function () {
            if (current_track_id !== null) {
                audioTracks[current_track_id].stop();
                current_track_id = null;
            }
        };

        /**
         * pause the current audio track
         *
         * @name pauseTrack
         * @memberOf me.audio
         * @public
         * @function
         * @example
         * me.audio.pauseTrack();
         */
        api.pauseTrack = function () {
            if (current_track_id !== null) {
                audioTracks[current_track_id].pause();
            }
        };

        /**
         * resume the previously paused audio track
         *
         * @name resumeTrack
         * @memberOf me.audio
         * @public
         * @function
         * @example
         * // play an awesome music
         * me.audio.playTrack("awesome_music");
         * // pause the audio track
         * me.audio.pauseTrack();
         * // resume the music
         * me.audio.resumeTrack();
         */
        api.resumeTrack = function () {
            if (current_track_id !== null) {
                audioTracks[current_track_id].play();
            }
        };

        /**
         * returns the current track Id
         * @name getCurrentTrack
         * @memberOf me.audio
         * @public
         * @function
         * @return {String} audio track name
         */
        api.getCurrentTrack = function () {
            return current_track_id;
        };

        /**
         * set the default global volume
         * @name setVolume
         * @memberOf me.audio
         * @public
         * @function
         * @param {Number} volume Float specifying volume (0.0 - 1.0 values accepted).
         */
        api.setVolume = function (volume) {
            Howler.volume(volume);
        };

        /**
         * get the default global volume
         * @name getVolume
         * @memberOf me.audio
         * @public
         * @function
         * @returns {Number} current volume value in Float [0.0 - 1.0] .
         */
        api.getVolume = function () {
            return Howler.volume();
        };

        /**
         * mute the specified sound
         * @name mute
         * @memberOf me.audio
         * @public
         * @function
         * @param {String} sound_name audio clip name
         * @param {Number} [id] the sound instance ID. If none is passed, all sounds in group will mute.
         */
        api.mute = function (sound_name, instance_id, mute) {
            // if not defined : true
            mute = (typeof(mute) === "undefined" ? true : !!mute);
            var sound = audioTracks[sound_name.toLowerCase()];
            if (sound && typeof(sound) !== "undefined") {
                sound.mute(mute, instance_id);
            }
        };

        /**
         * unmute the specified sound
         * @name unmute
         * @memberOf me.audio
         * @public
         * @function
         * @param {String} sound_name audio clip name
         * @param {Number} [id] the sound instance ID. If none is passed, all sounds in group will unmute.
         */
        api.unmute = function (sound_name, instance_id) {
            api.mute(sound_name, instance_id, false);
        };

        /**
         * mute all audio
         * @name muteAll
         * @memberOf me.audio
         * @public
         * @function
         */
        api.muteAll = function () {
            Howler.mute(true);
        };

        /**
         * unmute all audio
         * @name unmuteAll
         * @memberOf me.audio
         * @public
         * @function
         */
        api.unmuteAll = function () {
            Howler.mute(false);
        };

        /**
         * unload specified audio track to free memory
         *
         * @name unload
         * @memberOf me.audio
         * @public
         * @function
         * @param {String} sound_name audio track name
         * @return {Boolean} true if unloaded
         * @example
         * me.audio.unload("awesome_music");
         */
        api.unload = function (sound_name) {
            sound_name = sound_name.toLowerCase();
            if (!(sound_name in audioTracks)) {
                return false;
            }

            // destroy the Howl object
            audioTracks[sound_name].unload();
            delete audioTracks[sound_name];

            return true;
        };

        /**
         * unload all audio to free memory
         *
         * @name unloadAll
         * @memberOf me.audio
         * @public
         * @function
         * @example
         * me.audio.unloadAll();
         */
        api.unloadAll = function () {
            for (var sound_name in audioTracks) {
                if (audioTracks.hasOwnProperty(sound_name)) {
                    api.unload(sound_name);
                }
            }
        };

        // return our object
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */

(function () {

    /**
     * The canvas renderer object
     * There is no constructor function for me.CanvasRenderer
     * @namespace me.CanvasRenderer
     * @memberOf me
     */
    me.CanvasRenderer = (function () {
        var api = {},
        canvas = null,
        context = null,
        doubleBuffering = null,
        backBufferCanvas = null,
        backBufferContext2D = null,
        globalColor = null,
        colorStack = [],
        gameHeightZoom = 0,
        gameWidthZoom = 0;

        /**
         * initializes the canvas renderer, creating the requried contexts
         * @name init
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Canvas} canvas - the html canvas tag to draw to on screen.
         * @param {Number} game_width - the width of the canvas without scaling
         * @param {Number} game_height - the height of the canvas without scaling
         * @param {Boolean} double_buffering - whether to enable double buffering.
         * @param {Number} game_width_zoom - The actual width of the canvas with scaling applied
         * @param {Number} game_height_zoom - The actual height of the canvas with scaling applied
         */
        api.init = function (c, game_width, game_height, double_buffering, game_width_zoom, game_height_zoom) {
            canvas = c;
            context = this.getContext2d(canvas);
            doubleBuffering = double_buffering;

            // create the back buffer if we use double buffering
            if (doubleBuffering) {
                backBufferCanvas = me.video.createCanvas(game_width, game_height, false);
                backBufferContext2D = this.getContext2d(backBufferCanvas);
            }
            else {
                backBufferCanvas = canvas;
                backBufferContext2D = context;
            }

            gameWidthZoom = game_width_zoom;
            gameHeightZoom = game_height_zoom;

            // the default global canvas color
            globalColor = new me.Color(255, 255, 255, 1.0);
            api.setColor(globalColor);

            return this;
        };

        /**
         * @private
         */
        api.applyRGBFilter = function (object, effect, option) {
            //create a output canvas using the given canvas or image size
            var _context = api.getContext2d(me.video.createCanvas(object.width, object.height, false));
            // get the pixels array of the give parameter
            var imgpix = me.utils.getPixels(object);
            // pointer to the pixels data
            var pix = imgpix.data;

            // apply selected effect
            var i, n;
            switch (effect) {
                case "b&w":
                    for (i = 0, n = pix.length; i < n; i += 4) {
                        var grayscale = (3 * pix[i] + 4 * pix[i + 1] + pix[i + 2]) >>> 3;
                        pix[i] = grayscale; // red
                        pix[i + 1] = grayscale; // green
                        pix[i + 2] = grayscale; // blue
                    }
                    break;

                case "brightness":
                    // make sure it's between 0.0 and 1.0
                    var brightness = Math.abs(option).clamp(0.0, 1.0);
                    for (i = 0, n = pix.length; i < n; i += 4) {

                        pix[i] *= brightness; // red
                        pix[i + 1] *= brightness; // green
                        pix[i + 2] *= brightness; // blue
                    }
                    break;

                case "transparent":
                    var refColor = me.pool.pull("me.Color").parseCSS(option);
                    var pixel = me.pool.pull("me.Color");
                    for (i = 0, n = pix.length; i < n; i += 4) {
                        pixel.setColor(pix[i], pix[i + 1], pix[i + 2]);
                        if (pixel.equals(refColor)) {
                            pix[i + 3] = 0;
                        }
                    }
                    me.pool.push(refColor);
                    me.pool.push(pixel);

                    break;


                default:
                    return null;
            }

            // put our modified image back in the new filtered canvas
            _context.putImageData(imgpix, 0, 0);

            // return it
            return _context;
        };

        /**
         * render the main framebuffer on screen
         * @name blitSurface
         * @memberOf me.CanvasRenderer
         * @function
         */
        api.blitSurface = function () {
            if (doubleBuffering) {
                /** @ignore */
                api.blitSurface = function () {
                    //FPS.update();
                    context.drawImage(
                        backBufferCanvas, 0, 0,
                        backBufferCanvas.width, backBufferCanvas.height, 0,
                        0, gameWidthZoom, gameHeightZoom
                    );

                };
            }
            else {
                // "empty" function, as we directly render stuff on "context2D"
                /** @ignore */
                api.blitSurface = function () {};
            }
            api.blitSurface();
        };

        /**
         * Clear the specified context with the given color
         * @name clearSurface
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Context2d} [ctx=null] canvas context, defaults to system context.
         * @param {me.Color|String} color CSS color.
         */
        api.clearSurface = function (ctx, col) {
            if (!ctx) {
                ctx = backBufferContext2D;
            }
            var _canvas = ctx.canvas;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = (col instanceof me.Color) ? col.toRGBA() : col;
            ctx.fillRect(0, 0, _canvas.width, _canvas.height);
            ctx.restore();
        };

        /**
         * Quick helper method to draw the font on the backbuffer context. Useful for when using webgl with canvas fallback
         * for different platforms.
         * @name drawFont
         * @memberOf me.CanvasRenderer
         * @function
         * @param {me.Font} fontObject an instance of me.Font
         * @param {String} text the string of text to draw
         * @param {Number} x the x position to draw at
         * @param {Number} y the y position to draw at
         */
        api.drawFont = function (fontObject, text, x, y) {
            fontObject.draw(backBufferContext2D, text, x, y);
        };

        /**
         * Draw a line from the given point to the destination point.
         * @name drawLine
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} startX start x position
         * @param {Number} startY start y position
         * @param {Number} endX end x position
         * @param {Number} endY end y position
         */
        api.drawLine = function (startX, startY, endX, endY) {
            backBufferContext2D.translate(startX, startY);
            backBufferContext2D.beginPath();
            backBufferContext2D.moveTo(0, 0);
            backBufferContext2D.lineTo(endX, endY);
            backBufferContext2D.stroke();
            backBufferContext2D.closePath();
            backBufferContext2D.translate(-startX, -startY);
        };

        /**
         * Draw an image using the canvas api
         * @name drawImage
         * @memberOf me.CanvasRenderer
         * @function
         * @param {image} image html image element
         * @param {Number} sx sx value, from the source image.
         * @param {Number} sy sy value, from the source image.
         * @param {Number} sw sw the width of the image to be drawn
         * @param {Number} sh sh the height of the image to be drawn
         * @param {Number} dx dx the x position to draw the image at on the screen
         * @param {Number} dy dy the y position to draw the image at on the screen
         * @param {Number} dw dw the width value to draw the image at on the screen
         * @param {Number} dh dh the height value to draw the image at on the screen
         * @example
         * Can be used in three ways:
         * me.CanvasRenderer.drawImage(image, dx, dy);
         * me.CanvasRenderer.drawImage(image, dx, dy, dw, dh);
         * me.CanvasRenderer.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
         * dx, dy, dw, dh being the destination target & dimensions. sx, sy, sw, sh being the position & dimensions to take from the image
         */
        api.drawImage = function () {
            backBufferContext2D.drawImage.apply(backBufferContext2D, arguments);
        };

        /**
         * Fill an arc at the specified coordinates with given radius, start and end points
         * @name fillArc
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} x arc center point x-axis
         * @param {Number} y arc center point y-axis
         * @param {Number} radius
         * @param {Number} start start angle in radians
         * @param {Number} end end angle in radians
         * @param {Boolean} [antiClockwise=false] draw arc anti-clockwise
         */
        api.fillArc = function (x, y, radius, start, end, antiClockwise) {
            backBufferContext2D.save();
            backBufferContext2D.beginPath();
            backBufferContext2D.translate(x + radius, y + radius);
            backBufferContext2D.arc(0, 0, radius, start, end, antiClockwise || false);
            backBufferContext2D.fill();
            backBufferContext2D.closePath();
            backBufferContext2D.restore();
        };

        /**
         * Draw a filled rectangle at the specified coordinates
         * @name fillRect
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} x
         * @param {Number} y
         * @param {Number} width
         * @param {Number} height
         */
        api.fillRect = function (x, y, width, height) {
            backBufferContext2D.fillRect(x, y, width, height);
        };

        /**
         * return a reference to the screen canvas
         * @name getScreenCanvas
         * @memberOf me.CanvasRenderer
         * @function
         * @return {Canvas}
         */
        api.getScreenCanvas = function () {
            return canvas;
        };

        /**
         * return a reference to the screen canvas corresponding 2d Context<br>
         * (will return buffered context if double buffering is enabled, or a reference to the Screen Context)
         * @name getScreenContext
         * @memberOf me.CanvasRenderer
         * @function
         * @return {Context2d}
         */
        api.getScreenContext = function () {
            return context;
        };

        /**
         * Returns the 2D Context object of the given Canvas
         * `getContext2d` will also enable/disable antialiasing features based on global settings.
         * @name getContext2d
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Canvas} [canvas=canvas instance of the renderer]
         * @return {Context2d}
         */
        api.getContext2d = function (c) {
            if (typeof c === "undefined" || c === null) {
                throw new me.video.Error(
                    "You must pass a canvas element in order to create " +
                    "a 2d context"
                );
            }

            if (typeof c.getContext === "undefined") {
                throw new me.video.Error(
                    "Your browser does not support HTML5 canvas."
                );
            }

            var _context;
            if (navigator.isCocoonJS) {
                // cocoonJS specific extension
                _context = c.getContext("2d", {
                    "antialias" : me.sys.scalingInterpolation
                });
            }
            else {
                _context = c.getContext("2d");
            }
            if (!_context.canvas) {
                _context.canvas = c;
            }
            this.setImageSmoothing(_context, me.sys.scalingInterpolation);
            return _context;
        };

        /**
         * return a reference to the system canvas
         * @name getCanvas
         * @memberOf me.CanvasRenderer
         * @function
         * @return {Canvas}
         */
        api.getCanvas = function () {
            return backBufferCanvas;
        };

        /**
         * returns the current color of the context
         * @name getColor
         * @memberOf me.CanvasRenderer
         * @function
         * @return {me.Color}
         */
        api.getColor = function () {
            return globalColor.clone();
        };

        /**
         * return a reference to the system 2d Context
         * @name getContext
         * @memberOf me.CanvasRenderer
         * @function
         * @return {Context2d}
         */
        api.getContext = function () {
            return backBufferContext2D;
        };

        /**
         * return the width of the system 2d Context
         * @name getWidth
         * @memberOf me.CanvasRenderer
         * @function
         * @return {Number}
         */
        api.getWidth = function () {
            return backBufferCanvas.width;
        };

        /**
         * return the height of the system 2d Context
         * @name getHeight
         * @memberOf me.CanvasRenderer
         * @function
         * @return {Number}
         */
        api.getHeight = function () {
            return backBufferCanvas.height;
        };

        /**
         * return the current global alpha
         * @name globalAlpha
         * @memberOf me.CanvasRenderer
         * @function
         * @return {Number}
         */
        api.globalAlpha = function () {
            return globalColor.alpha;
        };

        /**
         * returns the text size based on dimensions from the font. Uses the backbuffer context
         * @name measureText
         * @memberOf me.CanvasRenderer
         * @function
         * @param {me.Font} the instance of the font object
         * @param {String} text
         * @return {Object}
         */
        api.measureText = function (fontObject, text) {
            return fontObject.measureText(backBufferContext2D, text);
        };

        /**
         * resets the canvas transform to identity
         * @name resetTransform
         * @memberOf me.CanvasRenderer
         * @function
         */
        api.resetTransform = function () {
            backBufferContext2D.setTransform(1, 0, 0, 1, 0, 0);
        };

        /**
         * resizes the canvas & 2d Context
         * @name resize
         * @memberOf me.CanvasRenderer
         * @function
         */
        api.resize = function (scaleX, scaleY) {
            canvas.width = gameWidthZoom = backBufferCanvas.width * scaleX;
            canvas.height = gameHeightZoom = backBufferCanvas.height * scaleY;

            // adjust CSS style for High-DPI devices
            if (me.device.getPixelRatio() > 1) {
                canvas.style.width = (canvas.width / me.device.getPixelRatio()) + "px";
                canvas.style.height = (canvas.height / me.device.getPixelRatio()) + "px";
            }
            this.setImageSmoothing(context, me.sys.scalingInterpolation);
            this.blitSurface();
        };

        /**
         * save the canvas context
         * @name save
         * @memberOf me.CanvasRenderer
         * @function
         */
        api.save = function () {
            colorStack.push(api.getColor());
            backBufferContext2D.save();
        };

        /**
         * restores the canvas context
         * @name restore
         * @memberOf me.CanvasRenderer
         * @function
         */
        api.restore = function () {
            var color = colorStack.pop();
            me.pool.push("me.Color", color);
            backBufferContext2D.restore();
            api.setColor(color);
        };

        /**
         * rotates the canvas context
         * @name rotate
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} angle in radians
         */
        api.rotate = function (angle) {
            backBufferContext2D.rotate(angle);
        };

        /**
         * scales the canvas context
         * @name scale
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} x
         * @param {Number} y
         */
        api.scale = function (x, y) {
            backBufferContext2D.scale(x, y);
        };

        /**
         * @private
         */
        api.setAlpha = function (enable) {
            backBufferContext2D.globalCompositeOperation = enable ? "source-over" : "copy";
        };

        /**
         * Sets the fill & stroke style colors for the context.
         * @name setColor
         * @memberOf me.CanvasRenderer
         * @function
         * @param {me.Color|String} color css color value
         */
        api.setColor = function (color) {
            globalColor.copy(color);
            backBufferContext2D.strokeStyle = backBufferContext2D.fillStyle = globalColor.toRGBA();
        };

        /**
         * Sets the global alpha on the canvas context
         * @name setGlobalAlpha
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} alpha 0.0 to 1.0 values accepted.
         */
        api.setGlobalAlpha = function (a) {
            globalColor.setColor(
                globalColor.r,
                globalColor.g,
                globalColor.b,
                a
            );
            backBufferContext2D.globalAlpha = a;
        };

        /**
         * enable/disable image smoothing (scaling interpolation) for the specified 2d Context<br>
         * (!) this might not be supported by all browsers <br>
         * @name setImageSmoothing
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Context2d} context
         * @param {Boolean} [enable=false]
         */
        api.setImageSmoothing = function (context, enable) {
            me.agent.setPrefixed("imageSmoothingEnabled", enable === true, context);
        };

        /**
         * sets the line width on the context
         * @name setLineWidth
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} width the width to set;
         */
        api.setLineWidth = function (width) {
            backBufferContext2D.lineWidth = width;
        };

        /**
         * Stroke an arc at the specified coordinates with given radius, start and end points
         * @name strokeArc
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} x arc center point x-axis
         * @param {Number} y arc center point y-axis
         * @param {Number} radius
         * @param {Number} start start angle in radians
         * @param {Number} end end angle in radians
         * @param {Boolean} [antiClockwise=false] draw arc anti-clockwise
         */
        api.strokeArc = function (x, y, radius, start, end, antiClockwise) {
            backBufferContext2D.beginPath();
            backBufferContext2D.translate(x + radius, y + radius);
            backBufferContext2D.arc(0, 0, radius, start, end, antiClockwise || false);
            backBufferContext2D.stroke();
            backBufferContext2D.closePath();
        };

        /**
         * Stroke an ellipse at the specified coordinates with given radius, start and end points
         * @name strokeEllipse
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} x arc center point x-axis
         * @param {Number} y arc center point y-axis
         * @param {Number} w horizontal radius of the ellipse
         * @param {Number} h vertical radius of the ellipse
         */
        api.strokeEllipse = function (x, y, w, h) {
            context.beginPath();
            var hw = w,
                hh = h,
                lx = x - hw,
                rx = x + hw,
                ty = y - hh,
                by = y + hh;

            var xmagic = hw * 0.551784,
                ymagic = hh * 0.551784,
                xmin = x - xmagic,
                xmax = x + xmagic,
                ymin = y - ymagic,
                ymax = y + ymagic;

            backBufferContext2D.moveTo(x, ty);
            backBufferContext2D.bezierCurveTo(xmax, ty, rx, ymin, rx, y);
            backBufferContext2D.bezierCurveTo(rx, ymax, xmax, by, x, by);
            backBufferContext2D.bezierCurveTo(xmin, by, lx, ymax, lx, y);
            backBufferContext2D.bezierCurveTo(lx, ymin, xmin, ty, x, ty);
            backBufferContext2D.stroke();
        };

        /**
         * Stroke a line of the given two points
         * @name strokeLine
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} startX the start x coordinate
         * @param {Number} startY the start y coordinate
         * @param {Number} endX the end x coordinate
         * @param {Number} endY the end y coordinate
         */
        api.strokeLine = function (startX, startY, endX, endY) {
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.stroke();
        };

        /**
         * Strokes a me.Polygon on the screen with a specified color
         * @name strokePolygon
         * @memberOf me.CanvasRenderer
         * @function
         * @param {me.Polygon} poly the shape to draw
         */
        api.strokePolygon = function (poly) {
            backBufferContext2D.translate(poly.pos.x, poly.pos.y);
            backBufferContext2D.beginPath();
            backBufferContext2D.moveTo(poly.points[0].x, poly.points[0].y);
            var point;
            for (var i = 1; i < poly.points.length; i++) {
                point = poly.points[i];
                backBufferContext2D.lineTo(point.x, point.y);
            }
            backBufferContext2D.lineTo(poly.points[0].x, poly.points[0].y);
            backBufferContext2D.stroke();
            backBufferContext2D.closePath();
            backBufferContext2D.translate(-poly.pos.x, -poly.pos.y);
        };

        /**
         * Stroke a rectangle at the specified coordinates with a given color
         * @name strokeRect
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} x
         * @param {Number} y
         * @param {Number} width
         * @param {Number} height
         */
        api.strokeRect = function (x, y, width, height) {
            backBufferContext2D.strokeRect(x, y, width, height);
        };

        /**
         * draw the given shape
         * @name drawShape
         * @memberOf me.CanvasRenderer
         * @function
         * @param {me.Rect|me.Polygon|me.Line|me.Ellipse} shape a shape object
         */
        api.drawShape = function (shape) {
            if (shape instanceof me.Rect) {
                api.strokeRect(shape.left, shape.top, shape.width, shape.height);
            } else if (shape instanceof me.Line || shape instanceof me.Polygon) {
                api.save();
                api.strokePolygon(shape);
                api.restore();
            } else if (shape instanceof me.Ellipse) {
                api.save();
                if (shape.radiusV.x === shape.radiusV.y) {
                    // it's a circle
                    api.strokeArc(
                        shape.pos.x - shape.radius,
                        shape.pos.y - shape.radius,
                        shape.radius,
                        0,
                        2 * Math.PI
                    );
                } else {
                    // it's an ellipse
                    api.strokeEllipse(
                        shape.pos.x,
                        shape.pos.y,
                        shape.radiusV.x,
                        shape.radiusV.y
                    );
                }
                api.restore();
            }
        };

        /**
         * transforms the context. Accepts any number of integer arguments
         * @name transform
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} m11
         * @param {Number} m12
         * @param {Number} m21
         * @param {Number} m22
         * @param {Number} dx
         * @param {Number} dy
         */
        api.transform = function () {
            backBufferContext2D.transform(
                arguments[0],
                arguments[1],
                arguments[2],
                arguments[3],
                arguments[4],
                arguments[5]
            );
        };

        /**
         * Translates the context to the given position
         * @name translate
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} x
         * @param {Number} y
         */
        api.translate = function (x, y) {
            backBufferContext2D.translate(x, y);
        };

        return api;
    })();

})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * video functions
     * There is no constructor function for me.video
     * @namespace me.video
     * @memberOf me
     */
    me.video = (function () {
        // hold public stuff in our apig
        var api = {};

        // internal variables
        var canvas = null;
        var wrapper = null;

        var deferResizeId = -1;

        var double_buffering = false;
        var auto_scale = false;
        var maintainAspectRatio = true;

        // max display size
        var maxWidth = Infinity;
        var maxHeight = Infinity;

        /**
         * Auto-detect the best renderer to use
         * @ignore
         */
        function autoDetectRenderer() {
            try {
                return me.WebGLRenderer.init.apply(me.WebGLRenderer, arguments);
            }
            catch (e) {
                return me.CanvasRenderer.init.apply(me.CanvasRenderer, arguments);
            }
        }

        /*
         * PUBLIC STUFF
         */

        /**
         * Base class for Video exception handling.
         * @name Error
         * @class
         * @constructor
         * @memberOf me.video
         * @param {String} msg Error message.
         */
        api.Error = me.Error.extend({
            init : function (msg) {
                me.Error.prototype.init.apply(this, [ msg ]);
                this.name = "me.video.Error";
            }
        });

        /**
         * Select the HTML5 Canvas renderer
         * @public
         * @name CANVAS
         * @memberOf me.video
         * @enum {Number}
         */
        api.CANVAS = 0;

        /**
         * Select the WebGL renderer
         * @public
         * @name WEBGL
         * @memberOf me.video
         * @enum {Number}
         */
        api.WEBGL = 1;

        /**
         * Auto-select the renderer (Attempt WebGL first, with fallback to Canvas)
         * @public
         * @name AUTO
         * @memberOf me.video
         * @enum {Number}
         */
        api.AUTO = 2;

        /**
         * init the "video" part<p>
         * return false if initialization failed (canvas not supported)
         * @name init
         * @memberOf me.video
         * @function
         * @param {String} wrapper the "div" element id to hold the canvas in the HTML file  (if null document.body will be used)
         * @param {Number} [renderer=me.video.CANVAS] State which renderer you prefer to use.
         * @param {Number} width game width
         * @param {Number} height game height
         * @param {Boolean} [double_buffering] enable/disable double buffering
         * @param {Number} [scale] enable scaling of the canvas ('auto' for automatic scaling)
         * @param {Boolean} [maintainAspectRatio] maintainAspectRatio when scaling the display
         * @return {Boolean}
         * @example
         * // init the video with a 480x320 canvas
         * if (!me.video.init('jsapp', me.video.CANVAS, 480, 320)) {
         *    alert("Sorry but your browser does not support html 5 canvas !");
         *    return;
         * }
         */
        api.init = function (wrapperid, renderer, game_width, game_height, doublebuffering, scale, aspectRatio) {
            // ensure melonjs has been properly initialized
            if (!me.initialized) {
                throw new api.Error("me.video.init() called before engine initialization.");
            }
            // check given parameters
            double_buffering = doublebuffering || false;
            auto_scale  = (scale === "auto") || false;
            maintainAspectRatio = (typeof(aspectRatio) !== "undefined") ? aspectRatio : true;

            // normalize scale
            scale = (auto_scale) ? 1.0 : (+scale || 1.0);
            me.sys.scale = new me.Vector2d(scale, scale);

            // force double buffering if scaling is required
            if (auto_scale || (scale !== 1.0)) {
                double_buffering = true;
            }

            // default scaled size value
            var game_width_zoom = game_width * me.sys.scale.x;
            var game_height_zoom = game_height * me.sys.scale.y;

            //add a channel for the onresize/onorientationchange event
            window.addEventListener(
                "resize",
                throttle(
                    100,
                    false,
                    function (event) {
                        me.event.publish(me.event.WINDOW_ONRESIZE, [ event ]);
                    }
                ),
                false
            );
            window.addEventListener(
                "orientationchange",
                function (event) {
                    me.event.publish(me.event.WINDOW_ONORIENTATION_CHANGE, [ event ]);
                },
                false
            );

            // register to the channel
            me.event.subscribe(
                me.event.WINDOW_ONRESIZE,
                me.video.onresize.bind(me.video)
            );
            me.event.subscribe(
                me.event.WINDOW_ONORIENTATION_CHANGE,
                me.video.onresize.bind(me.video)
            );

            // create the main screen canvas
            canvas = api.createCanvas(game_width_zoom, game_height_zoom, true);

            // add our canvas
            if (wrapperid) {
                wrapper = document.getElementById(wrapperid);
            }
            // if wrapperid is not defined (null)
            if (!wrapper) {
                // add the canvas to document.body
                wrapper = document.body;
            }
            wrapper.appendChild(canvas);

            // stop here if not supported
            if (!canvas.getContext) {
                return false;
            }

            switch (renderer) {
                case api.WEBGL:
                    this.renderer = me.WebGLRenderer.init(canvas, game_width, game_height);
                    break;
                case api.AUTO:
                    this.renderer = autoDetectRenderer(canvas, game_width, game_height, double_buffering, game_width_zoom, game_height_zoom);
                    break;
                default:
                    this.renderer = me.CanvasRenderer.init(canvas, game_width, game_height, double_buffering, game_width_zoom, game_height_zoom);
                    break;
            }

            // adjust CSS style for High-DPI devices
            var ratio = me.device.getPixelRatio();
            if (ratio > 1) {
                canvas.style.width = (canvas.width / ratio) + "px";
                canvas.style.height = (canvas.height / ratio) + "px";
            }

            // set max the canvas max size if CSS values are defined
            if (window.getComputedStyle) {
                var style = window.getComputedStyle(canvas, null);
                me.video.setMaxSize(parseInt(style.maxWidth, 10), parseInt(style.maxHeight, 10));
            }

            // trigger an initial resize();
            me.video.onresize();

            me.game.init();

            return true;
        };

        /**
         * return the relative (to the page) position of the specified Canvas
         * @name getPos
         * @memberOf me.video
         * @function
         * @param {Canvas} [canvas] system one if none specified
         * @return {me.Vector2d}
         */
        api.getPos = function (c) {
            c = c || this.renderer.getScreenCanvas();
            return (
                c.getBoundingClientRect ?
                c.getBoundingClientRect() : { left : 0, top : 0 }
            );
        };

        /**
         * set the max canvas display size (when scaling)
         * @name setMaxSize
         * @memberOf me.video
         * @function
         * @param {Number} width width
         * @param {Number} height height
         */
        api.setMaxSize = function (w, h) {
            // max display size
            maxWidth = w || Infinity;
            maxHeight = h || Infinity;
        };


        /**
         * Create and return a new Canvas
         * @name createCanvas
         * @memberOf me.video
         * @function
         * @param {Number} width width
         * @param {Number} height height
         * @param {Boolean} [screencanvas=false] set to true if this canvas renders directly to the screen
         * @return {Canvas}
         */
        api.createCanvas = function (width, height, screencanvas) {
            if (width === 0 || height === 0)  {
                throw new api.Error("width or height was zero, Canvas could not be initialized !");
            }

            var _canvas = document.createElement("canvas");

            if ((screencanvas === true) && (navigator.isCocoonJS) && (me.device.android2 !== true)) {
                // enable ScreenCanvas on cocoonJS
                _canvas.screencanvas = true;
            }

            _canvas.width = width || canvas.width;
            _canvas.height = height || canvas.height;

            return _canvas;
        };

        /**
         * return a reference to the wrapper
         * @name getWrapper
         * @memberOf me.video
         * @function
         * @return {Document}
         */
        api.getWrapper = function () {
            return wrapper;
        };

        /**
         * callback for window resize event
         * @ignore
         */
        api.onresize = function () {
            // default (no scaling)
            var scaleX = 1, scaleY = 1;

            // check for orientation information
            if (typeof window.orientation !== "undefined") {
                me.device.orientation = window.orientation;
            }
            else {
                // is this actually not the best option since default "portrait"
                // orientation might vary between for example an ipad and and android tab
                me.device.orientation = (
                    window.outerWidth > window.outerHeight ?
                    90 : 0
                );
            }

            if (auto_scale) {
                // get the parent container max size
                var parent = me.video.renderer.getScreenCanvas().parentNode;
                var _max_width = Math.min(maxWidth, parent.width || window.innerWidth);
                var _max_height = Math.min(maxHeight, parent.height || window.innerHeight);

                if (maintainAspectRatio) {
                    // make sure we maintain the original aspect ratio
                    var designRatio = me.video.renderer.getWidth() / me.video.renderer.getHeight();
                    var screenRatio = _max_width / _max_height;
                    if (screenRatio < designRatio) {
                        scaleX = scaleY = _max_width / me.video.renderer.getWidth();
                    }
                    else {
                        scaleX = scaleY = _max_height / me.video.renderer.getHeight();
                    }
                }
                else {
                    // scale the display canvas to fit with the parent container
                    scaleX = _max_width / me.video.renderer.getWidth();
                    scaleY = _max_height / me.video.renderer.getHeight();
                }

                // adjust scaling ratio based on the device pixel ratio
                scaleX *= me.device.getPixelRatio();
                scaleY *= me.device.getPixelRatio();

                // scale if required
                if (scaleX !== 1 || scaleY !== 1) {
                    if (deferResizeId >= 0) {
                        // cancel any previous pending resize
                        clearTimeout(deferResizeId);
                    }
                    deferResizeId = me.video.updateDisplaySize.defer(this, scaleX, scaleY);
                    return;
                }
            }
            // make sure we have the correct relative canvas position cached
            me.input._offset = me.video.getPos();
        };

        /**
         * Modify the "displayed" canvas size
         * @name updateDisplaySize
         * @memberOf me.video
         * @function
         * @param {Number} scaleX X scaling multiplier
         * @param {Number} scaleY Y scaling multiplier
         */
        api.updateDisplaySize = function (scaleX, scaleY) {
            // update the global scale variable
            me.sys.scale.set(scaleX, scaleY);

            // renderer resize logic
            this.renderer.resize(scaleX, scaleY);

            me.input._offset = me.video.getPos();
            // clear the timeout id
            deferResizeId = -1;
        };

        /**
         * enable/disable Alpha. Only applies to canvas renderer
         * @name setAlpha
         * @memberOf me.video
         * @function
         * @param {Boolean} enable
         */
        api.setAlpha = function (enable) {
            this.renderer.setAlpha(enable);
        };

        // return our api
        return api;
    })();

})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {

    /**
     * The WebGL Shader singleton
     * There is no constructor function for me.video.shader
     * @namespace me.video.shader
     * @memberOf me.video
     * @ignore
     */
    me.video.shader = (function () {
        /**
         * Public API
         * @ignore
         */
        var api = {
            "attributes"    : {},
            "uniforms"      : {},
            "handle"        : null,
        };

        /**
         * Shader GLSL
         * @ignore
         */
        var fragment = "precision mediump float;\n" + "varying vec2 vTexCoord;\n" + "uniform vec4 uColor;\n" + "uniform sampler2D texture;\n" + "void main(void) {\n" + "    gl_FragColor = texture2D(texture, vec2(vTexCoord.s, vTexCoord.t)) * uColor;\n" + "}\n" + "";
        var vertex = "attribute vec2 aPosition;\n" + "attribute vec2 aTexture;\n" + "uniform mat3 uMatrix;\n" + "uniform mat3 pMatrix;\n" + "varying vec2 vTexCoord;\n" + "void main(void) {\n" + "   gl_Position = vec4((pMatrix * (uMatrix * vec3(aPosition, 1))).xy, 0, 1);\n" + "   vTexCoord = aTexture;\n" + "}\n" + "";

        /**
         * Compile GLSL into a shader object
         * @private
         */
        function getShader(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw new me.video.Error(gl.getShaderInfoLog(shader));
            }

            return shader;
        }

        /**
         * Useless bind function for compatibility with glslify
         * @name bind
         * @memberOf me.video.shader
         * @function
         */
        api.bind = function () {};

        /**
         *
         * @name createShader
         * @memberOf me.video.shader
         * @function
         * @param {WebGLContext} gl WebGL Context
         * @return {me.video.shader} A reference to the WebGL Shader singleton
         */
        api.createShader = function (gl) {
            var handle = api.handle = gl.createProgram();
            gl.attachShader(handle, getShader(gl, gl.VERTEX_SHADER, vertex));
            gl.attachShader(handle, getShader(gl, gl.FRAGMENT_SHADER, fragment));
            gl.linkProgram(handle);

            if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
                throw new me.video.Error("Could not initialize shaders");
            }

            gl.useProgram(handle);

            // Get attribute references
            var attributes = {};
            var aLocations = {};
            [
                "aPosition",
                "aTexture"
            ].forEach(function (attr) {
                aLocations[attr] = {
                    "location" : gl.getAttribLocation(handle, attr)
                };
                gl.enableVertexAttribArray(aLocations[attr].location);
                attributes[attr] = {
                    "get" : (function (attr) {
                        /**
                         * A getter for the attribute location
                         * @ignore
                         */
                        return function () {
                            return aLocations[attr];
                        };
                    })(attr),
                };
            });
            Object.defineProperties(api.attributes, attributes);

            // Get uniform references
            var uniforms = {};
            var uLocations = {};
            [
                "pMatrix",
                "uMatrix",
                "uColor",
                "texture"
            ].forEach(function (uniform) {
                uLocations[uniform] = {
                    "location" : gl.getUniformLocation(handle, uniform)
                };
                uniforms[uniform] = {
                    "get" : (function (uniform) {
                        /**
                         * A getter for the uniform location
                         * @ignore
                         */
                        return function () {
                            return uLocations[uniform];
                        };
                    })(uniform),
                    "set" : (function (uniform) {
                        if (uniform === "uColor") {
                            /**
                             * A setter for 4-element float vectors, e.g. colors
                             * @ignore
                             */
                            return function (val) {
                                gl.uniform4fv(
                                    uLocations[uniform].location,
                                    val
                                );
                            };
                        }
                        if (uniform === "texture") {
                            /**
                             * A setter for sampler2D uniforms, e.g. textures
                             * @ignore
                             */
                            return function () {
                                gl.uniform1i(
                                    uLocations[uniform].location,
                                    0
                                );
                            };
                        }
                        return function (val) {
                            /**
                             * A setter for 3x3 matrices
                             * @ignore
                             */
                            gl.uniformMatrix3fv(
                                uLocations[uniform].location,
                                false,
                                val
                            );
                        };
                    })(uniform),
                };
            });
            Object.defineProperties(api.uniforms, uniforms);

            return api;
        };

        /**
         * Create a texture from an image
         * @name gltexture2d
         * @memberOf me.video.shader
         * @function
         * @param {WebGLContext} gl WebGL Context
         * @param {Image|Canvas|ImageData} image Source image
         * @return {WebGLTexture} A newly created texture
         */
        api.gltexture2d = function (gl, image) {
            var texture = gl.createTexture(),
                filter = me.sys.scalingInterpolation ? gl.LINEAR : gl.NEAREST;

            /**
             * A convenience method for binding this texture to the current
             * texture element for compatibility with gl-texture2d
             * @ignore
             */
            texture.bind = function () {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                return texture;
            };

            texture.bind();
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            return texture;
        };

        return api;
    })();

})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */
(function () {

    /**
     * The WebGL renderer object
     * There is no constructor function for me.CanvasRenderer
     * @namespace me.WebGLRenderer
     * @memberOf me
     * @ignore
     */
    me.WebGLRenderer = (function () {
        var api = {},
        canvas = null,
        colorStack = [],
        dimensions = null,
        fontCache = {},
        fontCanvas = null,
        fontContext = null,
        gl = null,
        globalColor = null,
        lineTextureCoords = new Float32Array(8),
        lineVerticeArray = new Float32Array(8),
        matrixStack = [],
        positionBuffer = null,
        shaderProgram = null,
        textureBuffer = null,
        textureCoords = new Float32Array(12),
        textureLocation = null,
        verticeArray = new Float32Array(12),
        white1PixelTexture = null;

        /**
         * initializes the webgl renderer, creating the requried contexts
         * @name init
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Canvas} canvas - the html canvas tag to draw to on screen.
         * @param {Number} game_width - the width of the canvas without scaling
         * @param {Number} game_height - the height of the canvas without scaling
         */
        api.init = function (c, width, height) {
            canvas = c;
            gl = this.getContextGL(c);
            gl.FALSE = false;
            gl.TRUE = true;

            dimensions = { width: width, height: height };

            this.uniformMatrix = new me.Matrix3d();
            this.projection = new me.Matrix3d({
                val: new Float32Array([
                    2 / width,  0,              0,
                    0,          -2 / height,    0,
                    -1,         1,              1
                ])
            });

            this.createShader();
            shaderProgram.bind();

            gl.enableVertexAttribArray(shaderProgram.attributes.aTexture.location);
            gl.enableVertexAttribArray(shaderProgram.attributes.aPosition.location);

            globalColor = new me.Color(255, 255, 255, 1.0);
            fontCanvas = me.video.createCanvas(width, height, false);
            fontContext = me.CanvasRenderer.getContext2d(fontCanvas);

            white1PixelTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, white1PixelTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

            this.createBuffers();

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            textureLocation = gl.getUniformLocation(shaderProgram.handle, "texture");

            this.resize(1, 1);

            return this;
        };

        /**
         * Binds the projection matrix to the shader
         * @name applyProjection
         * @memberOf me.WebGLRenderer
         * @function
         */
        api.applyProjection = function () {
            shaderProgram.uniforms.pMatrix = this.projection.val;
        };

        /**
         * @ignore
         */
        api.bindTexture = function (image) {
            // FIXME: Create a new object for this instead of modifying the image
            var w = image.width,
                h = image.height;

            // Create a Texture from the image
            image.texture = me.video.shader.gltexture2d(gl, image);

            // Create a Vertex Buffer
            image.vb = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, image.vb);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0, 0,
                w, 0,
                0, h,
                w, h
            ]), gl.STATIC_DRAW);

            // Create a Texture Coordinate Buffer
            image.t = {};
            var key = "0,0," + w + "," + h;
            this.cacheTextureCoords(image, key, 0, 0, w, h);

            // Create an Index Buffer
            image.ib = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, image.ib);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
                0, 1, 2,
                2, 1, 3
            ]), gl.STATIC_DRAW);
        };

        /**
         * @ignore
         */
        api.bindTextureCoords = function (image, x, y, w, h) {
            // Texture coordinates are cached
            // They can be looked up by indexing "x,y,w,h"
            var key = x + "," + y + "," + w + "," + h;

            if (key in image.t) {
                // Bind the new texture coordinates buffer to the ARRAY_BUFFER
                gl.bindBuffer(gl.ARRAY_BUFFER, image.t[key]);
            }
            else {
                this.cacheTextureCoords(image, key, x, y, w, h);
            }
        };

        /**
         * @ignore
         */
        api.cacheTextureCoords = function (image, key, x, y, w, h) {
            w = (x + w) / image.width;
            h = (y + h) / image.height;
            x /= image.width;
            y /= image.height;

            image.t[key] = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, image.t[key]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x, y,
                w, y,
                x, h,
                w, h
            ]), gl.STATIC_DRAW);
        };

        /**
         * @ignore
         */
        api.blitSurface = function () {};

        /**
         * Clears the gl context. Accepts a gl context or defaults to stored gl renderer.
         * @name clearSurface
         * @memberOf me.WebGLRenderer
         * @function
         * @param {WebGLContext} [ctx=null] gl context, defaults to system context.
         * @param {me.Color|String} color css color.
         */
        api.clearSurface = function (ctx, col) {
            if (!ctx) {
                ctx = gl;
            }
            colorStack.push(this.getColor());
            this.setColor(col);
            this.fillRect(0, 0, canvas.width, canvas.height);
            this.setColor(colorStack.pop());
        };

        /**
         * @ignore
         */
        api.createBuffers = function () {
            textureBuffer = gl.createBuffer();
            positionBuffer = gl.createBuffer();
        };

        /**
         * @ignore
         */
        api.createShader = function () {
            shaderProgram = me.video.shader.createShader(gl);
        };

        /**
         * draws font to an off screen context, and blits to the backbuffer canvas.
         * @name drawFont
         * @memberOf me.WebGLRenderer
         * @function
         * @param {me.Font} fontObject - an instance of me.Font
         * @param {String} text - the string of text to draw
         * @param {Number} x - the x position to draw at
         * @param {Number} y - the y position to draw at
         */
        api.drawFont = function (fontObject, text, x, y) {
            var fontDimensions;
            var gid = fontObject.gid;
            if (!fontCache[gid]) {
                fontObject.draw(fontContext, text, x, y);
                fontDimensions = fontObject.measureText(fontContext, text);
                fontCache[gid] = {
                    "font" : fontObject.font,
                    "fontSize" : fontObject.fontSize,
                    "fillStyle" : fontObject.fillStyle,
                    "textAlign" : fontObject.textAlign,
                    "textBaseline" : fontObject.textBaseline,
                    "lineHeight" : fontObject.lineHeight,
                    "text" : fontObject.text,
                    "image" : fontContext.getImageData(0, 0, fontCanvas.width, fontCanvas.height),
                    "width" : fontDimensions.width,
                    // Roughly equivalent to the height reserved for descenders
                    "height" : fontDimensions.height * 1.2,
                    "yOffset" : 0,
                };
                switch (fontObject.textBaseline) {
                    case "alphabetic":
                    case "ideographic":
                    case "bottom":
                        fontCache[gid].yOffset = fontDimensions.height;
                        break;

                    case "middle":
                        fontCache[gid].yOffset = fontDimensions.height / 2;
                        break;
                }
                fontContext.clearRect(0, 0, canvas.width, canvas.height);
            }
            else {
                var cache = fontCache[gid];
                if (fontObject.font !== cache.font || fontObject.fontSize !== cache.fontSize || fontObject.fillStyle !== cache.fillStyle || fontObject.textAlign !== cache.textAlign || fontObject.textBaseline !== cache.textBaseline || fontObject.lineHeight !== cache.lineHeight || text !== cache.text) {
                    cache.font = fontObject.font;
                    cache.fontSize = fontObject.fontSize;
                    cache.fillStyle = fontObject.fillStyle;
                    cache.textAlign = fontObject.textAlign;
                    cache.textBaseline = fontObject.textBaseline;
                    cache.lineHeight = fontObject.lineHeight;
                    cache.text = text;

                    fontObject.draw(fontContext, text, x, y);
                    fontDimensions = fontObject.measureText(fontContext, text);
                    cache.yOffset = 0;
                    switch (cache.textBaseline) {
                        case "alphabetic":
                        case "ideographic":
                        case "bottom":
                            cache.yOffset = fontDimensions.height;
                            break;

                        case "middle":
                            cache.yOffset = fontDimensions.height / 2;
                            break;
                    }
                    cache.width = fontDimensions.width;
                    // Roughly equivalent to the height reserved for descenders
                    cache.height = fontDimensions.height * 1.2;
                    cache.image = fontContext.getImageData(0, 0, fontCanvas.width, fontCanvas.height);

                    fontContext.clearRect(0, 0, canvas.width, canvas.height);
                }
            }

            y -= fontCache[gid].yOffset;
            this.drawImage(
                fontCache[gid].image,
                x, y, fontCache[gid].width, fontCache[gid].height,
                x, y, fontCache[gid].width, fontCache[gid].height
            );
        };
        
        /**
         * Draw a line from the given point to the destination point.
         * @name drawLine
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Number} startX start x position
         * @param {Number} startY start y position
         * @param {Number} endX end x position
         * @param {Number} endY end y position
         */
        api.drawLine = function (/*startX, startY, endX, endY*/) {
            // todo
        };
        
        /**
         * Draw an image to the gl context
         * @name drawImage
         * @memberOf me.WebGLRenderer
         * @function
         * @param {image} image html image element
         * @param {Number} sx value, from the source image.
         * @param {Number} sy value, from the source image.
         * @param {Number} sw the width of the image to be drawn
         * @param {Number} sh the height of the image to be drawn
         * @param {Number} dx the x position to draw the image at on the screen
         * @param {Number} dy the y position to draw the image at on the screen
         * @param {Number} dw the width value to draw the image at on the screen
         * @param {Number} dh the height value to draw the image at on the screen
         */
        api.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
            if (typeof image.texture === "undefined") {
                this.bindTexture(image);
            }

            if (typeof sw === "undefined") {
                sw = dw = image.width;
                sh = dh = image.height;
                dx = sx;
                dy = sy;
                sx = 0;
                sy = 0;
            }
            else if (typeof dx === "undefined") {
                dx = sx;
                dy = sy;
                dw = sw;
                dh = sh;
                sw = image.width;
                sh = image.height;
                sx = 0;
                sy = 0;
            }

            // Save
            matrixStack.push(this.uniformMatrix.clone());

            // Translate and scale the destination vertices
            this.uniformMatrix.translate(~~dx, ~~dy);
            this.uniformMatrix.scale(dw / image.width, dh / image.height);

            // Set vertex positions
            gl.bindBuffer(gl.ARRAY_BUFFER, image.vb);
            gl.vertexAttribPointer(shaderProgram.attributes.aPosition.location, 2, gl.FLOAT, false, 0, 0);

            // Set texture coordinates
            this.bindTextureCoords(image, ~~sx, ~~sy, ~~sw, ~~sh);
            gl.vertexAttribPointer(shaderProgram.attributes.aTexture.location, 2, gl.FLOAT, false, 0, 0);

            // Bind the texture
            shaderProgram.uniforms.texture = image.texture.bind();

            // Set the transformation matrix
            shaderProgram.uniforms.uMatrix = this.uniformMatrix.val;

            // Set the color
            shaderProgram.uniforms.uColor = globalColor.toGL();

            // MAKE IT SO
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

            // Restore
            this.uniformMatrix.copy(matrixStack.pop());
        };

        /**
         * Draw a filled rectangle at the specified coordinates
         * @name fillRect
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Number} x
         * @param {Number} y
         * @param {Number} width
         * @param {Number} height
         */
        api.fillRect = function (x, y, width, height) {
            var x1 = x;
            var y1 = y;
            var x2 = x + width;
            var y2 = y + height;
            verticeArray[0] = x1;
            verticeArray[1] = y1;
            verticeArray[2] = x2;
            verticeArray[3] = y1;
            verticeArray[4] = x1;
            verticeArray[5] = y2;
            verticeArray[6] = x1;
            verticeArray[7] = y2;
            verticeArray[8] = x2;
            verticeArray[9] = y1;
            verticeArray[10] = x2;
            verticeArray[11] = y2;

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);

            gl.vertexAttribPointer(shaderProgram.attributes.aPosition.location, 2, gl.FLOAT, false, 0, 0);

            textureCoords[0] = 0.0;
            textureCoords[1] = 0.0;
            textureCoords[2] = 1.0;
            textureCoords[3] = 0.0;
            textureCoords[4] = 0.0;
            textureCoords[5] = 1.0;
            textureCoords[6] = 0.0;
            textureCoords[7] = 1.0;
            textureCoords[8] = 1.0;
            textureCoords[9] = 0.0;
            textureCoords[10] = 1.0;
            textureCoords[11] = 1.0;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, white1PixelTexture);
            gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, textureCoords, gl.STATIC_DRAW);
            gl.vertexAttribPointer(shaderProgram.attributes.aTexture.location, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1i(textureLocation, 0);
            shaderProgram.uniforms.uMatrix = this.uniformMatrix.val;

            shaderProgram.uniforms.uColor = globalColor.toGL();
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };

        /**
         * return a reference to the screen canvas
         * @name getScreenCanvas
         * @memberOf me.WebGLRenderer
         * @function
         * @return {Canvas}
         */
        api.getScreenCanvas = function () {
            return canvas;
        };

        /**
         * return a reference to the screen canvas corresponding WebGL Context<br>
         * @name getScreenContext
         * @memberOf me.WebGLRenderer
         * @function
         * @return {WebGLContext}
         */
        api.getScreenContext = function () {
            return gl;
        };

        /**
         * Returns the WebGL Context object of the given Canvas
         * @name getContextGL
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Canvas} [canvas=canvas instance of the renderer]
         * @return {WebGLContext}
         */
        api.getContextGL = function (c) {
            if (typeof c === "undefined" || c === null) {
                throw new me.video.Error(
                    "You must pass a canvas element in order to create " +
                    "a GL context"
                );
            }

            if (typeof c.getContext === "undefined") {
                throw new me.video.Error(
                    "Your browser does not support WebGL."
                );
            }

            var attr = {
                antialias : me.sys.scalingInterpolation,
            };
            return (
                c.getContext("webgl", attr) ||
                c.getContext("experimental-webgl", attr)
            );
        };

        /**
         * return a reference to the system canvas
         * @name getCanvas
         * @memberOf me.WebGLRenderer
         * @function
         * @return {Canvas}
         */
        api.getCanvas = function () {
            return canvas;
        };

        /**
         * returns the current color of the drawing context
         * @name getColor
         * @memberOf me.WebGLRenderer
         * @function
         * @return {me.Color}
         */
        api.getColor = function () {
            return globalColor.clone();
        };

        /**
         * Returns the WebGLContext instance for the renderer
         * return a reference to the system 2d Context
         * @name getContext
         * @memberOf me.WebGLRenderer
         * @function
         * @return {WebGLContext}
         */
        api.getContext = function () {
            return gl;
        };

        /**
         * return the width of the system GL Context
         * @name getWidth
         * @memberOf me.WebGLRenderer
         * @function
         * @return {Number}
         */
        api.getWidth = function () {
            return gl.canvas.width;
        };

        /**
         * return the height of the system GL Context
         * @name getHeight
         * @memberOf me.WebGLRenderer
         * @function
         * @return {Number}
         */
        api.getHeight = function () {
            return gl.canvas.height;
        };

        /**
         * return the current global alpha
         * @name globalAlpha
         * @memberOf me.WebGLRenderer
         * @function
         * @return {Number}
         */
        api.globalAlpha = function () {
            return globalColor.alpha;
        };

        /**
         * returns the text size based on dimensions from the font. Uses the font drawing context
         * @name measureText
         * @memberOf me.WebGLRenderer
         * @function
         * @param {me.Font} the instance of the font object
         * @param {String} text
         * @return {Object}
         */
        api.measureText = function (fontObject, text) {
            return fontObject.measureText(fontContext, text);
        };

        /**
         * resets the gl transform to identity
         * @name resetTransform
         * @memberOf me.WebGLRenderer
         * @function
         */
        api.resetTransform = function () {
            this.uniformMatrix.identity();
        };

        /**
         * resizes the canvas & GL Context
         * @name resize
         * @memberOf me.WebGLRenderer
         * @function
         */
        api.resize = function (scaleX, scaleY) {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            var w = dimensions.width * scaleX;
            var h = dimensions.height * scaleY;

            // adjust CSS style for High-DPI devices
            if (me.device.getPixelRatio() > 1) {
                canvas.style.width = (w / me.device.getPixelRatio()) + "px";
                canvas.style.height = (h / me.device.getPixelRatio()) + "px";
            }
            else {
                canvas.style.width = w + "px";
                canvas.style.height = h + "px";
            }
            gl.viewport(0, 0, dimensions.width, dimensions.height);

            this.setProjection();
            this.applyProjection();
        };

        /**
         * restores the canvas context
         * @name restore
         * @memberOf me.WebGLRenderer
         * @function
         */
        api.restore = function () {
            var color = colorStack.pop();
            me.pool.push("me.Color", color);
            globalColor.copy(color);
            this.uniformMatrix.copy(matrixStack.pop());
        };

        /**
         * rotates the uniform matrix
         * @name rotate
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Number} angle in radians
         */
        api.rotate = function (angle) {
            this.uniformMatrix.rotate(angle);
        };

        /**
         * save the canvas context
         * @name save
         * @memberOf me.WebGLRenderer
         * @function
         */
        api.save = function () {
            colorStack.push(this.getColor());
            matrixStack.push(this.uniformMatrix.clone());
        };

        /**
         * scales the uniform matrix
         * @name scale
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Number} x
         * @param {Number} y
         */
        api.scale = function (x, y) {
            this.uniformMatrix.scale(x, y);
        };

        /**
         * Enables/disables alpha
         * @private
         */
        api.setAlpha = function () {
            /* Unimplemented */
        };

        /**
         * @ignore
         */
        api.setProjection = function () {
            this.projection.set(2 / canvas.width, 0, 0,
                0, -2 / canvas.height, 0,
                -1, 1, 1);
        };

        /**
         * @ignore
         */
        api.setImageSmoothing = function () {
            // TODO: perhaps handle GLNEAREST or other options with texture binding
        };

        /**
         * return the current global alpha
         * @name globalAlpha
         * @memberOf me.WebGLRenderer
         * @function
         * @return {Number}
         */
        api.setGlobalAlpha = function (a) {
            globalColor.setColor(
                globalColor.r,
                globalColor.g,
                globalColor.b,
                a
            );
        };

        /**
         * Sets the color for further draw calls
         * @name setColor
         * @memberOf me.WebGLRenderer
         * @function
         * @param {me.Color|String} color css color string.
         */
        api.setColor = function (color) {
            globalColor.copy(color);
        };

        /**
         * sets the line width on the context
         * @name setLineWidth
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} width the width to set;
         */
        api.setLineWidth = function () {
        };

        /**
         * Stroke an arc at the specified coordinates with given radius, start and end points
         * @name strokeArc
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Number} x arc center point x-axis
         * @param {Number} y arc center point y-axis
         * @param {Number} radius
         * @param {Number} start start angle in radians
         * @param {Number} end end angle in radians
         * @param {Boolean} [antiClockwise=false] draw arc anti-clockwise
         */
        api.strokeArc = function (/*x, y, radius, start, end, antiClockwise*/) {
            //todo
        };
        
        /**
         * Stroke an ellipse at the specified coordinates with given radius, start and end points
         * @name strokeEllipse
         * @memberOf me.CanvasRenderer
         * @function
         * @param {Number} x arc center point x-axis
         * @param {Number} y arc center point y-axis
         * @param {Number} w horizontal radius of the ellipse
         * @param {Number} h vertical radius of the ellipse
         */
        api.strokeEllipse = function (/*x, y, w, h*/) {
            //todo
        };
        
        /**
         * Stroke a line of the given two points
         * @name strokeLine
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Number} startX the start x coordinate
         * @param {Number} startY the start y coordinate
         * @param {Number} endX the end x coordinate
         * @param {Number} endY the end y coordinate
         */
        api.strokeLine = function (/*startX, startY, endX, endY*/) {
            //todo
        };

        /**
         * Strokes a me.Polygon on the screen with a specified color
         * @name strokePolygon
         * @memberOf me.WebGLRenderer
         * @function
         * @param {me.Polygon} poly the shape to draw
         */
        api.strokePolygon = function (/*poly*/) {
            // todo
        };

        /**
         * Draw a stroke rectangle at the specified coordinates
         * @name strokeRect
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Number} x
         * @param {Number} y
         * @param {Number} width
         * @param {Number} height
         */
        api.strokeRect = function (x, y, width, height) {
            var x1 = x;
            var y1 = y;
            var x2 = x + width;
            var y2 = y + height;
            lineVerticeArray[0] = x1;
            lineVerticeArray[1] = y1;
            lineVerticeArray[2] = x2;
            lineVerticeArray[3] = y1;
            lineVerticeArray[4] = x2;
            lineVerticeArray[5] = y2;
            lineVerticeArray[6] = x1;
            lineVerticeArray[7] = y2;

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, lineVerticeArray, gl.STATIC_DRAW);

            gl.vertexAttribPointer(shaderProgram.attributes.aPosition.location, 2, gl.FLOAT, false, 0, 0);

            lineTextureCoords[0] = 0.0;
            lineTextureCoords[1] = 0.0;
            lineTextureCoords[2] = 1.0;
            lineTextureCoords[3] = 0.0;
            lineTextureCoords[4] = 1.0;
            lineTextureCoords[5] = 1.0;
            lineTextureCoords[6] = 0.0;
            lineTextureCoords[7] = 1.0;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, white1PixelTexture);
            gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, lineTextureCoords, gl.STATIC_DRAW);
            gl.vertexAttribPointer(shaderProgram.attributes.aTexture.location, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1i(textureLocation, 0);
            shaderProgram.uniforms.uMatrix = this.uniformMatrix.val;

            shaderProgram.uniforms.uColor = globalColor.toGL();
            gl.drawArrays(gl.LINE_LOOP, 0, 4);
        };

        /**
         * draw the given shape
         * @name drawShape
         * @memberOf me.WebGLRenderer
         * @function
         * @param {me.Rect|me.Polygon|me.Line|me.Ellipse} shape a shape object
         */
        api.drawShape = function (shape) {
            if (shape instanceof me.Rect) {
                api.strokeRect(shape.left, shape.top, shape.width, shape.height);
            } else if (shape instanceof me.Line || shape instanceof me.Polygon) {
                api.save();
                api.strokePolygon(shape);
                api.restore();
            } else if (shape instanceof me.Ellipse) {
                api.save();
                if (shape.radiusV.x === shape.radiusV.y) {
                    // it's a circle
                    api.strokeArc(
                        shape.pos.x - shape.radius,
                        shape.pos.y - shape.radius,
                        shape.radius,
                        0,
                        2 * Math.PI
                    );
                } else {
                    // it's an ellipse
                    api.strokeEllipse(
                        shape.pos.x,
                        shape.pos.y,
                        shape.radiusV.x,
                        shape.radiusV.y
                    );
                }
                api.restore();
            }
        };

        /**
         * Sets the uniform matrix to the specified values from a Matrix2d
         * Created to support the original canvas method on the webgl renderer
         * @name transform
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Array} mat2d array representation to transform by
         */
        api.transform = function () {
            // TODO: Try to optimize or pool this.
            var out = new Float32Array(9);
            out[0] = arguments[0];
            out[1] = arguments[1];
            out[2] = 0;

            out[3] = arguments[2];
            out[4] = arguments[3];
            out[5] = 0;

            out[6] = arguments[4];
            out[7] = arguments[5];
            out[8] = 1;
            this.uniformMatrix.multiplyArray(out);
        };

        /**
         * Translates the uniform matrix by the given coordinates
         * @name translate
         * @memberOf me.WebGLRenderer
         * @function
         * @param {Number} x
         * @param {Number} y
         */
        api.translate = function (x, y) {
            this.uniformMatrix.translate(x, y);
        };

        return api;
    })();

})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, Olivier Biot, Jason Oster
 * http://www.melonjs.org/
 *
 */
(function () {
    /**
     * @namespace me.input
     * @memberOf me
     */
    me.input = (function () {
        // hold public stuff in our singleton
        var api = {};

        /*
         * PRIVATE STUFF
         */

        /**
         * prevent event propagation
         * @ignore
         */
        api._preventDefault = function (e) {
            // stop event propagation
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            else {
                e.cancelBubble = true;
            }
            // stop event default processing
            if (e.preventDefault)  {
                e.preventDefault();
            }
            else  {
                e.returnValue = false;
            }

            return false;
        };

        /*
         * PUBLIC STUFF
         */

        /**
         * Global flag to specify if melonJS should prevent default browser action on registered key events <br>
         * This is also configurable per key through the bindKey function
         * default : true
         * @public
         * @type Boolean
         * @name preventDefault
         * @memberOf me.input
         */
        api.preventDefault = true;

        // return our object
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, Olivier Biot, Jason Oster
 * http://www.melonjs.org/
 *
 */
(function () {
    /*
     * PRIVATE STUFF
     */

    // Reference to base class
    var obj = me.input;

    // list of binded keys
    obj._KeyBinding = {};

    // corresponding actions
    var keyStatus = {};

    // lock enable flag for keys
    var keyLock = {};
    // actual lock status of each key
    var keyLocked = {};

    // List of binded keys being held
    var keyRefs = {};

    // whether default event should be prevented for a given keypress
    var preventDefaultForKeys = {};

    // some useful flags
    var keyboardInitialized = false;

    /**
     * enable keyboard event
     * @ignore
     */
    obj._enableKeyboardEvent = function () {
        if (!keyboardInitialized) {
            window.addEventListener("keydown", obj._keydown, false);
            window.addEventListener("keyup", obj._keyup, false);
            keyboardInitialized = true;
        }
    };

    /**
     * key down event
     * @ignore
     */
    obj._keydown = function (e, keyCode, mouseButton) {

        keyCode = keyCode || e.keyCode || e.which;
        var action = obj._KeyBinding[keyCode];

        // publish a message for keydown event
        me.event.publish(me.event.KEYDOWN, [
            action,
            keyCode,
            action ? !keyLocked[action] : true
        ]);

        if (action) {
            if (!keyLocked[action]) {
                var trigger = mouseButton ? mouseButton : keyCode;
                if (!keyRefs[action][trigger]) {
                    keyStatus[action]++;
                    keyRefs[action][trigger] = true;
                }
            }
            // prevent event propagation
            if (preventDefaultForKeys[keyCode]) {
                return obj._preventDefault(e);
            }
            else {
                return true;
            }
        }

        return true;
    };


    /**
     * key up event
     * @ignore
     */
    obj._keyup = function (e, keyCode, mouseButton) {
        keyCode = keyCode || e.keyCode || e.which;
        var action = obj._KeyBinding[keyCode];

        // publish a message for keydown event
        me.event.publish(me.event.KEYUP, [ action, keyCode ]);

        if (action) {
            var trigger = mouseButton ? mouseButton : keyCode;
            keyRefs[action][trigger] = undefined;

            if (keyStatus[action] > 0) {
                keyStatus[action]--;
            }

            keyLocked[action] = false;

            // prevent event propagation
            if (preventDefaultForKeys[keyCode]) {
                return obj._preventDefault(e);
            }
            else {
                return true;
            }
        }

        return true;
    };

    /*
     * PUBLIC STUFF
     */

    /**
     * Almost all keyboard keys that have ASCII code, like:
     * LEFT, UP, RIGHT, DOWN, ENTER, SHIFT, CTRL, ALT, ESC, SPACE, TAB, BACKSPACE, PAUSE,
     * PAGE_UP, PAGE_DOWN, INSERT, DELETE, CAPS_LOCK, NUM_LOCK, SCROLL_LOCK, PRINT_SCREEN,
     * Keys [0..9], [A..Z], [NUMPAD0..NUMPAD9], [F1..F12]
     * @public
     * @enum {number}
     * @name KEY
     * @memberOf me.input
     */
    obj.KEY = {
        "BACKSPACE" : 8,
        "TAB" : 9,
        "ENTER" : 13,
        "SHIFT" : 16,
        "CTRL" : 17,
        "ALT" : 18,
        "PAUSE" : 19,
        "CAPS_LOCK" : 20,
        "ESC" : 27,
        "SPACE" : 32,
        "PAGE_UP" : 33,
        "PAGE_DOWN" : 34,
        "END" : 35,
        "HOME" : 36,
        "LEFT" : 37,
        "UP" : 38,
        "RIGHT" : 39,
        "DOWN" : 40,
        "PRINT_SCREEN" : 42,
        "INSERT" : 45,
        "DELETE" : 46,
        "NUM0" : 48,
        "NUM1" : 49,
        "NUM2" : 50,
        "NUM3" : 51,
        "NUM4" : 52,
        "NUM5" : 53,
        "NUM6" : 54,
        "NUM7" : 55,
        "NUM8" : 56,
        "NUM9" : 57,
        "A" : 65,
        "B" : 66,
        "C" : 67,
        "D" : 68,
        "E" : 69,
        "F" : 70,
        "G" : 71,
        "H" : 72,
        "I" : 73,
        "J" : 74,
        "K" : 75,
        "L" : 76,
        "M" : 77,
        "N" : 78,
        "O" : 79,
        "P" : 80,
        "Q" : 81,
        "R" : 82,
        "S" : 83,
        "T" : 84,
        "U" : 85,
        "V" : 86,
        "W" : 87,
        "X" : 88,
        "Y" : 89,
        "Z" : 90,
        "WINDOW_KEY" : 91,
        "NUMPAD0" : 96,
        "NUMPAD1" : 97,
        "NUMPAD2" : 98,
        "NUMPAD3" : 99,
        "NUMPAD4" : 100,
        "NUMPAD5" : 101,
        "NUMPAD6" : 102,
        "NUMPAD7" : 103,
        "NUMPAD8" : 104,
        "NUMPAD9" : 105,
        "MULTIPLY" : 106,
        "ADD" : 107,
        "SUBSTRACT" : 109,
        "DECIMAL" : 110,
        "DIVIDE" : 111,
        "F1" : 112,
        "F2" : 113,
        "F3" : 114,
        "F4" : 115,
        "F5" : 116,
        "F6" : 117,
        "F7" : 118,
        "F8" : 119,
        "F9" : 120,
        "F10" : 121,
        "F11" : 122,
        "F12" : 123,
        "NUM_LOCK" : 144,
        "SCROLL_LOCK" : 145,
        "SEMICOLON" : 186,
        "PLUS" : 187,
        "COMMA" : 188,
        "MINUS" : 189,
        "PERIOD" : 190,
        "FORWAND_SLASH" : 191,
        "GRAVE_ACCENT" : 192,
        "OPEN_BRACKET" : 219,
        "BACK_SLASH" : 220,
        "CLOSE_BRACKET" : 221,
        "SINGLE_QUOTE" : 222
    };

    /**
     * return the key press status of the specified action
     * @name isKeyPressed
     * @memberOf me.input
     * @public
     * @function
     * @param {String} action user defined corresponding action
     * @return {Boolean} true if pressed
     * @example
     * if (me.input.isKeyPressed('left'))
     * {
     *    //do something
     * }
     * else if (me.input.isKeyPressed('right'))
     * {
     *    //do something else...
     * }
     *
     */
    obj.isKeyPressed = function (action) {
        if (keyStatus[action] && !keyLocked[action]) {
            if (keyLock[action]) {
                keyLocked[action] = true;
            }
            return true;
        }
        return false;
    };

    /**
     * return the key status of the specified action
     * @name keyStatus
     * @memberOf me.input
     * @public
     * @function
     * @param {String} action user defined corresponding action
     * @return {Boolean} down (true) or up(false)
     */
    obj.keyStatus = function (action) {
        return (keyStatus[action] > 0);
    };


    /**
     * trigger the specified key (simulated) event <br>
     * @name triggerKeyEvent
     * @memberOf me.input
     * @public
     * @function
     * @param {me.input#KEY} keycode
     * @param {Boolean} true to trigger a key press, or false for key release
     * @example
     * // trigger a key press
     * me.input.triggerKeyEvent(me.input.KEY.LEFT, true);
     */

    obj.triggerKeyEvent = function (keycode, status) {
        if (status) {
            obj._keydown({}, keycode);
        }
        else {
            obj._keyup({}, keycode);
        }
    };


    /**
     * associate a user defined action to a keycode
     * @name bindKey
     * @memberOf me.input
     * @public
     * @function
     * @param {me.input#KEY} keycode
     * @param {String} action user defined corresponding action
     * @param {Boolean} [lock=false] cancel the keypress event once read
     * @param {Boolean} [preventDefault=me.input.preventDefault] prevent default browser action
     * @example
     * // enable the keyboard
     * me.input.bindKey(me.input.KEY.LEFT,  "left");
     * me.input.bindKey(me.input.KEY.RIGHT, "right");
     * me.input.bindKey(me.input.KEY.X,     "jump", true);
     * me.input.bindKey(me.input.KEY.F1,    "options", true, true);
     */
    obj.bindKey = function (keycode, action, lock, preventDefault) {
        // make sure the keyboard is enable
        obj._enableKeyboardEvent();

        if (typeof preventDefault !== "boolean") {
            preventDefault = obj.preventDefault;
        }

        obj._KeyBinding[keycode] = action;
        preventDefaultForKeys[keycode] = preventDefault;

        keyStatus[action] = 0;
        keyLock[action] = lock ? lock : false;
        keyLocked[action] = false;
        keyRefs[action] = {};
    };

    /**
     * unlock a key manually
     * @name unlockKey
     * @memberOf me.input
     * @public
     * @function
     * @param {String} action user defined corresponding action
     * @example
     * // Unlock jump when touching the ground
     * if (!this.falling && !this.jumping) {
     * me.input.unlockKey("jump");
     * }
     */
    obj.unlockKey = function (action) {
        keyLocked[action] = false;
    };

    /**
     * unbind the defined keycode
     * @name unbindKey
     * @memberOf me.input
     * @public
     * @function
     * @param {me.input#KEY} keycode
     * @example
     * me.input.unbindKey(me.input.KEY.LEFT);
     */
    obj.unbindKey = function (keycode) {
        // clear the event status
        var keybinding = obj._KeyBinding[keycode];
        keyStatus[keybinding] = 0;
        keyLock[keybinding] = false;
        keyRefs[keybinding] = {};
        // remove the key binding
        obj._KeyBinding[keycode] = null;
        preventDefaultForKeys[keycode] = null;
    };
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, Olivier Biot, Jason Oster
 * http://www.melonjs.org/
 *
 */
(function () {
    /**
     * The built in Event Object
     * @external Event
     * @see {@link https://developer.mozilla.org/en/docs/Web/API/Event|Event}
     */

    /**
     * Event normalized X coordinate within the game canvas itself<br>
     * <img src="images/event_coord.png"/>
     * @memberof! external:Event#
     * @name external:Event#gameX
     * @type {Number}
     */

    /**
     * Event normalized Y coordinate within the game canvas itself<br>
     * <img src="images/event_coord.png"/>
     * @memberof! external:Event#
     * @name external:Event#gameY
     * @type {Number}
     */

    /**
     * Event X coordinate relative to the viewport<br>
     * @memberof! external:Event#
     * @name external:Event#gameScreenX
     * @type {Number}
     */

    /**
     * Event Y coordinate relative to the viewport<br>
     * @memberof! external:Event#
     * @name external:Event#gameScreenY
     * @type {Number}
     */

    /**
     * Event X coordinate relative to the map<br>
     * @memberof! external:Event#
     * @name external:Event#gameWorldX
     * @type {Number}
     */

    /**
     * Event Y coordinate relative to the map<br>
     * @memberof! external:Event#
     * @name external:Event#gameWorldY
     * @type {Number}
     */

    /**
     * The unique identifier of the contact for a touch, mouse or pen <br>
     * (This id is also defined on non Pointer Event Compatible platform like pure mouse or iOS-like touch event)
     * @memberof! external:Event#
     * @name external:Event#pointerId
     * @type {Number}
     * @see http://msdn.microsoft.com/en-us/library/windows/apps/hh466123.aspx
     */

    /*
     * PRIVATE STUFF
     */

    // Reference to base class
    var obj = me.input;

    // list of registered Event handlers
    var evtHandlers = {};

    // some useful flags
    var pointerInitialized = false;

    // to keep track of the supported wheel event
    var wheeltype = "mousewheel";

    // Track last event timestamp to prevent firing events out of order
    var lastTimeStamp = 0;

    // "active" list of supported events
    var activeEventList = null;

    // list of standard pointer event type
    var pointerEventList = [
        "mousewheel",
        "pointermove",
        "pointerdown",
        "pointerup",
        "pointercancel",
        undefined,
        undefined
    ];

    // previous MS prefixed pointer event type
    var MSPointerEventList = [
        "mousewheel",
        "MSPointerMove",
        "MSPointerDown",
        "MSPointerUp",
        "MSPointerCancel",
        undefined,
        undefined
    ];

    // legacy mouse event type
    var mouseEventList = [
        "mousewheel",
        "mousemove",
        "mousedown",
        "mouseup",
        undefined,
        undefined,
        undefined
    ];

    // iOS style touch event type
    var touchEventList = [
        undefined,
        "touchmove",
        "touchstart",
        "touchend",
        "touchcancel",
        undefined,
        undefined
    ];

    // internal constants
    //var MOUSE_WHEEL   = 0;
    var POINTER_MOVE    = 1;
    var POINTER_DOWN    = 2;
    var POINTER_UP      = 3;
    var POINTER_CANCEL  = 4;

    /**
     * cache value for the offset of the canvas position within the page
     * @ignore
     */
    var viewportOffset = new me.Vector2d();

    /**
     * Array of object containing changed touch information (iOS event model)
     * @ignore
     */
    var changedTouches = [];

    /**
     * cache value for the offset of the canvas position within the page
     * @ignore
     */
    obj._offset = null;

    /**
     * addEventListerner for the specified event list and callback
     * @ignore
     */
    function registerEventListener(eventList, callback) {
        for (var x = 2; x < eventList.length; ++x) {
            if (typeof(eventList[x]) !== "undefined") {
                me.video.renderer.getScreenCanvas().addEventListener(eventList[x], callback, false);
            }
        }
    }

    /**
     * enable pointer event (MSPointer/Mouse/Touch)
     * @ignore
     */
    function enablePointerEvent() {
        if (!pointerInitialized) {
            // initialize mouse pos (0,0)
            changedTouches.push({ x: 0, y: 0 });
            obj.mouse.pos = new me.Vector2d(0, 0);
            // get relative canvas position in the page
            obj._offset = me.video.getPos();
            // Automatically update relative canvas position on scroll
            window.addEventListener("scroll", throttle(100, false,
                function (e) {
                    obj._offset = me.video.getPos();
                    me.event.publish(me.event.WINDOW_ONSCROLL, [ e ]);
                }
            ), false);

            // check standard
            if (navigator.pointerEnabled) {
                activeEventList = pointerEventList;
            }
            else if (navigator.msPointerEnabled) { // check for backward compatibility with the 'MS' prefix
                activeEventList = MSPointerEventList;
            }
            else if (me.device.touch) { //  `touch****` events for iOS/Android devices
                activeEventList = touchEventList;
            }
            else { // Regular Mouse events
                activeEventList = mouseEventList;
            }

            registerEventListener(activeEventList, onPointerEvent);

            // detect wheel event support
            // Modern browsers support "wheel", Webkit and IE support at least "mousewheel
            wheeltype = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
            window.addEventListener(wheeltype, onMouseWheel, false);

            // set the PointerMove/touchMove/MouseMove event
            if (typeof(obj.throttlingInterval) === "undefined") {
                // set the default value
                obj.throttlingInterval = ~~(1000 / me.sys.fps);
            }
            // if time interval <= 16, disable the feature
            if (obj.throttlingInterval < 17) {
                me.video.renderer.getScreenCanvas().addEventListener(
                    activeEventList[POINTER_MOVE],
                    onMoveEvent,
                    false
                );
            }
            else {
                me.video.renderer.getScreenCanvas().addEventListener(
                    activeEventList[POINTER_MOVE],
                    throttle(
                        obj.throttlingInterval,
                        false,
                        function (e) {
                            onMoveEvent(e);
                        }
                    ),
                    false
                );
            }
            pointerInitialized = true;
        }
    }

    /**
     * propagate events to registered objects
     * @ignore
     */
    function dispatchEvent(e) {
        var handled = false;
        var handlers = evtHandlers[e.type];

        // Convert touchcancel -> touchend, and pointercancel -> pointerup
        if (!handlers) {
            if (activeEventList.indexOf(e.type) === POINTER_CANCEL) {
                handlers = evtHandlers[activeEventList[POINTER_UP]];
            } else {
                handlers = evtHandlers[e.type];
            }
        }

        if (handlers) {
            // get the current screen to world offset
            me.game.viewport.localToWorld(0, 0, viewportOffset);
            for (var t = 0, l = changedTouches.length; t < l; t++) {
                // Do not fire older events
                if (typeof(e.timeStamp) !== "undefined") {
                    if (e.timeStamp < lastTimeStamp) {
                        continue;
                    }
                    lastTimeStamp = e.timeStamp;
                }

                // if PointerEvent is not supported
                if (!me.device.pointerEnabled) {
                    // -> define pointerId to simulate the PointerEvent standard
                    e.pointerId = changedTouches[t].id;
                }

                /* Initialize the two coordinate space properties. */
                e.gameScreenX = changedTouches[t].x;
                e.gameScreenY = changedTouches[t].y;
                e.gameWorldX = e.gameScreenX + viewportOffset.x;
                e.gameWorldY = e.gameScreenY + viewportOffset.y;

                // parse all handlers
                for (var i = handlers.length, handler; i--, (handler = handlers[i]);) {
                    /* Set gameX and gameY depending on floating. */
                    if (handler.floating === true) {
                        e.gameX = e.gameScreenX;
                        e.gameY = e.gameScreenY;
                    }
                    else {
                        e.gameX = e.gameWorldX;
                        e.gameY = e.gameWorldY;
                    }
                    // call the defined handler
                    if (handler.rect.getBounds().containsPoint(
                            e.gameX,
                            e.gameY
                        )) {
                        // trigger the corresponding callback
                        if (handler.cb(e) === false) {
                            // stop propagating the event if return false
                            handled = true;
                            break;
                        }
                    }
                }
            }
        }
        return handled;
    }

    /**
     * translate event coordinates
     * @ignore
     */
    function updateCoordFromEvent(event) {
        var local;

        // reset the touch array cache
        changedTouches.length = 0;

        // PointerEvent or standard Mouse event
        if (!event.touches) {
            local = obj.globalToLocal(event.clientX, event.clientY);
            local.id =  event.pointerId || 1;
            changedTouches.push(local);
        }
        // iOS/Android like touch event
        else {
            for (var i = 0, l = event.changedTouches.length; i < l; i++) {
                var t = event.changedTouches[i];
                local = obj.globalToLocal(t.clientX, t.clientY);
                local.id = t.identifier;
                changedTouches.push(local);
            }
        }
        // if event.isPrimary is defined and false, return
        if (event.isPrimary === false) {
            return;
        }
        // Else use the first entry to simulate mouse event
        obj.mouse.pos.set(
            changedTouches[0].x,
            changedTouches[0].y
        );
    }


    /**
     * mouse event management (mousewheel)
     * @ignore
     */
    function onMouseWheel(e) {
        /* jshint expr:true */
        if (e.target === me.video.renderer.getScreenCanvas()) {
            // create a (fake) normalized event object
            var _event = {
                deltaMode : 1,
                type : "mousewheel",
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                deltaZ: e.deltaZ
            };
            if (wheeltype === "mousewheel") {
                _event.deltaY = - 1 / 40 * e.wheelDelta;
                // Webkit also support wheelDeltaX
                e.wheelDeltaX && (_event.deltaX = - 1 / 40 * e.wheelDeltaX);
            }
            // dispatch mouse event to registered object
            if (dispatchEvent(_event)) {
                // prevent default action
                return obj._preventDefault(e);
            }
        }
        return true;
    }


    /**
     * mouse/touch/pointer event management (move)
     * @ignore
     */
    function onMoveEvent(e) {
        // update position
        updateCoordFromEvent(e);
        // dispatch mouse event to registered object
        if (dispatchEvent(e)) {
            // prevent default action
            return obj._preventDefault(e);
        }
        return true;
    }

    /**
     * mouse/touch/pointer event management (start/down, end/up)
     * @ignore
     */
    function onPointerEvent(e) {
        // update the pointer position
        updateCoordFromEvent(e);

        // dispatch event to registered objects
        if (dispatchEvent(e)) {
            // prevent default action
            return obj._preventDefault(e);
        }

        // in case of touch event button is undefined
        var button = e.button || 0;
        var keycode = obj.mouse.bind[button];

        // check if mapped to a key
        if (keycode) {
            if (e.type === activeEventList[POINTER_DOWN]) {
                return obj._keydown(e, keycode, button + 1);
            }
            else { // 'mouseup' or 'touchend'
                return obj._keyup(e, keycode, button + 1);
            }
        }

        return true;
    }

    /*
     * PUBLIC STUFF
     */

    /**
     * Mouse information<br>
     * properties : <br>
     * pos (me.Vector2d) : pointer position (in screen coordinates) <br>
     * LEFT : constant for left button <br>
     * MIDDLE : constant for middle button <br>
     * RIGHT : constant for right button <br>
     * @public
     * @enum {Object}
     * @name mouse
     * @memberOf me.input
     */
    obj.mouse = {
        // mouse position
        pos : null,
        // button constants (W3C)
        LEFT:   0,
        MIDDLE: 1,
        RIGHT:  2,
        // bind list for mouse buttons
        bind: [ 0, 0, 0 ]
    };

    /**
     * time interval for event throttling in milliseconds<br>
     * default value : "1000/me.sys.fps" ms<br>
     * set to 0 ms to disable the feature
     * @public
     * @type Number
     * @name throttlingInterval
     * @memberOf me.input
     */
    obj.throttlingInterval = undefined;

    /**
     * Translate the specified x and y values from the global (absolute)
     * coordinate to local (viewport) relative coordinate.
     * @name globalToLocal
     * @memberOf me.input
     * @public
     * @function
     * @param {Number} x the global x coordinate to be translated.
     * @param {Number} y the global y coordinate to be translated.
     * @return {me.Vector2d} A vector object with the corresponding translated coordinates.
     * @example
     * onMouseEvent : function (e) {
     *    // convert the given into local (viewport) relative coordinates
     *    var pos = me.input.globalToLocal(e.clientX, e,clientY);
     *    // do something with pos !
     * };
     */
    obj.globalToLocal = function (x, y) {
        var offset = obj._offset;
        var pixelRatio = me.device.getPixelRatio();
        x -= offset.left;
        y -= offset.top;
        var scale = me.sys.scale;
        if (scale.x !== 1.0 || scale.y !== 1.0) {
            x /= scale.x;
            y /= scale.y;
        }
        return new me.Vector2d(x * pixelRatio, y * pixelRatio);
    };

    /**
     * Associate a pointer event to a keycode<br>
     * Left button – 0
     * Middle button – 1
     * Right button – 2
     * @name bindPointer
     * @memberOf me.input
     * @public
     * @function
     * @param {Number} [button=me.input.mouse.LEFT] (accordingly to W3C values : 0,1,2 for left, middle and right buttons)
     * @param {me.input#KEY} keyCode
     * @example
     * // enable the keyboard
     * me.input.bindKey(me.input.KEY.X, "shoot");
     * // map the left button click on the X key (default if the button is not specified)
     * me.input.bindPointer(me.input.KEY.X);
     * // map the right button click on the X key
     * me.input.bindPointer(me.input.mouse.RIGHT, me.input.KEY.X);
     */
    obj.bindPointer = function () {
        var button = (arguments.length < 2) ? obj.mouse.LEFT : arguments[0];
        var keyCode = (arguments.length < 2) ? arguments[0] : arguments[1];

        // make sure the mouse is initialized
        enablePointerEvent();

        // throw an exception if no action is defined for the specified keycode
        if (!obj._KeyBinding[keyCode]) {
            throw new me.Error("no action defined for keycode " + keyCode);
        }
        // map the mouse button to the keycode
        obj.mouse.bind[button] = keyCode;
    };
    /**
     * unbind the defined keycode
     * @name unbindPointer
     * @memberOf me.input
     * @public
     * @function
     * @param {Number} [button=me.input.mouse.LEFT] (accordingly to W3C values : 0,1,2 for left, middle and right buttons)
     * @example
     * me.input.unbindPointer(me.input.mouse.LEFT);
     */
    obj.unbindPointer = function (button) {
        // clear the event status
        obj.mouse.bind[
            typeof(button) === "undefined" ?
            me.input.mouse.LEFT : button
        ] = null;
    };


    /**
     * allows registration of event listeners on the object target. <br>
     * melonJS defines the additional `gameX` and `gameY` properties when passing the Event object to the defined callback (see below)<br>
     * @see external:Event
     * @see {@link http://www.w3.org/TR/pointerevents/#list-of-pointer-events|W3C Pointer Event list}
     * @name registerPointerEvent
     * @memberOf me.input
     * @public
     * @function
     * @param {String} eventType  The event type for which the object is registering <br>
     * melonJS currently support <b>['pointermove','pointerdown','pointerup','mousewheel']</b>
     * @param {me.Rect} rect object target (or corresponding region defined through me.Rect)
     * @param {Function} callback methods to be called when the event occurs.
     * @param {Boolean} [floating] specify if the object is a floating object
     * (if yes, screen coordinates are used, if not mouse/touch coordinates will
     * be converted to world coordinates)
     * @example
     * // register on the 'pointerdown' event
     * me.input.registerPointerEvent('pointerdown', this, this.pointerDown.bind(this));
     */
    obj.registerPointerEvent = function (eventType, rect, callback, floating) {
        // make sure the mouse/touch events are initialized
        enablePointerEvent();

        if (pointerEventList.indexOf(eventType) === -1) {
            throw new me.Error("invalid event type : " + eventType);
        }

        // convert to supported event type if pointerEvent not natively supported
        if (pointerEventList !== activeEventList) {
            eventType = activeEventList[pointerEventList.indexOf(eventType)];
        }

        // register the event
        if (!evtHandlers[eventType]) {
            evtHandlers[eventType] = [];
        }
        // check if this is a floating object or not
        var _float = rect.floating === true ? true : false;
        // check if there is a given parameter
        if (floating) {
            // ovveride the previous value
            _float = floating === true ? true : false;
        }

        // initialize the handler
        evtHandlers[eventType].push({
            rect : rect,
            cb : callback,
            floating : _float
        });
        return;
    };

    /**
     * allows the removal of event listeners from the object target.
     * @see {@link http://www.w3.org/TR/pointerevents/#list-of-pointer-events|W3C Pointer Event list}
     * @name releasePointerEvent
     * @memberOf me.input
     * @public
     * @function
     * @param {String} eventType  The event type for which the object was registered <br>
     * melonJS currently support <b>['pointermove','pointerdown','pointerup','mousewheel']</b>
     * @param {me.Rect} region object target (or corresponding region defined through me.Rect)
     * @example
     * // release the registered object/region on the 'pointerdown' event
     * me.input.releasePointerEvent('pointerdown', this);
     */
    obj.releasePointerEvent = function (eventType, rect) {
        if (pointerEventList.indexOf(eventType) === -1) {
            throw new me.Error("invalid event type : " + eventType);
        }

        // convert to supported event type if pointerEvent not natively supported
        if (pointerEventList !== activeEventList) {
            eventType = activeEventList[pointerEventList.indexOf(eventType)];
        }

        // unregister the event
        if (!evtHandlers[eventType]) {
            evtHandlers[eventType] = [];
        }
        var handlers = evtHandlers[eventType];
        if (handlers) {
            for (var i = handlers.length, handler; i--, (handler = handlers[i]);) {
                if (handler.rect === rect) {
                    // make sure all references are null
                    handler.rect = handler.cb = handler.floating = null;
                    evtHandlers[eventType].splice(i, 1);
                }
            }
        }
    };

    /**
     * Will translate global (frequently used) pointer events
     * which should be catched at root level, into minipubsub system events
     * @name _translatePointerEvents
     * @memberOf me.input
     * @private
     * @function
     */
    obj._translatePointerEvents = function () {
        // listen to mouse move (and touch move) events on the viewport
        // and convert them to a system event by default
        obj.registerPointerEvent("pointermove", me.game.viewport, function (e) {
            me.event.publish(me.event.MOUSEMOVE, [e]);
            return false;
        });
    };
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * Base64 decoding
     * @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
     * @ignore
     */
    var Base64 = (function () {
        // hold public stuff in our singleton
        var singleton = {};

        // private property
        var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for decoding
        singleton.decode = function (input) {

            // make sure our input string has the right format
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            if (me.device.nativeBase64) {
                // use native decoder
                return window.atob(input);
            }
            else {
                // use cross-browser decoding
                var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

                while (i < input.length) {
                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output.push(String.fromCharCode(chr1));

                    if (enc3 !== 64) {
                        output.push(String.fromCharCode(chr2));
                    }
                    if (enc4 !== 64) {
                        output.push(String.fromCharCode(chr3));
                    }
                }

                output = output.join("");
                return output;
            }
        };

        // public method for encoding
        singleton.encode = function (input) {

            // make sure our input string has the right format
            input = input.replace(/\r\n/g, "\n");

            if (me.device.nativeBase64) {
                // use native encoder
                return window.btoa(input);
            }
            else {
                // use cross-browser encoding
                var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;


                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output.push(_keyStr.charAt(enc1));
                    output.push(_keyStr.charAt(enc2));
                    output.push(_keyStr.charAt(enc3));
                    output.push(_keyStr.charAt(enc4));
                }

                output = output.join("");
                return output;
            }
        };

        return singleton;

    })();

    /**
     * a collection of utility functions<br>
     * there is no constructor function for me.utils
     * @namespace me.utils
     * @memberOf me
     */
    me.utils = (function () {
        // hold public stuff in our singleton
        var api = {};

        /*
         * PRIVATE STUFF
         */

        // guid default value
        var GUID_base  = "";
        var GUID_index = 0;

        // regexp to deal with file name & path
        var removepath = /^.*(\\|\/|\:)/;
        var removeext = /\.[^\.]*$/;

        /*
         * PUBLIC STUFF
         */

        /**
         * Decode a base64 encoded string into a binary string
         * @public
         * @function
         * @memberOf me.utils
         * @name decodeBase64
         * @param {String} input Base64 encoded data
         * @return {String} Binary string
         */
        api.decodeBase64 = function (input) {
            return Base64.decode(input);
        };

        /**
         * Encode binary string into a base64 string
         * @public
         * @function
         * @memberOf me.utils
         * @name encodeBase64
         * @param {String} input Binary string
         * @return {String} Base64 encoded data
         */
        api.encodeBase64 = function (input) {
            return Base64.encode(input);
        };

        /**
         * Decode a base64 encoded string into a byte array
         * @public
         * @function
         * @memberOf me.utils
         * @name decodeBase64AsArray
         * @param {String} input Base64 encoded data
         * @param {Number} [bytes] number of bytes per array entry
         * @return {Number[]} Array of bytes
         */
        api.decodeBase64AsArray = function (input, bytes) {
            bytes = bytes || 1;

            var dec = Base64.decode(input), i, j, len;
            var ar = new Uint32Array(dec.length / bytes);

            for (i = 0, len = dec.length / bytes; i < len; i++) {
                ar[i] = 0;
                for (j = bytes - 1; j >= 0; --j) {
                    ar[i] += dec.charCodeAt((i * bytes) + j) << (j << 3);
                }
            }
            return ar;
        };

        /**
         * decompress zlib/gzip data (NOT IMPLEMENTED)
         * @public
         * @function
         * @memberOf me.utils
         * @name decompress
         * @param  {Number[]} data Array of bytes
         * @param  {String} format compressed data format ("gzip","zlib")
         * @return {Number[]} Array of bytes
         */
        api.decompress = function () {
            throw new me.Error("GZIP/ZLIB compressed TMX Tile Map not supported!");
        };

        /**
         * Decode a CSV encoded array into a binary array
         * @public
         * @function
         * @memberOf me.utils
         * @name decodeCSV
         * @param  {String} input CSV formatted data
         * @param  {Number} limit row split limit
         * @return {Number[]} Int Array
         */
        api.decodeCSV = function (input, limit) {
            input = input.trim().split("\n");

            var result = [];
            for (var i = 0; i < input.length; i++) {
                var entries = input[i].split(",", limit);
                for (var e = 0; e < entries.length; e++) {
                    result.push(+entries[e]);
                }
            }
            return result;
        };

        /**
         * return the base name of the file without path info.<br>
         * @public
         * @function
         * @memberOf me.utils
         * @name getBasename
         * @param  {String} path path containing the filename
         * @return {String} the base name without path information.
         */
        api.getBasename = function (path) {
            return path.replace(removepath, "").replace(removeext, "");
        };

        /**
         * return the extension of the file in the given path <br>
         * @public
         * @function
         * @memberOf me.utils
         * @name getFileExtension
         * @param  {String} path path containing the filename
         * @return {String} filename extension.
         */
        api.getFileExtension = function (path) {
            return path.substring(path.lastIndexOf(".") + 1, path.length);
        };

        /**
         * Get image pixels
         * @public
         * @function
         * @memberOf me.utils
         * @name getPixels
         * @param {Image|Canvas} image Image to read
         * @return {ImageData} Canvas ImageData object
         */
        api.getPixels = function (arg) {
            if (arg instanceof HTMLImageElement) {
                var _context = me.CanvasRenderer.getContext2d(
                    me.video.createCanvas(arg.width, arg.height)
                );
                _context.drawImage(arg, 0, 0);
                return _context.getImageData(0, 0, arg.width, arg.height);
            }
            else {
                // canvas !
                return arg.getContext("2d").getImageData(0, 0, arg.width, arg.height);
            }
        };

        /**
         * reset the GUID Base Name
         * the idea here being to have a unique ID
         * per level / object
         * @ignore
         */
        api.resetGUID = function (base) {
            // also ensure it's only 8bit ASCII characters
            GUID_base  = base.toString().toUpperCase().toHex();
            GUID_index = 0;
        };

        /**
         * create and return a very simple GUID
         * Game Unique ID
         * @ignore
         */
        api.createGUID = function () {
            return GUID_base + "-" + (GUID_index++);
        };

        /**
         * apply friction to a force
         * @ignore
         * @TODO Move this somewhere else
         */
        api.applyFriction = function (v, f) {
            return (
                (v + f < 0) ? v + (f * me.timer.tick) :
                (v - f > 0) ? v - (f * me.timer.tick) : 0
            );
        };

        // return our object
        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier Biot, Jason Oster
 * http://www.melonjs.org
 */
(function () {
    var cssToRGB = {
        // CSS1
        "black"                 : [   0,   0,   0 ],
        "silver"                : [ 192, 192, 129 ],
        "gray"                  : [ 128, 128, 128 ],
        "white"                 : [ 255, 255, 255 ],
        "maroon"                : [ 128,   0,   0 ],
        "red"                   : [ 255,   0,   0 ],
        "purple"                : [ 128,   0, 128 ],
        "fuchsia"               : [ 255,   0, 255 ],
        "green"                 : [   0, 128,   0 ],
        "lime"                  : [   0, 255,   0 ],
        "olive"                 : [ 128, 128,   0 ],
        "yellow"                : [ 255, 255,   0 ],
        "navy"                  : [   0,   0, 128 ],
        "blue"                  : [   0,   0, 255 ],
        "teal"                  : [   0, 128, 128 ],
        "aqua"                  : [   0, 255, 255 ],

        // CSS2
        "orange"                : [ 255, 165,   0 ],

        // CSS3
        "aliceblue"             : [ 240, 248, 245 ],
        "antiquewhite"          : [ 250, 235, 215 ],
        "aquamarine"            : [ 127, 255, 212 ],
        "azure"                 : [ 240, 255, 255 ],
        "beige"                 : [ 245, 245, 220 ],
        "bisque"                : [ 255, 228, 196 ],
        "blanchedalmond"        : [ 255, 235, 205 ],
        "blueviolet"            : [ 138,  43, 226 ],
        "brown"                 : [ 165,  42,  42 ],
        "burlywood"             : [ 222, 184,  35 ],
        "cadetblue"             : [  95, 158, 160 ],
        "chartreuse"            : [ 127, 255,   0 ],
        "chocolate"             : [ 210, 105,  30 ],
        "coral"                 : [ 255, 127,  80 ],
        "cornflowerblue"        : [ 100, 149, 237 ],
        "cornsilk"              : [ 255, 248, 220 ],
        "crimson"               : [ 220,  20,  60 ],
        "darkblue"              : [   0,   0, 139 ],
        "darkcyan"              : [   0, 139, 139 ],
        "darkgoldenrod"         : [ 184, 134,  11 ],
        "darkgray[*]"           : [ 169, 169, 169 ],
        "darkgreen"             : [   0, 100,   0 ],
        "darkgrey[*]"           : [ 169, 169, 169 ],
        "darkkhaki"             : [ 189, 183, 107 ],
        "darkmagenta"           : [ 139,   0, 139 ],
        "darkolivegreen"        : [  85, 107,  47 ],
        "darkorange"            : [ 255, 140,   0 ],
        "darkorchid"            : [ 153,  50, 204 ],
        "darkred"               : [ 139,   0,   0 ],
        "darksalmon"            : [ 233, 150, 122 ],
        "darkseagreen"          : [ 143, 188, 143 ],
        "darkslateblue"         : [  72,  61, 139 ],
        "darkslategray"         : [  47,  79,  79 ],
        "darkslategrey"         : [  47,  79,  79 ],
        "darkturquoise"         : [   0, 206, 209 ],
        "darkviolet"            : [ 148,   0, 211 ],
        "deeppink"              : [ 255,  20, 147 ],
        "deepskyblue"           : [   0, 191, 255 ],
        "dimgray"               : [ 105, 105, 105 ],
        "dimgrey"               : [ 105, 105, 105 ],
        "dodgerblue"            : [  30, 144, 255 ],
        "firebrick"             : [ 178,  34,  34 ],
        "floralwhite"           : [ 255, 250, 240 ],
        "forestgreen"           : [  34, 139,  34 ],
        "gainsboro"             : [ 220, 220, 220 ],
        "ghostwhite"            : [ 248, 248, 255 ],
        "gold"                  : [ 255, 215,   0 ],
        "goldenrod"             : [ 218, 165,  32 ],
        "greenyellow"           : [ 173, 255,  47 ],
        "grey"                  : [ 128, 128, 128 ],
        "honeydew"              : [ 240, 255, 240 ],
        "hotpink"               : [ 255, 105, 180 ],
        "indianred"             : [ 205,  92,  92 ],
        "indigo"                : [  75,   0, 130 ],
        "ivory"                 : [ 255, 255, 240 ],
        "khaki"                 : [ 240, 230, 140 ],
        "lavender"              : [ 230, 230, 250 ],
        "lavenderblush"         : [ 255, 240, 245 ],
        "lawngreen"             : [ 124, 252,   0 ],
        "lemonchiffon"          : [ 255, 250, 205 ],
        "lightblue"             : [ 173, 216, 230 ],
        "lightcoral"            : [ 240, 128, 128 ],
        "lightcyan"             : [ 224, 255, 255 ],
        "lightgoldenrodyellow"  : [ 250, 250, 210 ],
        "lightgray"             : [ 211, 211, 211 ],
        "lightgreen"            : [ 144, 238, 144 ],
        "lightgrey"             : [ 211, 211, 211 ],
        "lightpink"             : [ 255, 182, 193 ],
        "lightsalmon"           : [ 255, 160, 122 ],
        "lightseagreen"         : [  32, 178, 170 ],
        "lightskyblue"          : [ 135, 206, 250 ],
        "lightslategray"        : [ 119, 136, 153 ],
        "lightslategrey"        : [ 119, 136, 153 ],
        "lightsteelblue"        : [ 176, 196, 222 ],
        "lightyellow"           : [ 255, 255, 224 ],
        "limegreen"             : [  50, 205,  50 ],
        "linen"                 : [ 250, 240, 230 ],
        "mediumaquamarine"      : [ 102, 205, 170 ],
        "mediumblue"            : [   0,   0, 205 ],
        "mediumorchid"          : [ 186,  85, 211 ],
        "mediumpurple"          : [ 147, 112, 219 ],
        "mediumseagreen"        : [  60, 179, 113 ],
        "mediumslateblue"       : [ 123, 104, 238 ],
        "mediumspringgreen"     : [   0, 250, 154 ],
        "mediumturquoise"       : [  72, 209, 204 ],
        "mediumvioletred"       : [ 199,  21, 133 ],
        "midnightblue"          : [  25,  25, 112 ],
        "mintcream"             : [ 245, 255, 250 ],
        "mistyrose"             : [ 255, 228, 225 ],
        "moccasin"              : [ 255, 228, 181 ],
        "navajowhite"           : [ 255, 222, 173 ],
        "oldlace"               : [ 253, 245, 230 ],
        "olivedrab"             : [ 107, 142,  35 ],
        "orangered"             : [ 255,  69,   0 ],
        "orchid"                : [ 218, 112, 214 ],
        "palegoldenrod"         : [ 238, 232, 170 ],
        "palegreen"             : [ 152, 251, 152 ],
        "paleturquoise"         : [ 175, 238, 238 ],
        "palevioletred"         : [ 219, 112, 147 ],
        "papayawhip"            : [ 255, 239, 213 ],
        "peachpuff"             : [ 255, 218, 185 ],
        "peru"                  : [ 205, 133,  63 ],
        "pink"                  : [ 255, 192, 203 ],
        "plum"                  : [ 221, 160, 221 ],
        "powderblue"            : [ 176, 224, 230 ],
        "rosybrown"             : [ 188, 143, 143 ],
        "royalblue"             : [  65, 105, 225 ],
        "saddlebrown"           : [ 139,  69,  19 ],
        "salmon"                : [ 250, 128, 114 ],
        "sandybrown"            : [ 244, 164,  96 ],
        "seagreen"              : [  46, 139,  87 ],
        "seashell"              : [ 255, 245, 238 ],
        "sienna"                : [ 160,  82,  45 ],
        "skyblue"               : [ 135, 206, 235 ],
        "slateblue"             : [ 106,  90, 205 ],
        "slategray"             : [ 112, 128, 144 ],
        "slategrey"             : [ 112, 128, 144 ],
        "snow"                  : [ 255, 250, 250 ],
        "springgreen"           : [   0, 255, 127 ],
        "steelblue"             : [  70, 130, 180 ],
        "tan"                   : [ 210, 180, 140 ],
        "thistle"               : [ 216, 191, 216 ],
        "tomato"                : [ 255,  99,  71 ],
        "turquoise"             : [  64, 224, 208 ],
        "violet"                : [ 238, 130, 238 ],
        "wheat"                 : [ 245, 222, 179 ],
        "whitesmoke"            : [ 245, 245, 245 ],
        "yellowgreen"           : [ 154, 205,  50 ]
    };

    /**
     * A color manipulation object.
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     * @param {Number} [r=0] red component
     * @param {Number} [g=0] green component
     * @param {Number} [b=0] blue component
     * @param {Number} [a=1.0] alpha value
     */
    me.Color = Object.extend(
    /** @scope me.Color.prototype */
    {

        /** @ignore */
        init : function (r, g, b, a) {
            /**
             * Color Red Component
             * @name r
             * @memberOf me.Color
             * @type {Number}
             * @readonly
             */
            this.r = 0;

            /**
             * Color Green Component
             * @name g
             * @memberOf me.Color
             * @type {Number}
             * @readonly
             */
            this.g = 0;

            /**
             * Color Blue Component
             * @name b
             * @memberOf me.Color
             * @type {Number}
             * @readonly
             */
            this.b = 0;

            /**
             * Color Alpha Component
             * @name alpha
             * @memberOf me.Color
             * @type {Number}
             * @readonly
             */
            this.alpha = 1.0;

            /**
             * Color components in a Float32Array suitable for WebGL
             * @name glArray
             * @memberOf me.Color
             * @type {Float32Array[]}
             * @readonly
             */
            this.glArray = new Float32Array([ 0.0, 0.0, 0.0, 1.0 ]);

            return this.setColor(r, g, b, a);
        },

        /**
         * @ignore
         */
        onResetEvent : function (r, g, b, a) {
            return this.setColor(r, g, b, a);
        },

        /**
         * Set this color to the specified value.
         * @name setColor
         * @memberOf me.Color
         * @function
         * @param {Number} r red component
         * @param {Number} g green component
         * @param {Number} b blue component
         * @param {Number} [a=1.0] alpha value
         * @return {me.Color} Reference to this object for method chaining
         */
        setColor : function (r, g, b, a) {
            this.r = (~~r || 0).clamp(0, 255);
            this.g = (~~g || 0).clamp(0, 255);
            this.b = (~~b || 0).clamp(0, 255);
            this.alpha = typeof(a) === "undefined" ? 1.0 : (+a).clamp(0, 1);

            this.glArray[0] = this.r / 255.0;
            this.glArray[1] = this.g / 255.0;
            this.glArray[2] = this.b / 255.0;
            this.glArray[3] = this.alpha;

            return this;
        },

        /**
         * Create a new copy of this color object.
         * @name clone
         * @memberOf me.Color
         * @function
         * @return {me.Color} Reference to the newly cloned object
         */
        clone : function () {
            return me.pool.pull("me.Color", this.r, this.g, this.b, this.alpha);
        },

        /**
         * Copy a color object or CSS color into this one.
         * @name copy
         * @memberOf me.Color
         * @function
         * @param {me.Color|String} color
         * @return {me.Color} Reference to this object for method chaining
         */
        copy : function (color) {
            return (
                (color instanceof me.Color) ?
                this.setColor(color.r, color.g, color.b, color.alpha) :
                this.parseCSS(color)
            );
        },

        /**
         * Blend this color with the given one using addition.
         * @name add
         * @memberOf me.Color
         * @function
         * @param {me.Color} color
         * @return {me.Color} Reference to this object for method chaining
         */
        add : function (color) {
            return this.setColor(
                this.r + color.r,
                this.g + color.g,
                this.b + color.b,
                (this.alpha + color.alpha) / 2
            );
        },

        /**
         * Darken this color value by 0..1
         * @name darken
         * @memberOf me.Color
         * @function
         * @param {Number} scale
         * @return {me.Color} Reference to this object for method chaining
         */
        darken : function (scale) {
            scale = scale.clamp(0, 1);
            return this.setColor(
                this.r * scale,
                this.g * scale,
                this.b * scale,
                this.alpha
            );
        },

        /**
         * Lighten this color value by 0..1
         * @name lighten
         * @memberOf me.Color
         * @function
         * @param {Number} scale
         * @return {me.Color} Reference to this object for method chaining
         */
        lighten : function (scale) {
            scale = scale.clamp(0, 1);
            return this.setColor(
                this.r + (255 - this.r) * scale,
                this.g + (255 - this.g) * scale,
                this.b + (255 - this.b) * scale,
                this.alpha
            );
        },

        /**
         * Generate random r,g,b values for this color object
         * @name random
         * @memberOf me.Color
         * @function
         * @return {me.Color} Reference to this object for method chaining
         */
        random : function () {
            return this.setColor(
                Math.random() * 256,
                Math.random() * 256,
                Math.random() * 256,
                this.alpha
            );
        },

        /**
         * Return true if the r,g,b,a values of this color are equal with the
         * given one.
         * @name equals
         * @memberOf me.Color
         * @function
         * @param {me.Color} color
         * @return {Boolean}
         */
        equals : function (color) {
            return (
                (this.r === color.r) &&
                (this.g === color.g) &&
                (this.b === color.b) &&
                (this.alpha === color.alpha)
            );
        },

        /**
         * Parse a CSS color string and set this color to the corresponding
         * r,g,b values
         * @name parseCSS
         * @memberOf me.Color
         * @function
         * @param {String} color
         * @return {me.Color} Reference to this object for method chaining
         */
        parseCSS : function (cssColor) {
            // TODO : Memoize this function by caching its input

            if (!(cssColor in cssToRGB)) {
                return this.parseRGB(cssColor);
            }

            return this.setColor.apply(this, cssToRGB[cssColor]);
        },

        /**
         * Parse an RGB or RGBA CSS color string
         * @name parseRGB
         * @memberOf me.Color
         * @function
         * @param {String} color
         * @return {me.Color} Reference to this object for method chaining
         */
        parseRGB : function (rgbColor) {
            // TODO : Memoize this function by caching its input
            if (typeof(rgbColor) === "string") {
                var start;
                if (rgbColor.substring(0, 4) === "rgba") {
                    start = 5;
                }
                else if (rgbColor.substring(0, 3) === "rgb") {
                    start = 4;
                }
                else {
                    return this.parseHex(rgbColor);
                }

                var color = rgbColor.slice(start, -1).split(/\s*,\s*/);
                return this.setColor.apply(this, color);

            } else {
                throw new me.Color.Error(
                    "invalid parameter (not a string)"
                );
            }
        },

        /**
         * Parse a Hex color ("#RGB" or "#RRGGBB" format) and set this color to
         * the corresponding r,g,b values
         * @name parseHex
         * @memberOf me.Color
         * @function
         * @param {String} color
         * @return {me.Color} Reference to this object for method chaining
         */
        parseHex : function (hexColor) {
            // TODO : Memoize this function by caching its input

            if (typeof(hexColor) === "string") {
                // Remove the # if present
                if (hexColor.charAt(0) === "#") {
                    hexColor = hexColor.substring(1, hexColor.length);
                }

                var r, g, b;

                if (hexColor.length < 6)  {
                    // 3 char shortcut is used, double each char
                    r = parseInt(hexColor.charAt(0) + hexColor.charAt(0), 16);
                    g = parseInt(hexColor.charAt(1) + hexColor.charAt(1), 16);
                    b = parseInt(hexColor.charAt(2) + hexColor.charAt(2), 16);
                }
                else {
                    r = parseInt(hexColor.substring(0, 2), 16);
                    g = parseInt(hexColor.substring(2, 4), 16);
                    b = parseInt(hexColor.substring(4, 6), 16);
                }

                return this.setColor(r, g, b);

            } else {
                throw new me.Color.Error(
                    "invalid parameter (not a string)"
                );
            }
        },

        /**
         * Returns the private glArray
         * @ignore
         */
        toGL : function () {
            return this.glArray;
        },

        /**
         * Get the color in "#RRGGBB" format
         * @name toHex
         * @memberOf me.Color
         * @function
         * @return {String}
         */
        toHex : function () {
            // TODO : Memoize this function by caching its result until any of
            // the r,g,b,a values are changed

            return "#" + this.r.toHex() + this.g.toHex() + this.b.toHex();
        },

        /**
         * Get the color in "rgb(R,G,B)" format
         * @name toRGB
         * @memberOf me.Color
         * @function
         * @return {String}
         */
        toRGB : function () {
            // TODO : Memoize this function by caching its result until any of
            // the r,g,b,a values are changed

            return "rgb(" +
                this.r + "," +
                this.g + "," +
                this.b +
            ")";
        },

        /**
         * Get the color in "rgba(R,G,B,A)" format
         * @name toRGBA
         * @memberOf me.Color
         * @function
         * @return {String}
         */
        toRGBA : function () {
            // TODO : Memoize this function by caching its result until any of
            // the r,g,b,a values are changed

            return "rgba(" +
                this.r + "," +
                this.g + "," +
                this.b + "," +
                this.alpha +
            ")";
        }
    });

    /**
     * Base class for me.Color exception handling.
     * @name Error
     * @class
     * @memberOf me.Vector2d
     * @constructor
     * @param {String} msg Error message.
     */
    me.Color.Error = me.Error.extend({
        init : function (msg) {
            me.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Color.Error";
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013 melonJS
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * A singleton object to access the device localStorage area
     * @example
     * // Initialize "score" and "lives" with default values
     * me.save.add({ score : 0, lives : 3 });
     *
     * // Save score
     * me.save.score = 31337;
     *
     * // Load lives
     * console.log(me.save.lives);
     *
     * // Also supports complex objects thanks to JSON backend
     * me.save.complexObject = { a : "b", c : [ 1, 2, 3, "d" ], e : { f : [{}] } };
     * // DO NOT set any child properties of me.save.complexObject directly!
     * // Changes made that way will not save. Always set the entire object value at once.
     *
     * // Print all
     * console.log(JSON.stringify(me.save));
     *
     * // Remove "score" from localStorage
     * me.save.remove('score');
     * @namespace me.save
     * @memberOf me
     */
    me.save = (function () {
        // Variable to hold the object data
        var data = {};

        // a function to check if the given key is a reserved word
        function isReserved(key) {
            return (key === "add" || key === "remove");
        }

        // Public API
        var api = {
            /**
             * @ignore
             */
            _init: function () {
                // Load previous data if local Storage is supported
                if (me.device.localStorage === true) {
                    var keys = JSON.parse(localStorage.getItem("me.save")) || [];
                    keys.forEach(function (key) {
                        data[key] = JSON.parse(localStorage.getItem("me.save." + key));
                    });
                }
            },

            /**
             * Add new keys to localStorage and set them to the given default values if they do not exist
             * @name add
             * @memberOf me.save
             * @function
             * @param {Object} props key and corresponding values
             * @example
             * // Initialize "score" and "lives" with default values
             * me.save.add({ score : 0, lives : 3 });
             */
            add : function (props) {
                Object.keys(props).forEach(function (key) {
                    if (isReserved(key)) {
                        return;
                    }

                    (function (prop) {
                        Object.defineProperty(api, prop, {
                            configurable : true,
                            enumerable : true,
                            get : function () {
                                return data[prop];
                            },
                            set : function (value) {
                                data[prop] = value;
                                if (me.device.localStorage === true) {
                                    localStorage.setItem("me.save." + prop, JSON.stringify(value));
                                }
                            }
                        });
                    })(key);

                    // Set default value for key
                    if (!(key in data)) {
                        api[key] = props[key];
                    }
                });

                // Save keys
                if (me.device.localStorage === true) {
                    localStorage.setItem("me.save", JSON.stringify(Object.keys(data)));
                }
            },

            /**
             * Remove a key from localStorage
             * @name remove
             * @memberOf me.save
             * @function
             * @param {String} key key to be removed
             * @example
             * // Remove the "score" key from localStorage
             * me.save.remove("score");
             */
            remove : function (key) {
                if (!isReserved(key)) {
                    if (typeof data[key] !== "undefined") {
                        delete data[key];
                        if (me.device.localStorage === true) {
                            localStorage.removeItem("me.save." + key);
                            localStorage.setItem("me.save", JSON.stringify(Object.keys(data)));
                        }
                    }
                }
            }
        };

        return api;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Tile QT 0.7.x format
 * http://www.mapeditor.org/
 *
 */
(function () {
    me.TMXConstants = {
        // some custom constants
        COLLISION_GROUP             : "collision",
        // some TMX constants
        TMX_TAG_MAP                 : "map",
        TMX_TAG_NAME                : "name",
        TMX_TAG_VALUE               : "value",
        TMX_TAG_VERSION             : "version",
        TMX_TAG_ORIENTATION         : "orientation",
        TMX_TAG_WIDTH               : "width",
        TMX_TAG_HEIGHT              : "height",
        TMX_TAG_TYPE                : "type",
        TMX_TAG_OPACITY             : "opacity",
        TMX_TAG_TRANS               : "trans",
        TMX_TAG_TILEWIDTH           : "tilewidth",
        TMX_TAG_TILEHEIGHT          : "tileheight",
        TMX_TAG_TILEOFFSET          : "tileoffset",
        TMX_TAG_FIRSTGID            : "firstgid",
        TMX_TAG_GID                 : "gid",
        TMX_TAG_TILE                : "tile",
        TMX_TAG_ID                  : "id",
        TMX_TAG_DATA                : "data",
        TMX_TAG_COMPRESSION         : "compression",
        TMX_TAG_GZIP                : "gzip",
        TMX_TAG_ZLIB                : "zlib",
        TMX_TAG_ENCODING            : "encoding",
        TMX_TAG_ATTR_BASE64         : "base64",
        TMX_TAG_CSV                 : "csv",
        TMX_TAG_SPACING             : "spacing",
        TMX_TAG_MARGIN              : "margin",
        TMX_TAG_PROPERTIES          : "properties",
        TMX_TAG_PROPERTY            : "property",
        TMX_TAG_IMAGE               : "image",
        TMX_TAG_SOURCE              : "source",
        TMX_TAG_VISIBLE             : "visible",
        TMX_TAG_TILESET             : "tileset",
        TMX_TAG_LAYER               : "layer",
        TMX_TAG_TILE_LAYER          : "tilelayer",
        TMX_TAG_IMAGE_LAYER         : "imagelayer",
        TMX_TAG_OBJECTGROUP         : "objectgroup",
        TMX_TAG_OBJECT              : "object",
        TMX_TAG_X                   : "x",
        TMX_TAG_Y                   : "y",
        TMX_TAG_POLYGON             : "polygon",
        TMX_TAG_POLYLINE            : "polyline",
        TMX_TAG_ELLIPSE             : "ellipse",
        TMX_TAG_POINTS              : "points",
        TMX_BACKGROUND_COLOR        : "backgroundcolor",
        TMX_ROTATION                : "rotation"
    };
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Tile QT 0.7.x format
 * http://www.mapeditor.org/
 *
 */
(function (TMXConstants) {
    /**
     * a collection of TMX utility Function
     * @final
     * @memberOf me
     * @ignore
     */
    me.TMXUtils = (function () {
        /*
         * PUBLIC
         */

        // hold public stuff in our singleton
        var api = {};

        /**
         * set and interpret a TMX property value
         * @ignore
         */
        function setTMXValue(value) {
            if (!value || value.isBoolean()) {
                // if value not defined or boolean
                value = value ? (value === "true") : true;
            }
            else if (value.isNumeric()) {
                // check if numeric
                value = Number(value);
            }
            else if (value.match(/^json:/i)) {
                // try to parse it
                var match = value.split(/^json:/i)[1];
                try {
                    value = JSON.parse(match);
                }
                catch (e) {
                    throw new me.Error("Unable to parse JSON: " + match);
                }
            }
            // return the interpreted value
            return value;
        }

        var parseAttributes = function (obj, elt) {
            // do attributes
            if (elt.attributes && elt.attributes.length > 0) {
                for (var j = 0; j < elt.attributes.length; j++) {
                    var attribute = elt.attributes.item(j);
                    if (typeof(attribute.name) !== "undefined") {
                        // DOM4 (Attr no longer inherit from Node)
                        obj[attribute.name] = setTMXValue(attribute.value);
                    } else {
                        // else use the deprecated ones
                        obj[attribute.nodeName] = setTMXValue(attribute.nodeValue);
                    }
                }
            }
        };

        /**
         * Parse a XML TMX object and returns the corresponding javascript object
         * @ignore
         */
        api.parse = function (xml, draworder) {
            // Create the return object
            var obj = {};

            // temporary cache value for concatenated #text element
            var cacheValue = "";

            // make sure draworder is defined
            // note: `draworder` is a new object property in next coming version of Tiled
            draworder = draworder || 1;

            if (xml.nodeType === 1) {
                // do attributes
                parseAttributes(obj, xml);
            }

            // do children
            if (xml.hasChildNodes()) {
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    var nodeName = item.nodeName;

                    if (typeof(obj[nodeName]) === "undefined") {
                        if (item.nodeType === 3) {
                            /* nodeType is "Text"  */
                            var value = item.nodeValue.trim();
                            if (value && value.length > 0) {
                                cacheValue += value;
                            }
                        }
                        else if (item.nodeType === 1) {
                            /* nodeType is "Element" */
                            obj[nodeName] =  me.TMXUtils.parse(item, draworder);
                            obj[nodeName]._draworder = draworder++;
                        }
                    }
                    else {
                        if (Array.isArray(obj[nodeName]) === false) {
                            obj[nodeName] = [obj[nodeName]];
                        }
                        obj[nodeName].push(me.TMXUtils.parse(item, draworder));
                        obj[nodeName][obj[nodeName].length - 1]._draworder = draworder++;
                    }
                }
                // set concatenated string value
                // cheap hack that will only probably work with the TMX format
                if (cacheValue.length > 0) {
                    obj.value = cacheValue;
                    cacheValue = "";
                }
            }
            return obj;
        };

        /**
         * Apply TMX Properties to the given object
         * @ignore
         */
        api.applyTMXProperties = function (obj, data) {
            var properties = data[TMXConstants.TMX_TAG_PROPERTIES];
            if (typeof(properties) !== "undefined") {
                if (typeof(properties.property) !== "undefined") {
                    // XML converted format
                    var property = properties.property;
                    if (Array.isArray(property) === true) {
                        property.forEach(function (prop) {
                            // value are already converted in this case
                            obj[prop.name] = prop.value;
                        });
                    }
                    else {
                        // value are already converted in this case
                        obj[property.name] = property.value;
                    }
                }
                else {
                    // native json format
                    for (var name in properties) {
                        if (properties.hasOwnProperty(name)) {
                            // set the value
                            obj[name] = setTMXValue(properties[name]);
                        }
                    }
                }
            }
        };

        // return our object
        return api;
    })();
})(me.TMXConstants);

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Tile QT 0.7.x format
 * http://www.mapeditor.org/
 *
 */
(function (TMXConstants) {

    /**
     * TMX Object Group <br>
     * contains the object group definition as defined in Tiled. <br>
     * note : object group definition is translated into the virtual `me.game.world` using `me.Container`.
     * @see me.Container
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     */
    me.TMXObjectGroup = Object.extend({
        init : function (name, tmxObjGroup, orientation, tilesets, z) {
            /**
             * group name
             * @public
             * @type String
             * @name name
             * @memberOf me.TMXObjectGroup
             */
            this.name = name;

            /**
             * group width
             * @public
             * @type Number
             * @name width
             * @memberOf me.TMXObjectGroup
             */
            this.width = tmxObjGroup[TMXConstants.TMX_TAG_WIDTH];

            /**
             * group height
             * @public
             * @type Number
             * @name height
             * @memberOf me.TMXObjectGroup
             */
            this.height = tmxObjGroup[TMXConstants.TMX_TAG_HEIGHT];

            /**
             * group z order
             * @public
             * @type Number
             * @name z
             * @memberOf me.TMXObjectGroup
             */
            this.z = z;

            /**
             * group objects list definition
             * @see me.TMXObject
             * @public
             * @type Array
             * @name name
             * @memberOf me.TMXObjectGroup
             */
            this.objects = [];

            var visible = typeof(tmxObjGroup[TMXConstants.TMX_TAG_VISIBLE]) !== "undefined" ? tmxObjGroup[TMXConstants.TMX_TAG_VISIBLE] : true;

            this.opacity = (visible === true) ? (+tmxObjGroup[TMXConstants.TMX_TAG_OPACITY] || 1.0).clamp(0.0, 1.0) : 0;

            // check if we have any user-defined properties
            me.TMXUtils.applyTMXProperties(this, tmxObjGroup);

            // parse all objects
            // (under `objects` for XML converted map, under `object` for native json map)
            var _objects = tmxObjGroup.objects || tmxObjGroup.object;
            var self = this;
            if (Array.isArray(_objects) === true) {
                // JSON native format
                _objects.forEach(function (tmxObj) {
                    self.objects.push(new me.TMXObject(tmxObj, orientation, tilesets, z));
                });
            }
            else if (_objects) {
                self.objects.push(new me.TMXObject(_objects, orientation, tilesets, z));
            }
        },

        /**
         * reset function
         * @ignore
         * @function
         */

        destroy : function () {
            // clear all allocated objects
            this.objects = null;
        },

        /**
         * return the object count
         * @ignore
         * @function
         */
        getObjectCount : function () {
            return this.objects.length;
        },

        /**
         * returns the object at the specified index
         * @ignore
         * @function
         */
        getObjectByIndex : function (idx) {
            return this.objects[idx];
        }
    });

    /**
     * a TMX Object defintion, as defined in Tiled. <br>
     * note : object definition are translated into the virtual `me.game.world` using `me.Entity`.
     * @see me.Entity
     * @class
     * @extends Object
     * @memberOf me
     * @constructor
     */
    me.TMXObject = Object.extend({
        init :  function (tmxObj, orientation, tilesets, z) {

            /**
             * object point list (for Polygon and PolyLine)
             * @public
             * @type Vector2d[]
             * @name points
             * @memberOf me.TMXObject
             */
            this.points = undefined;

            /**
             * object name
             * @public
             * @type String
             * @name name
             * @memberOf me.TMXObject
             */
            this.name = tmxObj[TMXConstants.TMX_TAG_NAME];

            /**
             * object x position
             * @public
             * @type Number
             * @name x
             * @memberOf me.TMXObject
             */
            this.x = +tmxObj[TMXConstants.TMX_TAG_X];

            /**
             * object y position
             * @public
             * @type Number
             * @name y
             * @memberOf me.TMXObject
             */
            this.y = +tmxObj[TMXConstants.TMX_TAG_Y];

            /**
             * object z order
             * @public
             * @type Number
             * @name z
             * @memberOf me.TMXObject
             */
            this.z = +z;

            /**
             * object width
             * @public
             * @type Number
             * @name width
             * @memberOf me.TMXObject
             */
            this.width = +tmxObj[TMXConstants.TMX_TAG_WIDTH] || 0;

            /**
             * object height
             * @public
             * @type Number
             * @name height
             * @memberOf me.TMXObject
             */
            this.height = +tmxObj[TMXConstants.TMX_TAG_HEIGHT] || 0;

            /**
             * object gid value
             * when defined the object is a tiled object
             * @public
             * @type Number
             * @name gid
             * @memberOf me.TMXObject
             */
            this.gid = +tmxObj[TMXConstants.TMX_TAG_GID] || null;

            /**
             * object type
             * @public
             * @type String
             * @name type
             * @memberOf me.TMXObject
             */
            this.type = tmxObj[TMXConstants.TMX_TAG_TYPE];

            /**
             * The rotation of the object in radians clockwise (defaults to 0)
             * @public
             * @type Number
             * @name rotation
             * @memberOf me.TMXObject
             */
            this.rotation = Number.prototype.degToRad(+(tmxObj[TMXConstants.TMX_ROTATION] || 0));

            /**
             * object orientation (orthogonal or isometric)
             * @public
             * @type String
             * @name orientation
             * @memberOf me.TMXObject
             */
            this.orientation = orientation;

            /*
             * if true, the object is an Ellipse
             * @public
             * @type Boolean
             * @name isEllipse
             * @memberOf me.TMXObject
             */
            this.isEllipse = false;

            /**
             * if true, the object is a Polygon
             * @public
             * @type Boolean
             * @name isPolygon
             * @memberOf me.TMXObject
             */
            this.isPolygon = false;
            /**
             * if true, the object is a PolyLine
             * @public
             * @type Boolean
             * @name isPolyLine
             * @memberOf me.TMXObject
             */
            this.isPolyLine = false;

            // check if the object has an associated gid
            if (typeof this.gid === "number") {
                this.setImage(this.gid, tilesets);
            }
            else {
                if (typeof(tmxObj[TMXConstants.TMX_TAG_ELLIPSE]) !== "undefined") {
                    this.isEllipse = true;
                }
                else {
                    var points = tmxObj[TMXConstants.TMX_TAG_POLYGON];
                    if (typeof(points) !== "undefined") {
                        this.isPolygon = true;
                    }
                    else {
                        points = tmxObj[TMXConstants.TMX_TAG_POLYLINE];
                        if (typeof(points) !== "undefined") {
                            this.isPolyLine = true;
                        }
                    }
                    if (typeof(points) !== "undefined") {
                        this.points = [];
                        if (typeof(points.points) !== "undefined") {
                            // get a point array
                            points = points.points.split(" ");
                            // and normalize them into an array of vectors
                            for (var i = 0, v; i < points.length; i++) {
                                v = points[i].split(",");
                                this.points.push(new me.Vector2d(+v[0], +v[1]));
                            }
                        }
                        else {
                            // already an object (native json format)
                            var self = this;
                            points.forEach(function (point) {
                                self.points.push(new me.Vector2d(+point.x, +point.y));
                            });
                        }
                    }
                }
            }

            // Adjust the Position to match Tiled
            me.game.tmxRenderer.adjustPosition(this);

            // set the object properties
            me.TMXUtils.applyTMXProperties(this, tmxObj);
        },

        /**
         * set the object image (for Tiled Object)
         * @ignore
         * @function
         */
        setImage : function (gid, tilesets) {
            // get the corresponding tileset
            var tileset = tilesets.getTilesetByGid(this.gid);

            // set width and height equal to tile size
            this.width = tileset.tilewidth;
            this.height = tileset.tileheight;

            // force spritewidth size
            this.spritewidth = this.width;

            // the object corresponding tile

            var tmxTile = new me.Tile(this.x, this.y, tileset.tilewidth, tileset.tileheight, this.gid);

            // get the corresponding tile into our object
            this.image = tileset.getTileImage(tmxTile);

            // set a generic name if not defined
            if (typeof (this.name) === "undefined") {
                this.name = "TileObject";
            }
        },

        /**
         * return a list of shapes for a TMX object
         * @name getTMXShapes
         * @memberOf me.TMXObject
         * @private
         * @function
         * @return {me.Polygon[]|me.Line[]|me.Ellipse[]} a list of shape objects
         */
        getTMXShapes : function () {
            var i = 0;
            var shapes = [];

            // add an ellipse shape
            if (this.isEllipse === true) {
                // ellipse coordinates are the center position, so set default to the corresonding radius
                shapes.push((new me.Ellipse(
                    this.width / 2,
                    this.height / 2,
                    this.width,
                    this.height
                )).rotate(this.rotation));
            }

            // add a polygon
            else if (this.isPolygon === true) {
                shapes.push((new me.Polygon(0, 0, this.points)).rotate(this.rotation));
            }

            // add a polyline
            else if (this.isPolyLine === true) {
                var p = this.points;
                var p1, p2;
                var segments = p.length - 1;
                for (i = 0; i < segments; i++) {
                    // clone the value before, as [i + 1]
                    // is reused later by the next segment
                    p1 = p[i];
                    p2 = p[i + 1].clone();
                    if (this.rotation !== 0) {
                        p1 = p1.rotate(this.rotation);
                        p2 = p2.rotate(this.rotation);
                    }
                    shapes.push(new me.Line(0, 0, [ p1, p2 ]));
                }
            }

            // it's a rectangle, returns a polygon object anyway
            else {
                shapes.push((new me.Polygon(
                    0, 0, [
                        new me.Vector2d(), new me.Vector2d(this.width, 0),
                        new me.Vector2d(this.width, this.height), new me.Vector2d(0, this.height)
                    ]
                )).rotate(this.rotation));
            }

            // Apply isometric projection
            if (this.orientation === "isometric") {
                for (i = 0; i < shapes.length; i++) {
                    shapes[i].rotate(Math.PI / 4).scale(Math.SQRT2, Math.SQRT1_2);
                }
            }

            return shapes;
        },
        /**
         * getObjectPropertyByName
         * @ignore
         * @function
         */
        getObjectPropertyByName : function (name) {
            return this[name];
        }
    });
})(me.TMXConstants);

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Tile QT 0.7.x format
 * http://www.mapeditor.org/
 *
 */
(function (TMXConstants) {
    /*
     * Tileset Management
     */

    // bitmask constants to check for flipped & rotated tiles
    var FlippedHorizontallyFlag    = 0x80000000;
    var FlippedVerticallyFlag      = 0x40000000;
    var FlippedAntiDiagonallyFlag  = 0x20000000;

    /**
     * a basic tile object
     * @class
     * @extends me.Rect
     * @memberOf me
     * @constructor
     * @param {Number} x x index of the Tile in the map
     * @param {Number} y y index of the Tile in the map
     * @param {Number} w Tile width
     * @param {Number} h Tile height
     * @param {Number} tileId tileId
     */
    me.Tile = me.Rect.extend({
        /** @ignore */
        init : function (x, y, w, h, gid) {
            /**
             * tileset
             * @public
             * @type me.TMXTileset
             * @name me.Tile#tileset
             */
            this.tileset = null;

            /**
             * the tile transformation matrix (if defined)
             * @ignore
             */
            this.transform = null;
            me.Rect.prototype.init.apply(this, [x * w, y * h, w, h]);

            // Tile col / row pos
            this.col = x;
            this.row = y;

            /**
             * tileId
             * @public
             * @type int
             * @name me.Tile#tileId
             */
            this.tileId = gid;
            /**
             * True if the tile is flipped horizontally<br>
             * @public
             * @type Boolean
             * @name me.Tile#flipX
             */
            this.flippedX  = (this.tileId & FlippedHorizontallyFlag) !== 0;
            /**
             * True if the tile is flipped vertically<br>
             * @public
             * @type Boolean
             * @name me.Tile#flippedY
             */
            this.flippedY  = (this.tileId & FlippedVerticallyFlag) !== 0;
            /**
             * True if the tile is flipped anti-diagonally<br>
             * @public
             * @type Boolean
             * @name me.Tile#flippedAD
             */
            this.flippedAD = (this.tileId & FlippedAntiDiagonallyFlag) !== 0;

            /**
             * Global flag that indicates if the tile is flipped<br>
             * @public
             * @type Boolean
             * @name me.Tile#flipped
             */
            this.flipped = this.flippedX || this.flippedY || this.flippedAD;
            // create a transformation matrix if required
            if (this.flipped === true) {
                this.createTransform();
            }

            // clear out the flags and set the tileId
            this.tileId &= ~(FlippedHorizontallyFlag | FlippedVerticallyFlag | FlippedAntiDiagonallyFlag);
        },

        /**
         * create a transformation matrix for this tilee
         * @ignore
         */
        createTransform : function () {
            if (this.transform === null) {
                this.transform = new me.Matrix2d();
            }
            // reset the matrix (in case it was already defined)
            this.transform.identity();
            var a = this.transform.val;
            if (this.flippedAD) {
                // Use shearing to swap the X/Y axis
                this.transform.set(0, 1, 1, 0, a[4], a[5]);
                this.transform.translate(0, this.height - this.width);
            }
            if (this.flippedX) {

                a[0] *= -1;
                a[2] *= -1;
                this.transform.translate((this.flippedAD ? this.height : this.width), 0);

            }
            if (this.flippedY) {
                a[1] *= -1;
                a[3] *= -1;
                this.transform.translate(0, (this.flippedAD ? this.width : this.height));
            }
        }
    });

    /**
     * a TMX Tile Set Object
     * @class
     * @memberOf me
     * @constructor
     */
    me.TMXTileset = Object.extend({
        // constructor
        init: function (tileset) {
            var i = 0;
            // first gid

            // tile properties (collidable, etc..)
            this.TileProperties = [];

            // a cache for offset value
            this.tileXOffset = [];
            this.tileYOffset = [];
            this.firstgid = this.lastgid = +tileset[TMXConstants.TMX_TAG_FIRSTGID];
            var src = tileset[TMXConstants.TMX_TAG_SOURCE];
            if (src && me.utils.getFileExtension(src).toLowerCase() === "tsx") {
                // load TSX
                src = me.utils.getBasename(src);
                // replace tileset with a local variable
                tileset = me.loader.getTMX(src).tileset;

                if (!tileset) {
                    throw new me.Error(src + " TSX tileset not found");
                }
                // normally tileset shoudld directly contains the required
                //information : UNTESTED as I did not find how to generate a JSON TSX file
            }

            this.name = tileset[TMXConstants.TMX_TAG_NAME];
            this.tilewidth = +tileset[TMXConstants.TMX_TAG_TILEWIDTH];
            this.tileheight = +tileset[TMXConstants.TMX_TAG_TILEHEIGHT];
            this.spacing = +tileset[TMXConstants.TMX_TAG_SPACING] || 0;
            this.margin = +tileset[TMXConstants.TMX_TAG_MARGIN] || 0;

            // set tile offset properties (if any)
            this.tileoffset = new me.Vector2d(0, 0);

            /**
             * Tileset contains animated tiles
             * @public
             * @type Boolean
             * @name me.TMXTileset#isAnimated
             */
            this.isAnimated = false;

            /**
             * Tileset animations
             * @private
             * @type Object
             * @name me.TMXTileset#animations
             */
            this.animations = {};

            var tiles = tileset.tiles;
            if (typeof(tiles) !== "undefined") {
                // native JSON format
                for (i in tiles) {
                    if (tiles.hasOwnProperty(i) && ("animation" in tiles[i])) {
                        this.isAnimated = true;
                        this.animations[+i + this.firstgid] = {
                            dt      : 0,
                            idx     : 0,
                            frames  : tiles[i].animation,
                            cur     : tiles[i].animation[0]
                        };
                    }
                }
            }

            var offset = tileset[TMXConstants.TMX_TAG_TILEOFFSET];
            if (offset) {
                this.tileoffset.x = +offset[TMXConstants.TMX_TAG_X];
                this.tileoffset.y = +offset[TMXConstants.TMX_TAG_Y];
            }

            // set tile properties, if any
            var tileInfo = tileset.tileproperties;

            if (tileInfo) {
                // native JSON format
                for (i in tileInfo) {
                    if (tileInfo.hasOwnProperty(i)) {
                        this.setTileProperty(i + this.firstgid, tileInfo[i]);
                    }
                }
            }
            else if (tileset[TMXConstants.TMX_TAG_TILE]) {
                // converted XML format
                tileInfo = tileset[TMXConstants.TMX_TAG_TILE];
                if (!Array.isArray(tileInfo)) {
                    tileInfo = [ tileInfo ];
                }

                // iterate it
                for (i = 0; i < tileInfo.length; i++) {
                    var tileID = +tileInfo[i][TMXConstants.TMX_TAG_ID] + this.firstgid;
                    var prop = {};
                    me.TMXUtils.applyTMXProperties(prop, tileInfo[i]);
                    //apply tiled defined properties
                    this.setTileProperty(tileID, prop);

                    // Get animations
                    if ("animation" in tileInfo[i]) {
                        this.isAnimated = true;
                        this.animations[tileID] = {
                            dt      : 0,
                            idx     : 0,
                            frames  : tileInfo[i].animation.frame,
                            cur     : tileInfo[i].animation.frame[0]
                        };
                    }
                }
            }

            // check for the texture corresponding image
            // manage inconstency between XML and JSON format
            var imagesrc = (
                typeof(tileset[TMXConstants.TMX_TAG_IMAGE]) === "string" ?
                tileset[TMXConstants.TMX_TAG_IMAGE] : tileset[TMXConstants.TMX_TAG_IMAGE].source
            );
            // extract base name
            imagesrc = me.utils.getBasename(imagesrc);
            this.image = imagesrc ? me.loader.getImage(imagesrc) : null;

            if (!this.image) {
                console.log("melonJS: '" + imagesrc + "' file for tileset '" + this.name + "' not found!");
            }
            else {
                // number of tiles per horizontal line
                this.hTileCount = ~~((this.image.width - this.margin) / (this.tilewidth + this.spacing));
                this.vTileCount = ~~((this.image.height - this.margin) / (this.tileheight + this.spacing));
                // compute the last gid value in the tileset
                this.lastgid = this.firstgid + (((this.hTileCount * this.vTileCount) - 1) || 0);

                // check if transparency is defined for a specific color
                var transparency = tileset[TMXConstants.TMX_TAG_TRANS] || tileset[TMXConstants.TMX_TAG_IMAGE][TMXConstants.TMX_TAG_TRANS];
                // set Color Key for transparency if needed
                if (typeof(transparency) !== "undefined") {
                    // applyRGB Filter (return a context object)
                    this.image = me.video.renderer.applyRGBFilter(this.image, "transparent", transparency.toUpperCase()).canvas;
                }
            }
        },

        /**
         * set the tile properties
         * @ignore
         * @function
         */
        setTileProperty : function (gid, prop) {
            // set the given tile id
            this.TileProperties[gid] = prop;
        },

        /**
         * return true if the gid belongs to the tileset
         * @name me.TMXTileset#contains
         * @public
         * @function
         * @param {Number} gid
         * @return {Boolean}
         */
        contains : function (gid) {
            return gid >= this.firstgid && gid <= this.lastgid;
        },

        //return an Image Object with the specified tile
        getTileImage : function (tmxTile) {
            // create a new image object
            var _context = me.CanvasRenderer.getContext2d(
                    me.video.createCanvas(this.tilewidth, this.tileheight)
            );
            this.drawTile(_context, 0, 0, tmxTile);
            return _context.canvas;
        },

        // e.g. getTileProperty (gid)
        /**
         * return the properties of the specified tile
         * @name me.TMXTileset#getTileProperties
         * @public
         * @function
         * @param {Number} tileId
         * @return {Object}
         */
        getTileProperties: function (tileId) {
            return this.TileProperties[tileId];
        },

        /**
         * return the x offset of the specified tile in the tileset image
         * @ignore
         */
        getTileOffsetX : function (tileId) {
            var offset = this.tileXOffset[tileId];
            if (typeof(offset) === "undefined") {
                offset = this.tileXOffset[tileId] = this.margin + (this.spacing + this.tilewidth)  * (tileId % this.hTileCount);
            }
            return offset;
        },

        /**
         * return the y offset of the specified tile in the tileset image
         * @ignore
         */
        getTileOffsetY : function (tileId) {
            var offset = this.tileYOffset[tileId];
            if (typeof(offset) === "undefined") {
                offset = this.tileYOffset[tileId] = this.margin + (this.spacing + this.tileheight)  * ~~(tileId / this.hTileCount);
            }
            return offset;
        },

        // update tile animations
        update : function (dt) {
            var anim = null,
                duration = 0,
                result = false;

            for (var i in this.animations) {
                if (this.animations.hasOwnProperty(i)) {
                    anim = this.animations[i];

                    anim.dt += dt;
                    duration = anim.cur.duration;
                    if (anim.dt >= duration) {
                        anim.dt -= duration;
                        anim.idx = (anim.idx + 1) % anim.frames.length;
                        anim.cur = anim.frames[anim.idx];
                        result = true;
                    }
                }
            }

            return result;
        },

        // draw the x,y tile
        drawTile : function (renderer, dx, dy, tmxTile) {
            var tileid = tmxTile.tileId;

            // check if any transformation is required
            if (tmxTile.flipped) {
                renderer.save();
                // apply the tile current transform
                var a = tmxTile.transform.val;

                renderer.transform(
                    a[0], a[1],
                    a[2], a[3],
                    a[4] + dx, a[5] + dy
                );
                // reset both values as managed through transform();
                dx = dy = 0;
            }

            // apply animations
            if (tileid in this.animations) {
                tileid = this.animations[tileid].cur.tileid;
            }
            else {
                // get the local tileset id
                tileid -= this.firstgid;
            }

            // draw the tile
            renderer.drawImage(
                this.image,
                this.getTileOffsetX(tileid), this.getTileOffsetY(tileid),
                this.tilewidth, this.tileheight,
                dx, dy,
                this.tilewidth, this.tileheight
            );

            if (tmxTile.flipped)  {
                // restore the context to the previous state
                renderer.restore();
            }
        }
    });

    /**
     * an object containing all tileset
     * @class
     * @memberOf me
     * @constructor
     */
    me.TMXTilesetGroup = Object.extend({
        // constructor
        init: function () {
            this.tilesets = [];
        },

        //add a tileset to the tileset group
        add : function (tileset) {
            this.tilesets.push(tileset);
        },

        //return the tileset at the specified index
        getTilesetByIndex : function (i) {
            return this.tilesets[i];
        },

        /**
         * return the tileset corresponding to the specified id <br>
         * will throw an exception if no matching tileset is found
         * @name me.TMXTilesetGroup#getTilesetByGid
         * @public
         * @function
         * @param {Number} gid
         * @return {me.TMXTileset} corresponding tileset
         */
        getTilesetByGid : function (gid) {
            var invalidRange = -1;
            // cycle through all tilesets
            for (var i = 0, len = this.tilesets.length; i < len; i++) {
                // return the corresponding tileset if matching
                if (this.tilesets[i].contains(gid)) {
                    return this.tilesets[i];
                }
                // typically indicates a layer with no asset loaded (collision?)
                if (this.tilesets[i].firstgid === this.tilesets[i].lastgid &&
                    gid >= this.tilesets[i].firstgid) {
                    // store the id if the [firstgid .. lastgid] is invalid
                    invalidRange = i;
                }
            }
            // return the tileset with the invalid range
            if (invalidRange !== -1) {
                return this.tilesets[invalidRange];
            }
            else {
                throw new me.Error("no matching tileset found for gid " + gid);
            }
        }
    });
})(me.TMXConstants);

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Tile QT 0.7.x format
 * http://www.mapeditor.org/
 *
 */
(function () {
    /**
     * an Orthogonal Map Renderder
     * Tiled QT 0.7.x format
     * @memberOf me
     * @ignore
     * @constructor
     */
    me.TMXOrthogonalRenderer = Object.extend({
        // constructor
        init: function (cols, rows, tilewidth, tileheight) {
            this.cols = cols;
            this.rows = rows;
            this.tilewidth = tilewidth;
            this.tileheight = tileheight;
        },

        /**
         * return true if the renderer can render the specified layer
         * @ignore
         */
        canRender : function (layer) {
            return ((layer.orientation === "orthogonal") &&
                    (this.cols === layer.cols) &&
                    (this.rows === layer.rows) &&
                    (this.tilewidth === layer.tilewidth) &&
                    (this.tileheight === layer.tileheight));
        },

        /**
         * return the tile position corresponding to the specified pixel
         * @ignore
         */
        pixelToTileCoords : function (x, y) {
            return new me.Vector2d(this.pixelToTileX(x),
                                   this.pixelToTileY(y));
        },


        /**
         * return the tile position corresponding for the given X coordinate
         * @ignore
         */
        pixelToTileX : function (x) {
            return x / this.tilewidth;
        },


        /**
         * return the tile position corresponding for the given Y coordinates
         * @ignore
         */
        pixelToTileY : function (y) {
            return y / this.tileheight;
        },

        /**
         * return the pixel position corresponding of the specified tile
         * @ignore
         */
        tileToPixelCoords : function (x, y) {
            return new me.Vector2d(x * this.tilewidth,
                                   y * this.tileheight);
        },

        /**
         * fix the position of Objects to match
         * the way Tiled places them
         * @ignore
         */
        adjustPosition: function (obj) {
            // only adjust position if obj.gid is defined
            if (typeof(obj.gid) === "number") {
                 // Tiled objects origin point is "bottom-left" in Tiled,
                 // "top-left" in melonJS)
                obj.y -= obj.height;
            }
        },

        /**
         * draw the tile map
         * @ignore
         */
        drawTile : function (renderer, x, y, tmxTile, tileset) {
            // draw the tile
            tileset.drawTile(renderer,
                             tileset.tileoffset.x + x * this.tilewidth,
                             tileset.tileoffset.y + (y + 1) * this.tileheight - tileset.tileheight,
                             tmxTile);
        },

        /**
         * draw the tile map
         * @ignore
         */
        drawTileLayer : function (renderer, layer, rect) {
            // get top-left and bottom-right tile position
            var start = this.pixelToTileCoords(rect.pos.x,
                                               rect.pos.y).floorSelf();

            var end = this.pixelToTileCoords(rect.pos.x + rect.width + this.tilewidth,
                                             rect.pos.y + rect.height + this.tileheight).ceilSelf();

            //ensure we are in the valid tile range
            end.x = end.x > this.cols ? this.cols : end.x;
            end.y = end.y > this.rows ? this.rows : end.y;

            // main drawing loop
            for (var y = start.y; y < end.y; y++) {
                for (var x = start.x; x < end.x; x++) {
                    var tmxTile = layer.layerData[x][y];
                    if (tmxTile) {
                        this.drawTile(renderer, x, y, tmxTile, tmxTile.tileset);
                    }
                }
            }
        }
    });

    /**
     * an Isometric Map Renderder
     * Tiled QT 0.7.x format
     * @memberOf me
     * @ignore
     * @constructor
     */
    me.TMXIsometricRenderer = Object.extend({
        // constructor
        init: function (cols, rows, tilewidth, tileheight) {
            this.cols = cols;
            this.rows = rows;
            this.tilewidth = tilewidth;
            this.tileheight = tileheight;
            this.hTilewidth = tilewidth / 2;
            this.hTileheight = tileheight / 2;
            this.originX = this.rows * this.hTilewidth;
        },

        /**
         * return true if the renderer can render the specified layer
         * @ignore
         */
        canRender : function (layer) {
            return (
                (layer.orientation === "isometric") &&
                (this.cols === layer.cols) &&
                (this.rows === layer.rows) &&
                (this.tilewidth === layer.tilewidth) &&
                (this.tileheight === layer.tileheight)
            );
        },

        /**
         * return the tile position corresponding to the specified pixel
         * @ignore
         */
        pixelToTileCoords : function (x, y) {
            return new me.Vector2d(this.pixelToTileX(x, y),
                                   this.pixelToTileY(y, x));
        },


        /**
         * return the tile position corresponding for the given X coordinate
         * @ignore
         */
        pixelToTileX : function (x, y) {
            return (y / this.tileheight) + ((x - this.originX) / this.tilewidth);
        },


        /**
         * return the tile position corresponding for the given Y coordinates
         * @ignore
         */
        pixelToTileY : function (y, x) {
            return (y / this.tileheight) - ((x - this.originX) / this.tilewidth);
        },

        /**
         * return the pixel position corresponding of the specified tile
         * @ignore
         */
        tileToPixelCoords : function (x, y) {
            return new me.Vector2d(
                (x - y) * this.hTilewidth + this.originX,
                (x + y) * this.hTileheight
            );
        },

        /**
         * fix the position of Objects to match
         * the way Tiled places them
         * @ignore
         */
        adjustPosition: function (obj) {
            var tilex = obj.x / this.hTilewidth;
            var tiley = obj.y / this.tileheight;
            var isoPos = this.tileToPixelCoords(tilex, tiley);

            obj.x = isoPos.x;
            obj.y = isoPos.y;
        },

        /**
         * draw the tile map
         * @ignore
         */
        drawTile : function (renderer, x, y, tmxTile, tileset) {
            // draw the tile
            tileset.drawTile(
                renderer,
                ((this.cols - 1) * tileset.tilewidth + (x - y) * tileset.tilewidth >> 1),
                (-tileset.tilewidth + (x + y) * tileset.tileheight >> 2),
                tmxTile
            );
        },

        /**
         * draw the tile map
         * @ignore
         */
        drawTileLayer : function (renderer, layer, rect) {

            // cache a couple of useful references
            var tileset = layer.tileset;
            var offset  = tileset.tileoffset;

            // get top-left and bottom-right tile position
            var rowItr = this.pixelToTileCoords(
                rect.pos.x - tileset.tilewidth,
                rect.pos.y - tileset.tileheight
            ).floorSelf();
            var TileEnd = this.pixelToTileCoords(
                rect.pos.x + rect.width + tileset.tilewidth,
                rect.pos.y + rect.height + tileset.tileheight
            ).ceilSelf();

            var rectEnd = this.tileToPixelCoords(TileEnd.x, TileEnd.y);

            // Determine the tile and pixel coordinates to start at
            var startPos = this.tileToPixelCoords(rowItr.x, rowItr.y);
            startPos.x -= this.hTilewidth;
            startPos.y += this.tileheight;

            /* Determine in which half of the tile the top-left corner of the area we
             * need to draw is. If we're in the upper half, we need to start one row
             * up due to those tiles being visible as well. How we go up one row
             * depends on whether we're in the left or right half of the tile.
             */
            var inUpperHalf = startPos.y - rect.pos.y > this.hTileheight;
            var inLeftHalf  = rect.pos.x - startPos.x < this.hTilewidth;

            if (inUpperHalf) {
                if (inLeftHalf) {
                    rowItr.x--;
                    startPos.x -= this.hTilewidth;
                }
                else {
                    rowItr.y--;
                    startPos.x += this.hTilewidth;
                }
                startPos.y -= this.hTileheight;
            }


             // Determine whether the current row is shifted half a tile to the right
            var shifted = inUpperHalf ^ inLeftHalf;

            // initialize the columItr vector
            var columnItr = rowItr.clone();

            // main drawing loop
            for (var y = startPos.y; y - this.tileheight < rectEnd.y; y += this.hTileheight) {
                columnItr.setV(rowItr);
                for (var x = startPos.x; x < rectEnd.x; x += this.tilewidth) {
                    //check if it's valid tile, if so render
                    if ((columnItr.x >= 0) && (columnItr.y >= 0) && (columnItr.x < this.cols) && (columnItr.y < this.rows)) {
                        var tmxTile = layer.layerData[columnItr.x][columnItr.y];
                        if (tmxTile) {
                            tileset = tmxTile.tileset;
                            // offset could be different per tileset
                            offset  = tileset.tileoffset;
                            // draw our tile
                            tileset.drawTile(renderer, offset.x + x, offset.y + y - tileset.tileheight, tmxTile);
                        }
                    }
                    // Advance to the next column
                    columnItr.x++;
                    columnItr.y--;
                }

                // Advance to the next row
                if (!shifted) {
                    rowItr.x++;
                    startPos.x += this.hTilewidth;
                    shifted = true;
                }
                else {
                    rowItr.y++;
                    startPos.x -= this.hTilewidth;
                    shifted = false;
                }
            }
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function (TMXConstants) {
    /**
     * a generic Color Layer Object
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {String}  name    layer name
     * @param {String}  color   a CSS color value
     * @param {Number}  z       z position
     */
    me.ColorLayer = me.Renderable.extend({
        // constructor
        init: function (name, color, z) {
            // parent constructor
            me.Renderable.prototype.init.apply(this, [0, 0, Infinity, Infinity]);

            // apply given parameters
            this.name = name;
            this.color = color;
            this.z = z;
            this.floating = true;
        },

        /**
         * draw the color layer
         * @ignore
         */
        draw : function (renderer, rect) {
            // set layer opacity
            var _alpha = renderer.globalAlpha();
            renderer.setGlobalAlpha(_alpha * this.getOpacity());

            var vpos = me.game.viewport.pos;
            var color = renderer.getColor();
            renderer.setColor(this.color);
            renderer.fillRect(
                rect.left - vpos.x, rect.top - vpos.y,
                rect.width, rect.height
            );
            renderer.setColor(color);
            // restore context alpha value
            renderer.setGlobalAlpha(_alpha);
        }
    });

    /**
     * a generic Image Layer Object
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {String} name        layer name
     * @param {Number} width       layer width in pixels
     * @param {Number} height      layer height in pixels
     * @param {String} image       image name (as defined in the asset list)
     * @param {Number} z           z position
     * @param {me.Vector2d}  [ratio=1.0]   scrolling ratio to be applied
     */

    me.ImageLayer = me.Renderable.extend({
        /**
         * Define if and how an Image Layer should be repeated.<br>
         * By default, an Image Layer is repeated both vertically and horizontally.<br>
         * Property values : <br>
         * * 'repeat' - The background image will be repeated both vertically and horizontally. (default) <br>
         * * 'repeat-x' - The background image will be repeated only horizontally.<br>
         * * 'repeat-y' - The background image will be repeated only vertically.<br>
         * * 'no-repeat' - The background-image will not be repeated.<br>
         * @public
         * @type String
         * @name me.ImageLayer#repeat
         */
        //repeat: 'repeat', (define through getter/setter

        /**
         * Define the image scrolling ratio<br>
         * Scrolling speed is defined by multiplying the viewport delta position (e.g. followed entity) by the specified ratio<br>
         * Default value : (1.0, 1.0) <br>
         * To specify a value through Tiled, use one of the following format : <br>
         * - a number, to change the value for both axis <br>
         * - a json expression like `json:{"x":0.5,"y":0.5}` if you wish to specify a different value for both x and y
         * @public
         * @type me.Vector2d
         * @name me.ImageLayer#ratio
         */
        //ratio: new me.Vector2d(1.0, 1.0),

        /**
         * constructor
         * @ignore
         * @function
         */
        init: function (name, width, height, imagesrc, z, ratio) {
            // layer name
            this.name = name;

            // get the corresponding image (throw an exception if not found)
            this.image = (imagesrc) ? me.loader.getImage(me.utils.getBasename(imagesrc)) : null;
            if (!this.image) {
                throw new me.Error("'" + imagesrc + "' file for Image Layer '" + this.name + "' not found!");
            }

            this.imagewidth = this.image.width;
            this.imageheight = this.image.height;

            // a cached reference to the viewport
            var viewport = me.game.viewport;

            // set layer width & height
            width  = (width  ? Math.min(viewport.width, width)   : viewport.width);
            height = (height ? Math.min(viewport.height, height) : viewport.height);
            me.Renderable.prototype.init.apply(this, [0, 0, width, height]);

            // displaying order
            this.z = z;

            // default ratio for parallax
            this.ratio = new me.Vector2d(1.0, 1.0);

            if (typeof(ratio) !== "undefined") {
                // little hack for backward compatiblity
                if (typeof(ratio) === "number") {
                    this.ratio.set(ratio, ratio);
                } else /* vector */ {
                    this.ratio.setV(ratio);
                }
            }

            // last position of the viewport
            this.lastpos = viewport.pos.clone();

            // Image Layer is considered as a floating object
            this.floating = true;

            // default value for repeat
            this._repeat = "repeat";

            this.repeatX = true;
            this.repeatY = true;

            Object.defineProperty(this, "repeat", {
                get : function get() {
                    return this._repeat;
                },
                set : function set(val) {
                    this._repeat = val;
                    switch (this._repeat) {
                        case "no-repeat" :
                            this.repeatX = false;
                            this.repeatY = false;
                            break;
                        case "repeat-x" :
                            this.repeatX = true;
                            this.repeatY = false;
                            break;
                        case "repeat-y" :
                            this.repeatX = false;
                            this.repeatY = true;
                            break;
                        default : // "repeat"
                            this.repeatX = true;
                            this.repeatY = true;
                            break;
                    }
                }
            });

            // default origin position
            this.anchorPoint.set(0, 0);

            // register to the viewport change notification
            this.handle = me.event.subscribe(me.event.VIEWPORT_ONCHANGE, this.updateLayer.bind(this));
        },

        /**
         * updateLayer function
         * @ignore
         * @function
         */
        updateLayer : function (vpos) {
            if (0 === this.ratio.x && 0 === this.ratio.y) {
                // static image
                return;
            }
            else if (this.repeatX || this.repeatY) {
                // parallax / scrolling image
                this.pos.x += ((vpos.x - this.lastpos.x) * this.ratio.x) % this.imagewidth;
                this.pos.x = (this.imagewidth + this.pos.x) % this.imagewidth;

                this.pos.y += ((vpos.y - this.lastpos.y) * this.ratio.y) % this.imageheight;
                this.pos.y = (this.imageheight + this.pos.y) % this.imageheight;
            }
            else {
                this.pos.x += (vpos.x - this.lastpos.x) * this.ratio.x;
                this.pos.y += (vpos.y - this.lastpos.y) * this.ratio.y;
            }
            this.lastpos.setV(vpos);
        },

        /**
         * draw the image layer
         * @ignore
         */
        draw : function (renderer, rect) {
            // translate default position using the anchorPoint value
            var viewport = me.game.viewport;
            var shouldTranslate = this.anchorPoint.y !== 0 || this.anchorPoint.x !== 0;
            var translateX = ~~(this.anchorPoint.x * (viewport.width - this.imagewidth));
            var translateY = ~~(this.anchorPoint.y * (viewport.height - this.imageheight));

            if (shouldTranslate) {
                renderer.translate(translateX, translateY);
            }

            // set the layer alpha value
            renderer.setGlobalAlpha(renderer.globalAlpha() * this.getOpacity());

            var sw, sh;

            // if not scrolling ratio define, static image
            if (0 === this.ratio.x && 0 === this.ratio.y) {
                // static image
                sw = Math.min(rect.width, this.imagewidth);
                sh = Math.min(rect.height, this.imageheight);

                renderer.drawImage(
                    this.image,
                    rect.left, rect.top,    // sx, sy
                    sw, sh,                 // sw, sh
                    rect.left, rect.top,    // dx, dy
                    sw, sh                  // dw, dh
                );
            }
            // parallax / scrolling image
            else {
                var sx = ~~this.pos.x;
                var sy = ~~this.pos.y;

                var dx = 0;
                var dy = 0;

                sw = Math.min(this.imagewidth  - sx, this.width);
                sh = Math.min(this.imageheight - sy, this.height);

                do {
                    do {
                        renderer.drawImage(
                            this.image,
                            sx, sy, // sx, sy
                            sw, sh,
                            dx, dy, // dx, dy
                            sw, sh
                        );

                        sy = 0;
                        dy += sh;
                        sh = Math.min(this.imageheight, this.height - dy);

                    } while (this.repeatY && (dy < this.height));
                    dx += sw;
                    if (!this.repeatX || (dx >= this.width)) {
                        // done ("end" of the viewport)
                        break;
                    }
                    // else update required var for next iteration
                    sx = 0;
                    sw = Math.min(this.imagewidth, this.width - dx);
                    sy = ~~this.pos.y;
                    dy = 0;
                    sh = Math.min(this.imageheight - ~~this.pos.y, this.height);
                } while (true);
            }

            if (shouldTranslate) {
                renderer.translate(-translateX, -translateY);
            }
        },

        // called when the layer is destroyed
        destroy : function () {
            // cancel the event subscription
            if (this.handle)  {
                me.event.unsubscribe(this.handle);
                this.handle = null;
            }
            // clear all allocated objects
            this.image = null;
            this.lastpos = null;
        }
    });

    /**
     * a TMX Tile Layer Object
     * Tiled QT 0.7.x format
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {Number} tilewidth width of each tile in pixels
     * @param {Number} tileheight height of each tile in pixels
     * @param {String} orientation "isometric" or "orthogonal"
     * @param {me.TMXTilesetGroup} tilesets tileset as defined in Tiled
     * @param {Number} zOrder layer z-order
     */
    me.TMXLayer = me.Renderable.extend({

        /** @ignore */
        init: function (tilewidth, tileheight, orientation, tilesets, zOrder) {
            // super constructor
            me.Renderable.prototype.init.apply(this, [0, 0, 0, 0]);

            // tile width & height
            this.tilewidth  = tilewidth;
            this.tileheight = tileheight;

            // layer orientation
            this.orientation = orientation;

            /**
             * The Layer corresponding Tilesets
             * @public
             * @type me.TMXTilesetGroup
             * @name me.TMXLayer#tilesets
             */
            this.tilesets = tilesets;

            // the default tileset
            this.tileset = (this.tilesets ? this.tilesets.getTilesetByIndex(0) : null);

            /**
             * All animated tilesets in this layer
             * @public
             * @type Array
             * @name me.TMXLayer#animatedTilesets
             */
            this.animatedTilesets = [];
            if (this.tilesets) {
                var tileset = this.tilesets.tilesets;
                for (var i = 0; i < tileset.length; i++) {
                    if (tileset[i].isAnimated) {
                        tileset[i].isAnimated = false;
                        this.animatedTilesets.push(tileset[i]);
                    }
                }
            }

            /**
             * Layer contains tileset animations
             * @public
             * @type Boolean
             * @name me.TMXLayer#isAnimated
             */
            this.isAnimated = this.animatedTilesets.length > 0;

            // Force pre-render off when tileset animation is used
            if (this.isAnimated) {
                this.preRender = false;
            }

            // for displaying order
            this.z = zOrder;
        },

        /** @ignore */
        initFromJSON: function (layer) {
            // additional TMX flags
            this.name = layer[TMXConstants.TMX_TAG_NAME];
            this.cols = +layer[TMXConstants.TMX_TAG_WIDTH];
            this.rows = +layer[TMXConstants.TMX_TAG_HEIGHT];

            // layer opacity
            var visible = typeof(layer[TMXConstants.TMX_TAG_VISIBLE]) !== "undefined" ? layer[TMXConstants.TMX_TAG_VISIBLE] : true;
            this.setOpacity(visible ? +layer[TMXConstants.TMX_TAG_OPACITY] : 0);

            // layer "real" size
            if (this.orientation === "isometric") {
                this.width = (this.cols + this.rows) * (this.tilewidth / 2);
                this.height = (this.cols + this.rows) * (this.tileheight / 2);
            } else {
                this.width = this.cols * this.tilewidth;
                this.height = this.rows * this.tileheight;
            }
            // check if we have any user-defined properties
            me.TMXUtils.applyTMXProperties(this, layer);

            // check for the correct rendering method
            if (typeof (this.preRender) === "undefined") {
                this.preRender = me.sys.preRender;
            }

            // if pre-rendering method is use, create the offline canvas
            // TODO: this is really tied to the canvas api. need to abstract it.
            if (this.preRender === true) {
                this.layerCanvas = me.video.createCanvas(this.cols * this.tilewidth, this.rows * this.tileheight);
                this.layerSurface = me.CanvasRenderer.getContext2d(this.layerCanvas);
            }

            // initialize the layer data array
            this.initArray(this.cols, this.rows);
        },

        /**
         * destroy function
         * @ignore
         * @function
         */
        destroy : function () {
            // clear all allocated objects
            if (this.preRender) {
                this.layerCanvas = null;
                this.layerSurface = null;
            }
            this.renderer = null;
            // clear all allocated objects
            this.layerData = null;
            this.tileset = null;
            this.tilesets = null;
            this.animatedTilesets = null;
        },

        /**
         * set the layer renderer
         * @ignore
         */
        setRenderer : function (renderer) {
            this.renderer = renderer;
        },

        /**
         * Create all required arrays
         * @ignore
         */
        initArray : function (w, h) {
            // initialize the array
            this.layerData = [];
            for (var x = 0; x < w; x++) {
                this.layerData[x] = [];
                for (var y = 0; y < h; y++) {
                    this.layerData[x][y] = null;
                }
            }
        },

        /**
         * Return the TileId of the Tile at the specified position
         * @name getTileId
         * @memberOf me.TMXLayer
         * @public
         * @function
         * @param {Number} x x coordinate in pixel
         * @param {Number} y y coordinate in pixel
         * @return {Number} TileId
         */
        getTileId : function (x, y) {
            var tile = this.getTile(x, y);
            return (tile ? tile.tileId : null);
        },

        /**
         * Return the Tile object at the specified position
         * @name getTile
         * @memberOf me.TMXLayer
         * @public
         * @function
         * @param {Number} x x coordinate in pixel
         * @param {Number} y y coordinate in pixel
         * @return {me.Tile} Tile Object
         */
        getTile : function (x, y) {
            return this.layerData[~~this.renderer.pixelToTileX(x, y)][~~this.renderer.pixelToTileY(y, x)];
        },

        /**
         * Create a new Tile at the specified position
         * @name setTile
         * @memberOf me.TMXLayer
         * @public
         * @function
         * @param {Number} x x coordinate in tile
         * @param {Number} y y coordinate in tile
         * @param {Number} tileId tileId
         * @return {me.Tile} the corresponding newly created tile object
         */
        setTile : function (x, y, tileId) {
            var tile = new me.Tile(x, y, this.tilewidth, this.tileheight, tileId);
            if (!this.tileset.contains(tile.tileId)) {
                tile.tileset = this.tileset = this.tilesets.getTilesetByGid(tile.tileId);
            }
            else {
                tile.tileset = this.tileset;
            }
            this.layerData[x][y] = tile;
            return tile;
        },

        /**
         * clear the tile at the specified position
         * @name clearTile
         * @memberOf me.TMXLayer
         * @public
         * @function
         * @param {Number} x x position
         * @param {Number} y y position
         */
        clearTile : function (x, y) {
            // clearing tile
            this.layerData[x][y] = null;
            // erase the corresponding area in the canvas
            if (this.preRender) {
                this.layerSurface.clearRect(x * this.tilewidth, y * this.tileheight, this.tilewidth, this.tileheight);
            }
        },

        /**
         * update animations in a tileset layer
         * @ignore
         */
        update : function (dt) {
            if (this.isAnimated) {
                var result = false;
                for (var i = 0; i < this.animatedTilesets.length; i++) {
                    result = this.animatedTilesets[i].update(dt) || result;
                }
                return result;
            }

            return false;
        },

        /**
         * draw a tileset layer
         * @ignore
         */
        draw : function (renderer, rect) {
            // use the offscreen canvas
            if (this.preRender) {

                var width = Math.min(rect.width, this.width);
                var height = Math.min(rect.height, this.height);

                this.layerSurface.globalAlpha = renderer.globalAlpha() * this.getOpacity();

                if (this.layerSurface.globalAlpha > 0) {
                    // draw using the cached canvas
                    renderer.drawImage(
                        this.layerCanvas,
                        rect.pos.x, rect.pos.y, // sx,sy
                        width, height,          // sw,sh
                        rect.pos.x, rect.pos.y, // dx,dy
                        width, height           // dw,dh
                    );
                }
            }
            // dynamically render the layer
            else {
                // set the layer alpha value
                var _alpha = renderer.globalAlpha();
                renderer.setGlobalAlpha(renderer.globalAlpha() * this.getOpacity());
                if (renderer.globalAlpha() > 0) {
                    // draw the layer
                    this.renderer.drawTileLayer(renderer, this, rect);
                }

                // restore context to initial state
                renderer.setGlobalAlpha(_alpha);
            }
        }
    });
})(me.TMXConstants);

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Tile QT 0.7.x format
 * http://www.mapeditor.org/
 *
 */
(function () {
    /**
     * a TMX Tile Map Object
     * Tiled QT 0.7.x format
     * @class
     * @memberOf me
     * @constructor
     * @param {String} levelId name of TMX map
     */
    me.TMXTileMap = me.Renderable.extend({
        // constructor
        init: function (levelId) {
            // map id
            this.levelId = levelId;

            // map default z order
            this.z = 0;

            /**
             * name of the tilemap
             * @public
             * @type String
             * @name me.TMXTileMap#name
             */
            this.name = null;

            /**
             * width of the tilemap in tiles
             * @public
             * @type Int
             * @name me.TMXTileMap#cols
             */
            this.cols = 0;

            /**
             * height of the tilemap in tiles
             * @public
             * @type Int
             * @name me.TMXTileMap#rows
             */
            this.rows = 0;

            /**
             * Tile width
             * @public
             * @type Int
             * @name me.TMXTileMap#tilewidth
             */
            this.tilewidth = 0;

            /**
             * Tile height
             * @public
             * @type Int
             * @name me.TMXTileMap#tileheight
             */
            this.tileheight = 0;

            // corresponding tileset for this map
            this.tilesets = null;

            // map layers
            this.mapLayers = [];

            // map Object
            this.objectGroups = [];

            // tilemap version
            this.version = "";

            // map type (orthogonal or isometric)
            this.orientation = "";

            // tileset(s)
            this.tilesets = null;

            // loading flag
            this.initialized = false;

            me.Renderable.prototype.init.apply(this, [0, 0, 0, 0]);
        },

        /**
         * set the default map position based on the given viewport size
         * @name me.TMXTileMap#setDefaultPosition
         * @public
         * @function
         * @param {Number} width viewport width
         * @param {Number} height viewport height
         */
        setDefaultPosition: function (width, height) {
            // center the map if smaller than the current viewport
            if ((this.width < width) || (this.height < height)) {
                var shiftX =  ~~((width - this.width) / 2);
                var shiftY =  ~~((height - this.height) / 2);
                // update the map default position
                this.pos.set(
                    shiftX > 0 ? shiftX : 0,
                    shiftY > 0 ? shiftY : 0
                );
            }
        },

        /**
         * return the corresponding object group definition
         * @name me.TMXTileMap#getObjectGroupByName
         * @public
         * @function
         * @return {me.TMXObjectGroup} group
         */
        getObjectGroupByName : function (name) {
            var objectGroup = null;
            // normalize name
            name = name.trim().toLowerCase();
            for (var i = this.objectGroups.length; i--;) {
                if (this.objectGroups[i].name.toLowerCase().contains(name)) {
                    objectGroup = this.objectGroups[i];
                    break;
                }
            }
            return objectGroup;
        },

        /**
         * return all the existing object group definition
         * @name me.TMXTileMap#getObjectGroups
         * @public
         * @function
         * @return {me.TMXObjectGroup[]} Array of Groups
         */
        getObjectGroups : function () {
            return this.objectGroups;
        },

        /**
         * return all the existing layers
         * @name me.TMXTileMap#getLayers
         * @public
         * @function
         * @return {me.TMXLayer[]} Array of Layers
         */
        getLayers : function () {
            return this.mapLayers;
        },

        /**
         * return the specified layer object
         * @name me.TMXTileMap#getLayerByName
         * @public
         * @function
         * @param {String} name Layer Name
         * @return {me.TMXLayer} Layer Object
         */
        getLayerByName : function (name) {
            var layer = null;

            // normalize name
            name = name.trim().toLowerCase();
            for (var i = this.mapLayers.length; i--;) {
                if (this.mapLayers[i].name.toLowerCase().contains(name)) {
                    layer = this.mapLayers[i];
                    break;
                }
            }

            return layer;
        },

        /**
         * clear the tile at the specified position from all layers
         * @name me.TMXTileMap#clearTile
         * @public
         * @function
         * @param {Number} x x position
         * @param {Number} y y position
         */
        clearTile : function (x, y) {
            // add all layers
            for (var i = this.mapLayers.length; i--;) {
                // that are visible
                if (this.mapLayers[i] instanceof me.TMXLayer) {
                    this.mapLayers[i].clearTile(x, y);
                }
            }
        },

        /**
         * destroy function, clean all allocated objects
         * @ignore
         */
        destroy : function () {
            var i;

            if (this.initialized === true) {
                // reset/clear all layers
                for (i = this.mapLayers.length; i--;) {
                    this.mapLayers[i] = null;
                }
                // reset object groups
                for (i = this.objectGroups.length; i--;) {
                    // objectGroups is not added to the game world
                    // so we call the destroy function manually
                    this.objectGroups[i].destroy();
                    this.objectGroups[i] = null;
                }
                // call parent reset function
                this.tilesets = null;
                this.mapLayers.length = 0;
                this.objectGroups.length = 0;
                this.pos.set(0, 0);
                this.initialized = false;
            }
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 * Tile QT 0.7.x format
 * http://www.mapeditor.org/
 *
 */
(function (TMXConstants) {
    /**
     * a TMX Map Reader
     * Tiled QT 0.7.x format
     * @class
     * @memberOf me
     * @constructor
     * @ignore
     */
    me.TMXMapReader = Object.extend({
        init: function () {},

        readMap: function (map, data) {
            // if already loaded, do nothing
            if (map.initialized === true) {
                return;
            }

            // to automatically increment z index
            var zOrder = 0;

            // keep a reference to our scope
            var self = this;

            // map information
            map.version = data[TMXConstants.TMX_TAG_VERSION];
            map.orientation = data[TMXConstants.TMX_TAG_ORIENTATION];
            map.cols = +data[TMXConstants.TMX_TAG_WIDTH];
            map.rows = +data[TMXConstants.TMX_TAG_HEIGHT];
            map.tilewidth = +data[TMXConstants.TMX_TAG_TILEWIDTH];
            map.tileheight = +data[TMXConstants.TMX_TAG_TILEHEIGHT];
            if (map.orientation === "isometric") {
                map.width = (map.cols + map.rows) * (map.tilewidth / 2);
                map.height = (map.cols + map.rows) * (map.tileheight / 2);
            } else {
                map.width = map.cols * map.tilewidth;
                map.height = map.rows * map.tileheight;
            }
            map.backgroundcolor = data[TMXConstants.TMX_BACKGROUND_COLOR];
            map.z = zOrder++;

            // set the map properties (if any)
            me.TMXUtils.applyTMXProperties(map, data);

            // check if a user-defined background color is defined
            if (map.backgroundcolor) {
                map.mapLayers.push(
                    new me.ColorLayer(
                        "background_color",
                        map.backgroundcolor,
                        zOrder++
                    )
                );
            }

            // check if a background image is defined
            if (map.background_image) {
                // add a new image layer
                map.mapLayers.push(new me.ImageLayer(
                    "background_image",
                    map.width, map.height,
                    map.background_image,
                    zOrder++
                ));
            }

            // initialize a default TMX renderer
            if ((me.game.tmxRenderer === null) || !me.game.tmxRenderer.canRender(map)) {
                me.game.tmxRenderer = this.getNewDefaultRenderer(map);
            }

            // Tileset information
            if (!map.tilesets) {
                // make sure we have a TilesetGroup Object
                map.tilesets = new me.TMXTilesetGroup();
            }

            // parse all tileset objects
            var tilesets = data.tilesets || data.tileset;
            if (Array.isArray(tilesets) === true) {
                tilesets.forEach(function (tileset) {
                    // add the new tileset
                    map.tilesets.add(self.readTileset(tileset));
                });
            } else {
                map.tilesets.add(self.readTileset(tilesets));
            }

            // parse layer information

            // native JSON format
            if (typeof (data.layers) !== "undefined") {
                data.layers.forEach(function (layer) {
                    switch (layer.type) {
                        case TMXConstants.TMX_TAG_IMAGE_LAYER :
                            map.mapLayers.push(self.readImageLayer(map, layer, zOrder++));
                            break;

                        case TMXConstants.TMX_TAG_TILE_LAYER :
                            map.mapLayers.push(self.readLayer(map, layer, zOrder++));
                            break;

                        // get the object groups information
                        case TMXConstants.TMX_TAG_OBJECTGROUP:
                            map.objectGroups.push(self.readObjectGroup(map, layer, zOrder++));
                            break;

                        default:
                            break;
                    }
                });
            } else if (typeof (data.layer) !== "undefined") {
                // converted XML format
                // in converted format, these are not under the generic layers structure
                // and each element can be either an array of object of just one object

                var layers = data.layer;
                if (Array.isArray(layers) === true) {
                    layers.forEach(function (layer) {
                        // get the object information
                        map.mapLayers.push(self.readLayer(map, layer, layer._draworder));
                    });
                }
                else {
                    // get the object information
                    map.mapLayers.push(self.readLayer(map, layers, layers._draworder));
                }

                // in converted format, these are not under the generic layers structure
                if (typeof(data[TMXConstants.TMX_TAG_OBJECTGROUP]) !== "undefined") {
                    var groups = data[TMXConstants.TMX_TAG_OBJECTGROUP];
                    if (Array.isArray(groups) === true) {
                        groups.forEach(function (group) {
                            map.objectGroups.push(self.readObjectGroup(map, group, group._draworder));
                        });
                    }
                    else {
                        // get the object information
                        map.objectGroups.push(self.readObjectGroup(map, groups, groups._draworder));
                    }
                }

                // in converted format, these are not under the generic layers structure
                if (typeof(data[TMXConstants.TMX_TAG_IMAGE_LAYER]) !== "undefined") {
                    var imageLayers = data[TMXConstants.TMX_TAG_IMAGE_LAYER];
                    if (Array.isArray(imageLayers) === true) {
                        imageLayers.forEach(function (imageLayer) {
                            map.mapLayers.push(self.readImageLayer(map, imageLayer, imageLayer._draworder));
                        });
                    }
                    else {
                        map.mapLayers.push(self.readImageLayer(map, imageLayers, imageLayers._draworder));
                    }
                }
            }

            // flag as loaded
            map.initialized = true;
        },

         /**
         * set a compatible renderer object
         * for the specified map
         * TODO : put this somewhere else
         * @ignore
         */
        getNewDefaultRenderer: function (obj) {
            switch (obj.orientation) {
                case "orthogonal":
                    return new me.TMXOrthogonalRenderer(
                        obj.cols,
                        obj.rows,
                        obj.tilewidth,
                        obj.tileheight
                    );

                case "isometric":
                    return new me.TMXIsometricRenderer(
                        obj.cols,
                        obj.rows,
                        obj.tilewidth,
                        obj.tileheight
                    );

                // if none found, throw an exception
                default:
                    throw new me.Error(obj.orientation + " type TMX Tile Map not supported!");
            }
        },

        /**
         * Set tiled layer Data
         * @ignore
         */
        setLayerData : function (layer, rawdata, encoding, compression) {
            // data
            var data = Array.isArray(rawdata) === true ? rawdata : rawdata.value;

            // decode data based on encoding type
            switch (encoding) {
                case "json":
                    // do nothing as data can be directly reused
                    data = rawdata;
                    break;
                // CSV encoding
                case TMXConstants.TMX_TAG_CSV:
                // Base 64 encoding
                case TMXConstants.TMX_TAG_ATTR_BASE64:
                    // and then decode them
                    if (encoding === TMXConstants.TMX_TAG_CSV) {
                        // CSV decode
                        data = me.utils.decodeCSV(data, layer.cols);
                    } else {
                        // Base 64 decode
                        data = me.utils.decodeBase64AsArray(data, 4);
                        // check if data is compressed
                        if (compression !== null) {
                            data = me.utils.decompress(data, compression);
                        }
                    }
                    break;


                default:
                    throw new me.Error("TMX Tile Map " + encoding + " encoding not supported!");
            }

            var idx = 0;
            // set everything
            for (var y = 0 ; y < layer.rows; y++) {
                for (var x = 0; x < layer.cols; x++) {
                    // get the value of the gid
                    var gid = (encoding == null) ? this.TMXParser.getIntAttribute(data[idx++], TMXConstants.TMX_TAG_GID) : data[idx++];
                    // fill the array
                    if (gid !== 0) {
                        // add a new tile to the layer
                        var tile = layer.setTile(x, y, gid);
                        // draw the corresponding tile
                        if (layer.preRender) {
                            layer.renderer.drawTile(layer.layerSurface, x, y, tile, tile.tileset);
                        }
                    }
                }
            }
        },

        readLayer: function (map, data, z) {
            var layer = new me.TMXLayer(map.tilewidth, map.tileheight, map.orientation, map.tilesets, z);
            // init the layer properly
            layer.initFromJSON(data);
            // set a renderer
            if (!me.game.tmxRenderer.canRender(layer)) {
                layer.setRenderer(me.mapReader.getNewDefaultRenderer(layer));
            }
            else {
                // use the default one
                layer.setRenderer(me.game.tmxRenderer);
            }
            var encoding = Array.isArray(data[TMXConstants.TMX_TAG_DATA]) ? data[TMXConstants.TMX_TAG_ENCODING] : data[TMXConstants.TMX_TAG_DATA][TMXConstants.TMX_TAG_ENCODING];
            // parse the layer data
            this.setLayerData(layer, data[TMXConstants.TMX_TAG_DATA], encoding || "json", null);
            return layer;
        },

        readImageLayer: function (map, data, z) {
            // extract layer information
            var iln = data[TMXConstants.TMX_TAG_NAME];
            var ilw = +data[TMXConstants.TMX_TAG_WIDTH];
            var ilh = +data[TMXConstants.TMX_TAG_HEIGHT];
            var ilsrc = typeof (data[TMXConstants.TMX_TAG_IMAGE]) !== "string" ? data[TMXConstants.TMX_TAG_IMAGE].source : data[TMXConstants.TMX_TAG_IMAGE];

            // create the layer
            var imageLayer = new me.ImageLayer(iln, ilw * map.tilewidth, ilh * map.tileheight, ilsrc, z);

            // set some additional flags
            var visible = typeof(data[TMXConstants.TMX_TAG_VISIBLE]) !== "undefined" ? data[TMXConstants.TMX_TAG_VISIBLE] : true;
            imageLayer.setOpacity((visible === true) ? (+data[TMXConstants.TMX_TAG_OPACITY] || 1.0).clamp(0.0, 1.0) : 0);

            // check if we have any additional properties
            me.TMXUtils.applyTMXProperties(imageLayer, data);

            // make sure ratio is a vector (backward compatibility)
            if (typeof(imageLayer.ratio) === "number") {
                var ratio = imageLayer.ratio;
                imageLayer.ratio = new me.Vector2d(ratio, ratio);
            }

            return imageLayer;
        },

        readTileset : function (data) {
            return (new me.TMXTileset(data));
        },

        readObjectGroup: function (map, data, z) {
            return (new me.TMXObjectGroup(data[TMXConstants.TMX_TAG_NAME], data, map.orientation, map.tilesets, z));
        }
    });
})(me.TMXConstants);

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * a level manager object <br>
     * once ressources loaded, the level director contains all references of defined levels<br>
     * There is no constructor function for me.levelDirector, this is a static object
     * @namespace me.levelDirector
     * @memberOf me
     */
    me.levelDirector = (function () {
        // hold public stuff in our singletong
        var api = {};

        /*
         * PRIVATE STUFF
         */

        // our levels
        var levels = {};
        // level index table
        var levelIdx = [];
        // current level index
        var currentLevelIdx = 0;

        /**
         * Load a TMX level
         * @name loadTMXLevel
         * @memberOf me.game
         * @private
         * @param {String} level to be loaded
         * @param {me.Container} target container
         * @ignore
         * @function
         */
        var loadTMXLevel = function (level, container) {
            // disable auto-sort for the given container
            container.autoSort = false;

            // load our map
            me.game.currentLevel = level;

            // change the viewport bounds
            me.game.viewport.setBounds(
                0, 0,
                Math.max(level.width, me.game.viewport.width),
                Math.max(level.height, me.game.viewport.height)
            );

            // adjust map position based on the viewport size
            // (only update the map position if the map is smaller than the viewport)
            level.setDefaultPosition(me.game.viewport.width, me.game.viewport.height);

            // add all defined layers
            var layers = level.getLayers();
            for (var i = layers.length; i--;) {
                container.addChild(layers[i]);
            }

            // game world as default container
            var targetContainer = container;

            var isCollisionGroup = false;

            // load all ObjectGroup and Object definition
            var objectGroups = level.getObjectGroups();

            for (var g = 0; g < objectGroups.length; g++) {
                var group = objectGroups[g];

                // check if this is the collision shape group
                isCollisionGroup = group.name.toLowerCase().contains(me.TMXConstants.COLLISION_GROUP);

                if (me.game.mergeGroup === false) {
                    // create a new container with Infinite size (?)
                    // note: initial position and size seems to be meaningless in Tiled
                    // https://github.com/bjorn/tiled/wiki/TMX-Map-Format :
                    // x: Defaults to 0 and can no longer be changed in Tiled Qt.
                    // y: Defaults to 0 and can no longer be changed in Tiled Qt.
                    // width: The width of the object group in tiles. Meaningless.
                    // height: The height of the object group in tiles. Meaningless.
                    targetContainer = new me.Container();

                    // set additional properties
                    targetContainer.name = group.name;
                    targetContainer.z = group.z;
                    targetContainer.setOpacity(group.opacity);

                    // disable auto-sort
                    targetContainer.autoSort = false;
                }

                // iterate through the group and add all object into their
                // corresponding target Container
                for (var o = 0; o < group.objects.length; o++) {
                    // TMX object settings
                    var settings = group.objects[o];

                    var obj;

                    if (isCollisionGroup === false) {
                        obj = me.pool.pull(
                            settings.name,
                            settings.x, settings.y,
                            // 'TileObject' will instantiate a Sprite Object
                            settings.name === "TileObject" ? settings.image : settings
                        );
                    } else {
                        obj = me.pool.pull(
                            "me.Entity",
                            settings.x, settings.y,
                            settings
                        );
                        // configure the body accordingly
                        obj.body.collisionType = me.collision.types.WORLD_SHAPE;
                    }

                    // ignore if the pull function does not return a corresponding object
                    if (obj) {
                        // set the obj z order correspondingly to its parent container/group
                        obj.z = group.z;
                        
                        //apply group opacity value to the child objects if group are merged
                        if (me.game.mergeGroup === true && obj.isRenderable === true) {
                            obj.setOpacity(obj.getOpacity() * group.opacity);
                            // and to child renderables if any
                            if (obj.renderable instanceof me.Renderable) {
                                obj.renderable.setOpacity(obj.renderable.getOpacity() * group.opacity);
                            }
                        }
                        // add the obj into the target container
                        targetContainer.addChild(obj);
                    }
                }

                // if we created a new container
                if (me.game.mergeGroup === false) {
                    // add our container to the world
                    container.addChild(targetContainer);

                    // re-enable auto-sort
                    targetContainer.autoSort = true;
                }
            }

            // sort everything (recursively)
            container.sort(true);

            // re-enable auto-sort
            container.autoSort = true;

            // translate the display if required
            me.game.world.transform.translateV(me.game.currentLevel.pos);
            
            // update the game world size to match the level size
            me.game.world.resize(me.game.currentLevel.width, me.game.currentLevel.height);

            // fire the callback if defined
            if (me.game.onLevelLoaded) {
                me.game.onLevelLoaded.call(me.game.onLevelLoaded, level.name);
            }
            //publish the corresponding message
            me.event.publish(me.event.LEVEL_LOADED, [level.name]);
        };

        /*
         * PUBLIC STUFF
         */

        /**
         * reset the level director
         * @ignore
         */
        api.reset = function () {};

        /**
         * add a level
         * @ignore
         */
        api.addLevel = function () {
            throw new me.Error("no level loader defined");
        };

        /**
         *
         * add a TMX level
         * @ignore
         */
        api.addTMXLevel = function (levelId, callback) {
            // just load the level with the XML stuff
            if (levels[levelId] == null) {
                //console.log("loading "+ levelId);
                levels[levelId] = new me.TMXTileMap(levelId);
                // set the name of the level
                levels[levelId].name = levelId;
                // level index
                levelIdx.push(levelId);
            }
            else  {
                //console.log("level %s already loaded", levelId);
                return false;
            }

            // call the callback if defined
            if (callback) {
                callback();
            }
            // true if level loaded
            return true;
        };

        /**
         * load a level into the game manager<br>
         * (will also create all level defined entities, etc..)
         * @name loadLevel
         * @memberOf me.levelDirector
         * @public
         * @function
         * @param {String} level level id
         * @example
         * // the game defined ressources
         * // to be preloaded by the loader
         * // TMX maps
         * ...
         * {name: "a4_level1",   type: "tmx",   src: "data/level/a4_level1.tmx"},
         * {name: "a4_level2",   type: "tmx",   src: "data/level/a4_level2.tmx"},
         * {name: "a4_level3",   type: "tmx",   src: "data/level/a4_level3.tmx"},
         * ...
         * ...
         * // load a level
         * me.levelDirector.loadLevel("a4_level1");
         */
        api.loadLevel = function (levelId) {
            // make sure it's a string
            levelId = levelId.toString().toLowerCase();
            // throw an exception if not existing
            if (typeof(levels[levelId]) === "undefined") {
                throw new me.Error("level " + levelId + " not found");
            }

            if (levels[levelId] instanceof me.TMXTileMap) {

                // check the status of the state mngr
                var wasRunning = me.state.isRunning();

                if (wasRunning) {
                    // stop the game loop to avoid
                    // some silly side effects
                    me.state.stop();
                }

                // reset the gameObject Manager (just in case!)
                me.game.reset();

                // reset the GUID generator
                // and pass the level id as parameter
                me.utils.resetGUID(levelId);

                // clean the current (previous) level
                if (levels[api.getCurrentLevelId()]) {
                    levels[api.getCurrentLevelId()].destroy();
                }

                // parse the give TMX file into the give level
                me.mapReader.readMap(levels[levelId], me.loader.getTMX(levelId));

                // update current level index
                currentLevelIdx = levelIdx.indexOf(levelId);

                // add the specified level to the game world
                loadTMXLevel(levels[levelId], me.game.world);

                if (wasRunning) {
                    // resume the game loop if it was
                    // previously running
                    me.state.restart.defer(this);
                }
            }
            else {
                throw new me.Error("no level loader defined");
            }
            return true;
        };

        /**
         * return the current level id<br>
         * @name getCurrentLevelId
         * @memberOf me.levelDirector
         * @public
         * @function
         * @return {String}
         */
        api.getCurrentLevelId = function () {
            return levelIdx[currentLevelIdx];
        };

        /**
         * reload the current level<br>
         * @name reloadLevel
         * @memberOf me.levelDirector
         * @public
         * @function
         */
        api.reloadLevel = function () {
            // reset the level to initial state
            //levels[currentLevel].reset();
            return api.loadLevel(api.getCurrentLevelId());
        };

        /**
         * load the next level<br>
         * @name nextLevel
         * @memberOf me.levelDirector
         * @public
         * @function
         */
        api.nextLevel = function () {
            //go to the next level
            if (currentLevelIdx + 1 < levelIdx.length) {
                return api.loadLevel(levelIdx[currentLevelIdx + 1]);
            }
            else {
                return false;
            }
        };

        /**
         * load the previous level<br>
         * @name previousLevel
         * @memberOf me.levelDirector
         * @public
         * @function
         */
        api.previousLevel = function () {
            // go to previous level
            if (currentLevelIdx - 1 >= 0) {
                return api.loadLevel(levelIdx[currentLevelIdx - 1]);
            }
            else {
                return false;
            }
        };

        /**
         * return the amount of level preloaded<br>
         * @name levelCount
         * @memberOf me.levelDirector
         * @public
         * @function
         */
        api.levelCount = function () {
            return levelIdx.length;
        };

        // return our object
        return api;
    })();
})();

/**
 * @preserve Tween JS
 * https://github.com/sole/Tween.js
 */

/* jshint -W011 */
/* jshint -W013 */
/* jshint -W089 */
/* jshint -W093 */
/* jshint -W098 */
/* jshint -W108 */
/* jshint -W116 */

(function() {

    /**
     * Javascript Tweening Engine<p>
     * Super simple, fast and easy to use tweening engine which incorporates optimised Robert Penner's equation<p>
     * <a href="https://github.com/sole/Tween.js">https://github.com/sole/Tween.js</a><p>
     * author sole / http://soledadpenades.com<br>
     * author mr.doob / http://mrdoob.com<br>
     * author Robert Eisele / http://www.xarg.org<br>
     * author Philippe / http://philippe.elsass.me<br>
     * author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html<br>
     * author Paul Lewis / http://www.aerotwist.com/<br>
     * author lechecacharro<br>
     * author Josh Faul / http://jocafa.com/
     * @class
     * @memberOf me
     * @constructor
     * @param {Object} object object on which to apply the tween
     * @example
     * // add a tween to change the object pos.y variable to 200 in 3 seconds
     * tween = new me.Tween(myObject.pos).to({y: 200}, 3000).onComplete(myFunc);
     * tween.easing(me.Tween.Easing.Bounce.Out);
     * tween.start();
     */
    me.Tween = function ( object ) {

        var _object = object;
        var _valuesStart = {};
        var _valuesEnd = {};
        var _valuesStartRepeat = {};
        var _duration = 1000;
        var _repeat = 0;
        var _yoyo = false;
        var _reversed = false;
        var _delayTime = 0;
        var _startTime = null;
        var _easingFunction = me.Tween.Easing.Linear.None;
        var _interpolationFunction = me.Tween.Interpolation.Linear;
        var _chainedTweens = [];
        var _onStartCallback = null;
        var _onStartCallbackFired = false;
        var _onUpdateCallback = null;
        var _onCompleteCallback = null;


        // Set all starting values present on the target object
        for ( var field in object ) {
            if(typeof object !== 'object') {
                _valuesStart[ field ] = parseFloat(object[field], 10);
            }

        }

        /**
         * reset the tween object to default value
         * @ignore
         */
        this.onResetEvent = function ( object ) {
            _object = object;
            _valuesStart = {};
            _valuesEnd = {};
            _valuesStartRepeat = {};
            _easingFunction = me.Tween.Easing.Linear.None;
            _interpolationFunction = me.Tween.Interpolation.Linear;
            _yoyo = false;
            _reversed = false;
            _duration = 1000;
            _delayTime = 0;
            _onStartCallback = null;
            _onStartCallbackFired = false;
            _onUpdateCallback = null;
            _onCompleteCallback = null;
        };

        /**
         * object properties to be updated and duration
         * @name me.Tween#to
         * @public
         * @function
         * @param {Object} properties hash of properties
         * @param {Number} [duration=1000] tween duration
         */
        this.to = function ( properties, duration ) {

            if ( duration !== undefined ) {

                _duration = duration;

            }

            _valuesEnd = properties;

            return this;

        };

        /**
         * start the tween
         * @name me.Tween#start
         * @public
         * @function
         */
        this.start = function ( time ) {

            _onStartCallbackFired = false;

            // add the tween to the object pool on start
            me.game.world.addChild(this);

            _startTime = (typeof(time) === 'undefined' ? me.timer.getTime() : time) + _delayTime;

            for ( var property in _valuesEnd ) {

                // check if an Array was provided as property value
                if ( _valuesEnd[ property ] instanceof Array ) {

                    if ( _valuesEnd[ property ].length === 0 ) {

                        continue;

                    }

                    // create a local copy of the Array with the start value at the front
                    _valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

                }

                _valuesStart[ property ] = _object[ property ];

                if( ( _valuesStart[ property ] instanceof Array ) === false ) {
                    _valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
                }

                _valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

            }

            return this;

        };

        /**
         * stop the tween
         * @name me.Tween#stop
         * @public
         * @function
         */
        this.stop = function () {
            // ensure the tween has not been removed previously
            if (me.game.world.hasChild(this)) {
                me.game.world.removeChildNow(this);
            }
            return this;
        };

        /**
         * delay the tween
         * @name me.Tween#delay
         * @public
         * @function
         * @param {Number} amount delay amount expressed in milliseconds
         */
        this.delay = function ( amount ) {

            _delayTime = amount;
            return this;

        };

        /**
         * Calculate delta to resume the tween
         * @ignore
         */
        me.event.subscribe(me.event.STATE_RESUME, function onResume(elapsed) {
            if (_startTime) {
                _startTime += elapsed;
            }
        });

        /**
         * Repeat the tween
         * @name me.Tween#repeat
         * @public
         * @function
         * @param {Number} times amount of times the tween should be repeated
         */
        this.repeat = function ( times ) {

            _repeat = times;
            return this;

        };

        /**
         * allows the tween to bounce back to their original value when finished
         * @name me.Tween#yoyo
         * @public
         * @function
         * @param {Boolean} yoyo
         */
        this.yoyo = function( yoyo ) {

            _yoyo = yoyo;
            return this;

        };

        /**
         * set the easing function
         * @name me.Tween#easing
         * @public
         * @function
         * @param {me.Tween#Easing} easing easing function
         */
        this.easing = function ( easing ) {
            if (typeof easing !== 'function') {
                throw new me.Tween.Error("invalid easing function for me.Tween.easing()");
            }
            _easingFunction = easing;
            return this;

        };

        /**
         * set the interpolation function
         * @name me.Tween#interpolation
         * @public
         * @function
         * @param {me.Tween#Interpolation} easing easing function
         */
        this.interpolation = function ( interpolation ) {

            _interpolationFunction = interpolation;
            return this;

        };

        /**
         * chain the tween
         * @name me.Tween#chain
         * @public
         * @function
         * @param {me.Tween} chainedTween Tween to be chained
         */
        this.chain = function () {

            _chainedTweens = arguments;
            return this;

        };

        /**
         * onStart callback
         * @name me.Tween#onStart
         * @public
         * @function
         * @param {Function} onStartCallback callback
         */
        this.onStart = function ( callback ) {

            _onStartCallback = callback;
            return this;

        };

        /**
         * onUpdate callback
         * @name me.Tween#onUpdate
         * @public
         * @function
         * @param {Function} onUpdateCallback callback
         */
        this.onUpdate = function ( callback ) {

            _onUpdateCallback = callback;
            return this;

        };

        /**
         * onComplete callback
         * @name me.Tween#onComplete
         * @public
         * @function
         * @param {Function} onCompleteCallback callback
         */
        this.onComplete = function ( callback ) {

            _onCompleteCallback = callback;
            return this;

        };

        /** @ignore*/
        this.update = function ( dt ) {

            // the original Tween implementation expect
            // a timestamp and not a time delta
            var time = me.timer.getTime();

            var property;

            if ( time < _startTime ) {

                return true;

            }

            if ( _onStartCallbackFired === false ) {

                if ( _onStartCallback !== null ) {

                    _onStartCallback.call( _object );

                }

                _onStartCallbackFired = true;

            }

            var elapsed = ( time - _startTime ) / _duration;
            elapsed = elapsed > 1 ? 1 : elapsed;

            var value = _easingFunction( elapsed );

            for ( property in _valuesEnd ) {

                var start = _valuesStart[ property ] || 0;
                var end = _valuesEnd[ property ];

                if ( end instanceof Array ) {

                    _object[ property ] = _interpolationFunction( end, value );

                } else {

                    // Parses relative end values with start as base (e.g.: +10, -3)
                    if ( typeof(end) === "string" ) {
                        end = start + parseFloat(end, 10);
                    }

                    // protect against non numeric properties.
                    if ( typeof(end) === "number" ) {
                        _object[ property ] = start + ( end - start ) * value;
                    }

                }

            }

            if ( _onUpdateCallback !== null ) {

                _onUpdateCallback.call( _object, value );

            }

            if ( elapsed === 1 ) {

                if ( _repeat > 0 ) {

                    if( isFinite( _repeat ) ) {
                        _repeat--;
                    }

                    // reassign starting values, restart by making startTime = now
                    for( property in _valuesStartRepeat ) {

                        if ( typeof( _valuesEnd[ property ] ) === "string" ) {
                            _valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
                        }

                        if (_yoyo) {
                            var tmp = _valuesStartRepeat[ property ];
                            _valuesStartRepeat[ property ] = _valuesEnd[ property ];
                            _valuesEnd[ property ] = tmp;
                        }
                        _valuesStart[ property ] = _valuesStartRepeat[ property ];

                    }
                    
                    if (_yoyo) {
                        _reversed = !_reversed;
                    }
                    
                    _startTime = time + _delayTime;

                    return true;

                } else {
                    // remove the tween from the object pool
                    me.game.world.removeChildNow(this);

                    if ( _onCompleteCallback !== null ) {

                        _onCompleteCallback.call( _object );

                    }

                    for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i ++ ) {

                        _chainedTweens[ i ].start( time );

                    }

                    return false;

                }

            }

            return true;

        };

    };

    /**
     * Easing Function :<br>
     * <p>
     * me.Tween.Easing.Linear.None<br>
     * me.Tween.Easing.Quadratic.In<br>
     * me.Tween.Easing.Quadratic.Out<br>
     * me.Tween.Easing.Quadratic.InOut<br>
     * me.Tween.Easing.Cubic.In<br>
     * me.Tween.Easing.Cubic.Out<br>
     * me.Tween.Easing.Cubic.InOut<br>
     * me.Tween.Easing.Quartic.In<br>
     * me.Tween.Easing.Quartic.Out<br>
     * me.Tween.Easing.Quartic.InOut<br>
     * me.Tween.Easing.Quintic.In<br>
     * me.Tween.Easing.Quintic.Out<br>
     * me.Tween.Easing.Quintic.InOut<br>
     * me.Tween.Easing.Sinusoidal.In<br>
     * me.Tween.Easing.Sinusoidal.Out<br>
     * me.Tween.Easing.Sinusoidal.InOut<br>
     * me.Tween.Easing.Exponential.In<br>
     * me.Tween.Easing.Exponential.Out<br>
     * me.Tween.Easing.Exponential.InOut<br>
     * me.Tween.Easing.Circular.In<br>
     * me.Tween.Easing.Circular.Out<br>
     * me.Tween.Easing.Circular.InOut<br>
     * me.Tween.Easing.Elastic.In<br>
     * me.Tween.Easing.Elastic.Out<br>
     * me.Tween.Easing.Elastic.InOut<br>
     * me.Tween.Easing.Back.In<br>
     * me.Tween.Easing.Back.Out<br>
     * me.Tween.Easing.Back.InOut<br>
     * me.Tween.Easing.Bounce.In<br>
     * me.Tween.Easing.Bounce.Out<br>
     * me.Tween.Easing.Bounce.InOut
     * </p>
     * @public
     * @constant
     * @type enum
     * @name me.Tween#Easing
     */
    me.Tween.Easing = {

        Linear: {
            /** @ignore */
            None: function ( k ) {

                return k;

            }

        },

        Quadratic: {
            /** @ignore */
            In: function ( k ) {

                return k * k;

            },
            /** @ignore */
            Out: function ( k ) {

                return k * ( 2 - k );

            },
            /** @ignore */
            InOut: function ( k ) {

                if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
                return - 0.5 * ( --k * ( k - 2 ) - 1 );

            }

        },

        Cubic: {
            /** @ignore */
            In: function ( k ) {

                return k * k * k;

            },
            /** @ignore */
            Out: function ( k ) {

                return --k * k * k + 1;

            },
            /** @ignore */
            InOut: function ( k ) {

                if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
                return 0.5 * ( ( k -= 2 ) * k * k + 2 );

            }

        },

        Quartic: {
            /** @ignore */
            In: function ( k ) {

                return k * k * k * k;

            },
            /** @ignore */
            Out: function ( k ) {

                return 1 - ( --k * k * k * k );

            },
            /** @ignore */
            InOut: function ( k ) {

                if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
                return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

            }

        },

        Quintic: {
            /** @ignore */
            In: function ( k ) {

                return k * k * k * k * k;

            },
            /** @ignore */
            Out: function ( k ) {

                return --k * k * k * k * k + 1;

            },
            /** @ignore */
            InOut: function ( k ) {

                if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
                return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

            }

        },

        Sinusoidal: {
            /** @ignore */
            In: function ( k ) {

                return 1 - Math.cos( k * Math.PI / 2 );

            },
            /** @ignore */
            Out: function ( k ) {

                return Math.sin( k * Math.PI / 2 );

            },
            /** @ignore */
            InOut: function ( k ) {

                return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

            }

        },

        Exponential: {
            /** @ignore */
            In: function ( k ) {

                return k === 0 ? 0 : Math.pow( 1024, k - 1 );

            },
            /** @ignore */
            Out: function ( k ) {

                return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

            },
            /** @ignore */
            InOut: function ( k ) {

                if ( k === 0 ) return 0;
                if ( k === 1 ) return 1;
                if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
                return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

            }

        },

        Circular: {
            /** @ignore */
            In: function ( k ) {

                return 1 - Math.sqrt( 1 - k * k );

            },
            /** @ignore */
            Out: function ( k ) {

                return Math.sqrt( 1 - ( --k * k ) );

            },
            /** @ignore */
            InOut: function ( k ) {

                if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
                return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

            }

        },

        Elastic: {
            /** @ignore */
            In: function ( k ) {

                var s, a = 0.1, p = 0.4;
                if ( k === 0 ) return 0;
                if ( k === 1 ) return 1;
                if ( !a || a < 1 ) { a = 1; s = p / 4; }
                else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
                return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

            },
            /** @ignore */
            Out: function ( k ) {

                var s, a = 0.1, p = 0.4;
                if ( k === 0 ) return 0;
                if ( k === 1 ) return 1;
                if ( !a || a < 1 ) { a = 1; s = p / 4; }
                else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
                return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

            },
            /** @ignore */
            InOut: function ( k ) {

                var s, a = 0.1, p = 0.4;
                if ( k === 0 ) return 0;
                if ( k === 1 ) return 1;
                if ( !a || a < 1 ) { a = 1; s = p / 4; }
                else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
                if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
                return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

            }

        },

        Back: {
            /** @ignore */
            In: function ( k ) {

                var s = 1.70158;
                return k * k * ( ( s + 1 ) * k - s );

            },
            /** @ignore */
            Out: function ( k ) {

                var s = 1.70158;
                return --k * k * ( ( s + 1 ) * k + s ) + 1;

            },
            /** @ignore */
            InOut: function ( k ) {

                var s = 1.70158 * 1.525;
                if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
                return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

            }

        },

        Bounce: {
            /** @ignore */
            In: function ( k ) {

                return 1 - me.Tween.Easing.Bounce.Out( 1 - k );

            },
            /** @ignore */
            Out: function ( k ) {

                if ( k < ( 1 / 2.75 ) ) {

                    return 7.5625 * k * k;

                } else if ( k < ( 2 / 2.75 ) ) {

                    return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

                } else if ( k < ( 2.5 / 2.75 ) ) {

                    return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

                } else {

                    return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

                }

            },
            /** @ignore */
            InOut: function ( k ) {

                if ( k < 0.5 ) return me.Tween.Easing.Bounce.In( k * 2 ) * 0.5;
                return me.Tween.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

            }

        }

    };

    /* Interpolation Function :<br>
     * <p>
     * me.Tween.Interpolation.Linear<br>
     * me.Tween.Interpolation.Bezier<br>
     * me.Tween.Interpolation.CatmullRom<br>
     * </p>
     * @public
     * @constant
     * @type enum
     * @name me.Tween#Interpolation
     */
    me.Tween.Interpolation = {
        /** @ignore */
        Linear: function ( v, k ) {

            var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = me.Tween.Interpolation.Utils.Linear;

            if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
            if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

            return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

        },
        /** @ignore */
        Bezier: function ( v, k ) {

            var b = 0, n = v.length - 1, pw = Math.pow, bn = me.Tween.Interpolation.Utils.Bernstein, i;

            for ( i = 0; i <= n; i++ ) {
                b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
            }

            return b;

        },
        /** @ignore */
        CatmullRom: function ( v, k ) {

            var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = me.Tween.Interpolation.Utils.CatmullRom;

            if ( v[ 0 ] === v[ m ] ) {

                if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

                return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

            } else {

                if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
                if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

                return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

            }

        },

        Utils: {
            /** @ignore */
            Linear: function ( p0, p1, t ) {

                return ( p1 - p0 ) * t + p0;

            },
            /** @ignore */
            Bernstein: function ( n , i ) {

                var fc = me.Tween.Interpolation.Utils.Factorial;
                return fc( n ) / fc( i ) / fc( n - i );

            },
            /** @ignore */
            Factorial: ( function () {

                var a = [ 1 ];

                return function ( n ) {

                    var s = 1, i;
                    if ( a[ n ] ) return a[ n ];
                    for ( i = n; i > 1; i-- ) s *= i;
                    return a[ n ] = s;

                };

            } )(),
            /** @ignore */
            CatmullRom: function ( p0, p1, p2, p3, t ) {

                var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
                return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

            }

        }

    };

    /**
     * Base class for Tween exception handling.
     * @name Error
     * @class
     * @memberOf me.Tween
     * @constructor
     * @param {String} msg Error message.
     */
    me.Tween.Error = me.Error.extend({
        init : function (msg) {
            me.Error.prototype.init.apply(this, [ msg ]);
            this.name = "me.Tween.Error";
        }
    });
})();

/**
 * @preserve MinPubSub
 * a micro publish/subscribe messaging framework
 * @see https://github.com/daniellmb/MinPubSub
 * @author Daniel Lamb <daniellmb.com>
 *
 * Released under the MIT License
 */
(function () {
    /**
     * There is no constructor function for me.event
     * @namespace me.event
     * @memberOf me
     */
    me.event = (function () {
        // hold public stuff inside the singleton
        var api = {};

        /**
         * the channel/subscription hash
         * @ignore
         */
        var cache = {};

        /*
         * PUBLIC
         */

        /**
         * Channel Constant when the game is paused <br>
         * Data passed : none <br>
         * @public
         * @constant
         * @type String
         * @name me.event#STATE_PAUSE
         */
        api.STATE_PAUSE = "me.state.onPause";

        /**
         * Channel Constant for when the game is resumed <br>
         * Data passed : {Number} time in ms the game was paused
         * @public
         * @constant
         * @type String
         * @name me.event#STATE_RESUME
         */
        api.STATE_RESUME = "me.state.onResume";

        /**
         * Channel Constant when the game is stopped <br>
         * Data passed : none <br>
         * @public
         * @constant
         * @type String
         * @name me.event#STATE_STOP
         */
        api.STATE_STOP = "me.state.onStop";

        /**
         * Channel Constant for when the game is restarted <br>
         * Data passed : {Number} time in ms the game was stopped
         * @public
         * @constant
         * @type String
         * @name me.event#STATE_RESTART
         */
        api.STATE_RESTART = "me.state.onRestart";

        /**
         * Channel Constant for when the game manager is initialized <br>
         * Data passed : none <br>
         * @public
         * @constant
         * @type String
         * @name me.event#GAME_INIT
         */
        api.GAME_INIT = "me.game.onInit";

        /**
         * Channel Constant for when a level is loaded <br>
         * Data passed : {String} Level Name
         * @public
         * @constant
         * @type String
         * @name me.event#LEVEL_LOADED
         */
        api.LEVEL_LOADED = "me.game.onLevelLoaded";

        /**
         * Channel Constant for when everything has loaded <br>
         * Data passed : none <br>
         * @public
         * @constant
         * @type String
         * @name me.event#LOADER_COMPLETE
         */
        api.LOADER_COMPLETE = "me.loader.onload";

        /**
         * Channel Constant for displaying a load progress indicator <br>
         * Data passed : {Number} [0 .. 1], {Resource} resource object<br>
         * @public
         * @constant
         * @type String
         * @name me.event#LOADER_PROGRESS
         */
        api.LOADER_PROGRESS = "me.loader.onProgress";

        /**
         * Channel Constant for pressing a binded key <br>
         * Data passed : {String} user-defined action, {Number} keyCode,
         * {Boolean} edge state <br>
         * Edge-state is for detecting "locked" key bindings. When a locked key
         * is pressed and held, the first event will have have the third
         * argument set true. subsequent events will continue firing with the
         * third argument set false.
         * @public
         * @constant
         * @type String
         * @name me.event#KEYDOWN
         * @example
         * me.input.bindKey(me.input.KEY.X, "jump", true); // Edge-triggered
         * me.input.bindKey(me.input.KEY.Z, "shoot"); // Level-triggered
         * me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
         *   // Checking bound keys
         *   if (action === "jump") {
         *       if (edge) {
         *           this.doJump();
         *       }
         *
         *       // Make character fall slower when holding the jump key
         *       this.vel.y = this.gravity;
         *   }
         * });
         */
        api.KEYDOWN = "me.input.keydown";

        /**
         * Channel Constant for releasing a binded key <br>
         * Data passed : {String} user-defined action, {Number} keyCode <br>
         * @public
         * @constant
         * @type String
         * @name me.event#KEYUP
         * @example
         * me.event.subscribe(me.event.KEYUP, function (action, keyCode) {
         *   // Checking unbound keys
         *   if (keyCode == me.input.KEY.ESC) {
         *       if (me.state.isPaused()) {
         *           me.state.resume();
         *       }
         *       else {
         *           me.state.pause();
         *       }
         *   }
         * });
         */
        api.KEYUP = "me.input.keyup";

        /**
         * Channel Constant for mousemove or dragmove events on the game viewport <br>
         * Data passed : {Object} the mousemove or dragmove event <br>
         * @public
         * @constant
         * @type String
         * @name me.event#MOUSEMOVE
         */
        api.MOUSEMOVE = "me.game.pointermove";

        /**
         * Channel Constant for dragstart events on a Draggable entity <br>
         * Data passed:
         * {Object} the drag event <br>
         * {Object} the Draggable entity <br>
         * @public
         * @constant
         * @type String
         * @name me.event#DRAGSTART
         */
        api.DRAGSTART = "me.game.dragstart";

        /**
         * Channel Constant for dragend events on a Draggable entity <br>
         * Data passed:
         * {Object} the drag event <br>
         * {Object} the Draggable entity <br>
         * @public
         * @constant
         * @type String
         * @name me.event#DRAGEND
         */
        api.DRAGEND = "me.game.dragend";

        /**
         * Channel Constant for when the (browser) window is resized <br>
         * Data passed : {Event} Event object <br>
         * @public
         * @constant
         * @type String
         * @name me.event#WINDOW_ONRESIZE
         */
        api.WINDOW_ONRESIZE = "window.onresize";

        /**
         * Channel Constant for when the device is rotated <br>
         * Data passed : {Event} Event object <br>
         * @public
         * @constant
         * @type String
         * @name me.event#WINDOW_ONORIENTATION_CHANGE
         */
        api.WINDOW_ONORIENTATION_CHANGE = "window.orientationchange";

        /**
         * Channel Constant for when the (browser) window is scrolled <br>
         * Data passed : {Event} Event object <br>
         * @public
         * @constant
         * @type String
         * @name me.event#WINDOW_ONSCROLL
         */
        api.WINDOW_ONSCROLL = "window.onscroll";

        /**
         * Channel Constant for when the viewport position is updated <br>
         * Data passed : {me.Vector2d} viewport position vector <br>
         * @public
         * @constant
         * @type String
         * @name me.event#VIEWPORT_ONCHANGE
         */
        api.VIEWPORT_ONCHANGE = "viewport.onchange";

        /**
         * Publish some data on a channel
         * @name me.event#publish
         * @public
         * @function
         * @param {String} channel The channel to publish on
         * @param {Array} arguments The data to publish
         *
         * @example Publish stuff on '/some/channel'.
         * Anything subscribed will be called with a function
         * signature like: function (a,b,c){ ... }
         *
         * me.event.publish("/some/channel", ["a","b","c"]);
         *
         */
        api.publish = function (channel, args) {
            var subs = cache[channel],
                len = subs ? subs.length : 0;

            //can change loop or reverse array if the order matters
            while (len--) {
                subs[len].apply(window, args || []); // is window correct here?
            }
        };

        /**
         * Register a callback on a named channel.
         * @name me.event#subscribe
         * @public
         * @function
         * @param {String} channel The channel to subscribe to
         * @param {Function} callback The event handler, any time something is
         * published on a subscribed channel, the callback will be called
         * with the published array as ordered arguments
         * @return {handle} A handle which can be used to unsubscribe this
         * particular subscription
         * @example
         * me.event.subscribe("/some/channel", function (a, b, c){ doSomething(); });
         */

        api.subscribe = function (channel, callback) {
            if (!cache[channel]) {
                cache[channel] = [];
            }
            cache[channel].push(callback);
            return [ channel, callback ]; // Array
        };

        /**
         * Disconnect a subscribed function for a channel.
         * @name me.event#unsubscribe
         * @public
         * @function
         * @param {Array|String} handle The return value from a subscribe call or the
         * name of a channel as a String
         * @param {Function} [callback] The callback to be unsubscribed.
         * @example
         * var handle = me.event.subscribe("/some/channel", function (){});
         * me.event.unsubscribe(handle);
         *
         * // Or alternatively ...
         *
         * var callback = function (){};
         * me.event.subscribe("/some/channel", callback);
         * me.event.unsubscribe("/some/channel", callback);
         */
        api.unsubscribe = function (handle, callback) {
            var subs = cache[callback ? handle : handle[0]],
                len = subs ? subs.length : 0;

            callback = callback || handle[1];

            while (len--) {
                if (subs[len] === callback) {
                    subs.splice(len, 1);
                }
            }
        };

        // return our object
        return api;
    })();
})();

/*!
 *  howler.js v2.0.0-beta
 *  howlerjs.com
 *
 *  (c) 2013-2014, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

/* jshint -W003 */
/* jshint -W013 */
/* jshint -W015 */
/* jshint -W031 */
/* jshint -W083 */
/* jshint -W098 */
/* jshint -W108 */
/* jshint -W116 */

(function() {

  'use strict';

  // Setup our audio context.
  var ctx = null;
  var usingWebAudio = true;
  var noAudio = false;
  setupAudioContext();

  // Create a master gain node.
  if (usingWebAudio) {
    var masterGain = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Create the global controller. All contained methods and properties apply
   * to all sounds that are currently playing or will be in the future.
   */
  var HowlerGlobal = function() {
    this.init();
  };
  HowlerGlobal.prototype = {
    /**
     * Initialize the global Howler object.
     * @return {Howler}
     */
    init: function() {
      var self = this || Howler;

      // Internal properties.
      self._codecs = {};
      self._howls = [];
      self._muted = false;
      self._volume = 1;

      // Set to false to disable the auto iOS enabler.
      self.iOSAutoEnable = true;

      // No audio is available on this system if this is set to true.
      self.noAudio = noAudio;

      // This will be true if the Web Audio API is available.
      self.usingWebAudio = usingWebAudio;

      // Expose the AudioContext when using Web Audio.
      self.ctx = ctx;

      // Check for supported codecs.
      if (!noAudio) {
        self._setupCodecs();
      }

      return self;
    },

    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this || Howler;
      vol = parseFloat(vol);

      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        self._volume = vol;

        // When using Web Audio, we just need to adjust the master gain.
        if (usingWebAudio) {
          masterGain.gain.value = vol;
        }

        // Loop through and change volume for all HTML5 audio nodes.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and change the volumes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node) {
                sound._node.volume = sound._volume * vol;
              }
            }
          }
        }

        return self;
      }

      return self._volume;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    mute: function(muted) {
      var self = this || Howler;

      self._muted = muted;

      // With Web Audio, we just need to mute the master gain.
      if (usingWebAudio) {
        masterGain.gain.value = muted ? 0 : self._volume;
      }

      // Loop through and mute all HTML5 Audio nodes.
      for (var i=0; i<self._howls.length; i++) {
        if (!self._howls[i]._webAudio) {
          // Get all of the sounds in this Howl group.
          var ids = self._howls[i]._getSoundIds();

          // Loop through all sounds and mark the audio node as muted.
          for (var j=0; j<ids.length; j++) {
            var sound = self._howls[i]._soundById(ids[j]);

            if (sound && sound._node) {
              sound._node.muted = (muted) ? true : sound._muted;
            }
          }
        }
      }

      return self;
    },

    /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return (this || Howler)._codecs[ext];
    },

    /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */
    _setupCodecs: function() {
      var self = this || Howler;
      var audioTest = new Audio();

      self._codecs = {
        mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
        aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
        m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')
      };

      return self;
    },

    /**
     * iOS will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _enableiOSAudio: function() {
      var self = this || Howler;

      // Only run this on iOS if audio isn't already eanbled.
      if (ctx && (self._iOSEnabled || !/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
        return;
      }

      self._iOSEnabled = false;

      // Call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS.
      var unlock = function() {
        // Create an empty buffer.
        var buffer = ctx.createBuffer(1, 1, 22050);
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        // Play the empty buffer.
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // Setup a timeout to check that we are unlocked on the next event loop.
        setTimeout(function() {
          if ((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
            // Update the unlocked state and prevent this check from happening again.
            self._iOSEnabled = true;
            self.iOSAutoEnable = false;

            // Remove the touch start listener.
            window.removeEventListener('touchstart', unlock, false);
          }
        }, 0);
      };

      // Setup a touch start listener to attempt an unlock in.
      window.addEventListener('touchstart', unlock, false);

      return self;
    }
  };

  // Setup the global audio controller.
  var Howler = new HowlerGlobal();

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Create an audio group controller.
   * @param {Object} o Passed in properties for this group.
   */
  var Howl = function(o) {
    var self = this;

    // Throw an error if no source is provided
    if (!o.src) {
      console.error('An array of source files must be passed with any new Howl.');
      return;
    }

    self.init(o);
  };
  Howl.prototype = {
    /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */
    init: function(o) {
      var self = this;

      // Setup user-defined default properties.
      self._autoplay = o.autoplay || false;
      self._ext = o.ext || null;
      self._html5 = o.html5 || false;
      self._muted = o.mute || false;
      self._loop = o.loop || false;
      self._pool = o.pool || 5;
      self._preload = (typeof o.preload === 'boolean') ? o.preload : true;
      self._rate = o.rate || 1;
      self._sprite = o.sprite || {};
      self._src = (typeof o.src !== 'string') ? o.src : [o.src];
      self._volume = o.volume !== undefined ? o.volume : 1;

      // Setup all other default properties.
      self._duration = 0;
      self._loaded = false;
      self._sounds = [];
      self._endTimers = {};

      // Setup event listeners.
      self._onend = o.onend ? [{fn: o.onend}] : [];
      self._onfaded = o.onfaded ? [{fn: o.onfaded}] : [];
      self._onload = o.onload ? [{fn: o.onload}] : [];
      self._onloaderror = o.onloaderror ? [{fn: o.onloaderror}] : [];
      self._onpause = o.onpause ? [{fn: o.onpause}] : [];
      self._onplay = o.onplay ? [{fn: o.onplay}] : [];

      // Web Audio or HTML5 Audio?
      self._webAudio = usingWebAudio && !self._html5;

      // Automatically try to enable audio on iOS.
      if (typeof ctx !== 'undefined' && ctx && Howler.iOSAutoEnable) {
        Howler._enableiOSAudio();
      }

      // Keep track of this Howl group in the global controller.
      Howler._howls.push(self);

      // Load the source file unless otherwise specified.
      if (self._preload) {
        self.load();
      }

      return self;
    },

    /**
     * Load the audio file.
     * @return {Howler}
     */
    load: function() {
      var self = this;
      var url = null;

      // If no audio is available, quit immediately.
      if (noAudio) {
        self._emit('loaderror');
        return;
      }

      // Make sure our source is in an array.
      if (typeof self._src === 'string') {
        self._src = [self._src];
      }

      // Loop through the sources and pick the first one that is compatible.
      for (var i=0; i<self._src.length; i++) {
        var ext, str;

        if (self._ext && self._ext[i]) {
          // If an extension was specified, use that instead.
          ext = self._ext[i];
        } else {
          // Extract the file extension from the URL or base64 data URI.
          str = self._src[i];
          ext = /^data:audio\/([^;,]+);/i.exec(str);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          }
        }

        // Check if this extension is available.
        if (Howler.codecs(ext)) {
          url = self._src[i];
          break;
        }
      }

      if (!url) {
        self._emit('loaderror');
        return;
      }

      self._src = url;

      // Create a new sound object and add it to the pool.
      new Sound(self);

      // Load and decode the audio data for playback.
      if (self._webAudio) {
        loadBuffer(self);
      }

      return self;
    },

    /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite Sprite name for sprite playback or sound id to continue previous.
     * @return {Number}        Sound ID.
     */
    play: function(sprite) {
      var self = this;
      var id = null;

      // Determine if a sprite, sound id or nothing was passed
      if (typeof sprite === 'number') {
        id = sprite;
        sprite = null;
      } else if (typeof sprite === 'undefined') {
        // Use the default sound sprite (plays the full audio length).
        sprite = '__default';

        // Check if there is a single paused sound that isn't ended.
        // If there is, play that sound. If not, continue as usual.
        var num = 0;
        for (var i=0; i<self._sounds.length; i++) {
          if (self._sounds[i]._paused && !self._sounds[i]._ended) {
            num++;
            id = self._sounds[i]._id;
          }
        }

        if (num === 1) {
          sprite = null;
        } else {
          id = null;
        }
      }

      // Get the selected node, or get one from the pool.
      var sound = id ? self._soundById(id) : self._inactiveSound();
      if (id && !sprite) {
        sprite = sound._sprite || '__default';
      }

      // If the sound doesn't exist, do nothing.
      if (!sound) {
        return null;
      }

      // If we have no sprite and the sound hasn't loaded, we must wait
      // for the sound to load to get our audio's duration.
      if (!self._loaded && !self._sprite[sprite]) {
        self.once('load', function() {
          self.play(self._soundById(sound._id) ? sound._id : undefined);
        });
        return sound._id;
      }

      // Don't play the sound if an id was passed and it is already playing.
      if (id && !sound._paused) {
        return sound._id;
      }

      // Determine how long to play for and where to start playing.
      var seek = sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000;
      var duration = ((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek;

      // Create a timer to fire at the end of playback or the start of a new loop.
      var ended = function() {
        // Should this sound loop?
        var loop = !!(sound._loop || self._sprite[sprite][2]);

        // Fire the ended event.
        self._emit('end', sound._id);

        // Restart the playback for HTML5 Audio loop.
        if (!self._webAudio && loop) {
          self.stop(sound._id).play(sound._id);
        }

        // Restart this timer if on a Web Audio loop.
        if (self._webAudio && loop) {
          self._emit('play', sound._id);
          sound._seek = sound._start || 0;
          sound._playStart = ctx.currentTime;
          self._endTimers[sound._id] = setTimeout(ended, ((sound._stop - sound._start) * 1000) / Math.abs(self._rate));
        }

        // Mark the node as paused.
        if (self._webAudio && !loop) {
          sound._paused = true;
          sound._ended = true;
          sound._seek = sound._start || 0;
          self._clearTimer(sound._id);

          // Clean up the buffer source.
          sound._node.bufferSource = null;
        }

        // When using a sprite, end the track.
        if (!self._webAudio && !loop) {
          self.stop(sound._id);
        }
      };
      self._endTimers[sound._id] = setTimeout(ended, (duration * 1000) / Math.abs(self._rate));

      // Update the parameters of the sound
      sound._paused = false;
      sound._ended = false;
      sound._sprite = sprite;
      sound._seek = seek;
      sound._start = self._sprite[sprite][0] / 1000;
      sound._stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
      sound._loop = !!(sound._loop || self._sprite[sprite][2]);

      // Begin the actual playback.
      var node = sound._node;
      if (self._webAudio) {
        // Fire this when the sound is ready to play to begin Web Audio playback.
        var playWebAudio = function() {
          self._refreshBuffer(sound);

          // Setup the playback params.
          var vol = (sound._muted || self._muted) ? 0 : sound._volume * Howler.volume();
          node.gain.setValueAtTime(vol, ctx.currentTime);
          sound._playStart = ctx.currentTime;

          // Play the sound using the supported method.
          if (typeof node.bufferSource.start === 'undefined') {
            node.bufferSource.noteGrainOn(0, seek, duration);
          } else {
            node.bufferSource.start(0, seek, duration);
          }

          // Start a new timer if none is present.
          if (!self._endTimers[sound._id]) {
            self._endTimers[sound._id] = setTimeout(ended, (duration * 1000) / Math.abs(self._rate));
          }

          setTimeout(function() {
            self._emit('play', sound._id);
          }, 0);
        };

        if (self._loaded) {
          playWebAudio();
        } else {
          // Wait for the audio to load and then begin playback.
          self.once('load', playWebAudio);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      } else {
        // Fire this when the sound is ready to play to begin HTML5 Audio playback.
        var playHtml5 = function() {
          node.currentTime = seek;
          node.muted = sound._muted || self._muted || Howler._muted || node.muted;
          node.volume = sound._volume * Howler.volume();
          node.playbackRate = self._rate;
          setTimeout(function() {
            node.play();
            self._emit('play', sound._id);
          }, 0);
        };

        // Play immediately if ready, or wait for the 'canplaythrough'e vent.
        if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
          playHtml5();
        } else {
          var listener = function() {
            // Setup the new end timer.
            self._endTimers[sound._id] = setTimeout(ended, (duration * 1000) / Math.abs(self._rate));

            // Begin playback.
            playHtml5();

            // Clear this listener.
            node.removeEventListener('canplaythrough', listener, false);
          };
          node.addEventListener('canplaythrough', listener, false);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      }

      return sound._id;
    },

    /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // Wait for the sound to begin playing before pausing it.
      if (!self._loaded) {
        self.once('play', function() {
          self.pause(id);
        });

        return self;
      }

      // If no id is passed, get all ID's to be paused.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound && !sound._paused) {
          // Reset the seek position.
          sound._seek = self.seek(ids[i]);
          sound._paused = true;

          if (self._webAudio) {
            // make sure the sound has been created
            if (!sound._node.bufferSource) {
              return self;
            }

            if (typeof sound._node.bufferSource.stop === 'undefined') {
              sound._node.bufferSource.noteOff(0);
            } else {
              sound._node.bufferSource.stop(0);
            }

            // Clean up the buffer source.
            sound._node.bufferSource = null;
          } else if (!isNaN(sound._node.duration)) {
            sound._node.pause();
          }

          // Fire the pause event, unless `true` is passed as the 2nd argument.
          if (!arguments[1]) {
            self._emit('pause', sound._id);
          }
        }
      }

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @return {Howl}
     */
    stop: function(id) {
      var self = this;

      // Wait for the sound to begin playing before stopping it.
      if (!self._loaded) {
        if (typeof self._sounds[0]._sprite !== 'undefined') {
          self.once('play', function() {
            self.stop(id);
          });
        }

        return self;
      }

      // If no id is passed, get all ID's to be stopped.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound && !sound._paused) {
          // Reset the seek position.
          sound._seek = sound._start || 0;
          sound._paused = true;
          sound._ended = true;

          if (self._webAudio) {
            // make sure the sound has been created
            if (!sound._node.bufferSource) {
              return self;
            }

            if (typeof sound._node.bufferSource.stop === 'undefined') {
              sound._node.bufferSource.noteOff(0);
            } else {
              sound._node.bufferSource.stop(0);
            }

            // Clean up the buffer source.
            sound._node.bufferSource = null;
          } else if (!isNaN(sound._node.duration)) {
            sound._node.pause();
            sound._node.currentTime = sound._start || 0;
          }
        }
      }

      return self;
    },

    /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */
    mute: function(muted, id) {
      var self = this;

      // Wait for the sound to begin playing before muting it.
      if (!self._loaded) {
        self.once('play', function() {
          self.mute(muted, id);
        });

        return self;
      }

      // If applying mute/unmute to all sounds, update the group's value.
      if (typeof id === 'undefined') {
        if (typeof muted === 'boolean') {
          self._muted = muted;
        } else {
          return self._muted;
        }
      }

      // If no id is passed, get all ID's to be muted.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          sound._muted = muted;

          if (self._webAudio && sound._node) {
            sound._node.gain.setValueAtTime(muted ? 0 : sound._volume * Howler.volume(), ctx.currentTime);
          } else if (sound._node) {
            sound._node.muted = Howler._muted ? true : muted;
          }
        }
      }

      return self;
    },

    /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */
    volume: function() {
      var self = this;
      var args = arguments;
      var vol, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // Return the value of the groups' volume.
        return self._volume;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new volume.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          vol = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        vol = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the volume or return the current volume.
      var sound;
      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        // Wait for the sound to begin playing before changing the volume.
        if (!self._loaded) {
          self.once('play', function() {
            self.volume.apply(self, args);
          });

          return self;
        }

        // Set the group volume.
        if (typeof id === 'undefined') {
          self._volume = vol;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            sound._volume = vol;

            if (self._webAudio && sound._node) {
              sound._node.gain.setValueAtTime(vol * Howler.volume(), ctx.currentTime);
            } else if (sound._node) {
              sound._node.volume = vol * Howler.volume();
            }
          }
        }
      } else {
        sound = id ? self._soundById(id) : self._sounds[0];
        return sound ? sound._volume : 0;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes (if no id is passsed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */
    fade: function(from, to, len, id) {
      var self = this;

      // Wait for the sound to play before fading.
      if (!self._loaded) {
        self.once('play', function() {
          self.fade(from, to, len, id);
        });

        return self;
      }

      // Set the volume to the start position.
      self.volume(from, id);

      // Fade the volume of one or all sounds.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        // Create a linear fade or fall back to timeouts with HTML5 Audio.
        if (sound) {
          if (self._webAudio) {
            var currentTime = ctx.currentTime;
            var end = currentTime + (len / 1000);
            sound._volume = from;
            sound._node.gain.setValueAtTime(from, currentTime);
            sound._node.gain.linearRampToValueAtTime(to, end);

            // Fire the event when complete.
            setTimeout(function(id, sound) {
              setTimeout(function() {
                sound._volume = to;
                self._emit('faded', id);
              }, end - ctx.currentTime > 0 ? Math.ceil((end - ctx.currentTime) * 1000) : 0);
            }.bind(self, ids[i], sound), len);
          } else {
            var diff = Math.abs(from - to);
            var dir = from > to ? 'out' : 'in';
            var steps = diff / 0.01;
            var stepLen = len / steps;
            
            (function() {
              var vol = from;
              var interval = setInterval(function(id) {
                // Update the volume amount.
                vol += (dir === 'in' ? 0.01 : -0.01);

                // Make sure the volume is in the right bounds.
                vol = Math.max(0, vol);
                vol = Math.min(1, vol);

                // Round to within 2 decimal points.
                vol = Math.round(vol * 100) / 100;

                // Change the volume.
                self.volume(vol, id);

                // When the fade is complete, stop it and fire event.
                if (vol === to) {
                  clearInterval(interval);
                  self._emit('faded', id);
                }
              }.bind(self, ids[i]), stepLen);
            })();
          }
        }
      }

      return self;
    },

    /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */
    loop: function() {
      var self = this;
      var args = arguments;
      var loop, id, sound;

      // Determine the values for loop and id.
      if (args.length === 0) {
        // Return the grou's loop value.
        return self._loop;
      } else if (args.length === 1) {
        if (typeof args[0] === 'boolean') {
          loop = args[0];
          self._loop = loop;
        } else {
          // Return this sound's loop value.
          sound = self._soundById(parseInt(args[0], 10));
          return sound ? sound._loop : false;
        }
      } else if (args.length === 2) {
        loop = args[0];
        id = parseInt(args[1], 10);
      }

      // If no id is passed, get all ID's to be looped.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        sound = self._soundById(ids[i]);

        if (sound) {
          sound._loop = loop;
          if (self._webAudio && sound._node) {
            sound._node.bufferSource.loop = loop;
          }
        }
      }

      return self;
    },

    /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */
    seek: function() {
      var self = this;
      var args = arguments;
      var seek, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current position of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new seek position.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          id = self._sounds[0]._id;
          seek = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        seek = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // If there is no ID, bail out.
      if (typeof id === 'undefined') {
        return self;
      }

      // Wait for the sound to load before seeking it.
      if (!self._loaded) {
        self.once('load', function() {
          self.seek.apply(self, args);
        });

        return self;
      }

      // Get the sound.
      var sound = self._soundById(id);

      if (sound) {
        if (seek >= 0) {
          // Pause the sound and update position for restarting playback.
          var playing = self.playing(id);
          if (playing) {
            self.pause(id, true);
          }

          // Move the position of the track and cancel timer.
          sound._seek = seek;
          self._clearTimer(id);

          // Restart the playback if the sound was playing.
          if (playing) {
            self.play(id);
          }
        } else {
          return (self._webAudio) ? sound._seek + (ctx.currentTime - sound._playStart) : sound._node.currentTime;
        }
      }

      return self;
    },

    /**
     * Check if a specific sound is currently playing or not.
     * @param  {Number} id The sound id to check. If none is passed, first sound is used.
     * @return {Boolean}    True if playing and false if not.
     */
    playing: function(id) {
      var self = this;
      var sound = self._soundById(id) || self._sounds[0];

      return sound ? !sound._paused : false;
    },

    /**
     * Get the duration of this sound.
     * @return {Number} Audio duration.
     */
    duration: function() {
      return this._duration;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */
    unload: function() {
      var self = this;

      // Stop playing any active sounds.
      var sounds = self._sounds;
      for (var i=0; i<sounds.length; i++) {
        // Stop the sound if it is currently playing.
        if (!sounds[i]._paused) {
          self.stop(sounds[i]._id);
          self._emit('end', sounds[i]._id);
        }

        // Remove the source or disconnect.
        if (!self._webAudio) {
          // Set the source to an empty string to stop any downloading.
          sounds[i]._node.src = '';

          // Remove any event listeners.
          sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);
          sounds[i]._node.removeEventListener('canplaythrough', sounds[i]._loadFn, false);
        }

        // Empty out all of the nodes.
        delete sounds[i]._node;

        // Make sure all timers are cleared out.
        self._clearTimer(sounds[i]._id);

        // Remove the references in the global Howler object.
        var index = Howler._howls.indexOf(self);
        if (index >= 0) {
          Howler._howls.splice(index, 1);
        }
      }

      // Delete this sound from the cache.
      if (cache) {
        delete cache[self._src];
      }

      // Clear out `self`.
      self = null;

      return null;
    },

    /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    on: function(event, fn, id) {
      var self = this;
      var events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push({id: id, fn: fn});
      }

      return self;
    },

    /**
     * Remove a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */
    off: function(event, fn, id) {
      var self = this;
      var events = self['_on' + event];

      if (fn) {
        // Loop through event store and remove the passed function.
        for (var i=0; i<events.length; i++) {
          if (fn === events[i].fn && id === events[i].id) {
            events.splice(i, 1);
            break;
          }
        }
      } else {
        // Clear out all events of this type.
        events = [];
      }

      return self;
    },

    /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    once: function(event, fn, id) {
      var self = this;

      // Create the listener method.
      var listener = function() {
        // Call the passed function.
        fn.apply(self, arguments);

        // Clear the listener.
        self.off(event, listener, id);
      };

      // Setup the event listener.
      self.on(event, listener, id);

      return self;
    },

    /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */
    _emit: function(event, id, msg) {
      var self = this;
      var events = self['_on' + event];
      
      // Loop through event store and fire all functions.
      for (var i=0; i<events.length; i++) {
        if (!events[i].id || events[i].id === id) {
          setTimeout(function(fn) {
            fn.call(this, id, msg);
          }.bind(self, events[i].fn), 0);
        }
      }

      return self;
    },

    /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */
    _clearTimer: function(id) {
      var self = this;

      if (self._endTimers[id]) {
        clearTimeout(self._endTimers[id]);
        delete self._endTimers[id];
      }

      return self;
    },

    /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */
    _soundById: function(id) {
      var self = this;

      // Loop through all sounds and find the one with this ID.
      for (var i=0; i<self._sounds.length; i++) {
        if (id === self._sounds[i]._id) {
          return self._sounds[i];
        }
      }

      return null;
    },

    /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */
    _inactiveSound: function() {
      var self = this;

      self._drain();

      // Find the first inactive node to recycle.
      for (var i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          return self._sounds[i].reset();
        }
      }

      // If no inactive node was found, create a new one.
      return new Sound(self);
    },

    /**
     * Drain excess inactive sounds from the pool.
     */
    _drain: function() {
      var self = this;
      var limit = self._pool;
      var cnt = 0;
      var i = 0;

      // If there are less sounds than the max pool size, we are done.
      if (self._sounds.length < limit) {
        return;
      }

      // Count the number of inactive sounds.
      for (i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          cnt++;
        }
      }

      // Remove excess inactive sounds, going in reverse order.
      for (i=self._sounds.length - 1; i>=0; i--) {
        if (cnt <= limit) {
          return;
        }

        if (self._sounds[i]._ended) {
          // Disconnect the audio source when using Web Audio.
          if (self._webAudio && self._sounds[i]._node) {
            self._sounds[i]._node.disconnect(0);
          }

          // Remove sounds until we have the pool size.
          self._sounds.splice(i, 1);
          cnt--;
        }
      }
    },

    /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */
    _getSoundIds: function(id) {
      var self = this;

      if (typeof id === 'undefined') {
        var ids = [];
        for (var i=0; i<self._sounds.length; i++) {
          ids.push(self._sounds[i]._id);
        }

        return ids;
      } else {
        return [id];
      }
    },

    /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _refreshBuffer: function(sound) {
      var self = this;

      // Setup the buffer source for playback.
      sound._node.bufferSource = ctx.createBufferSource();
      sound._node.bufferSource.buffer = cache[self._src];

      // Connect to the correct node.
      if (sound._panner) {
        sound._node.bufferSource.connect(sound._panner);
      } else {
        sound._node.bufferSource.connect(sound._node);
      }

      // Setup looping and playback rate.
      sound._node.bufferSource.loop = sound._loop;
      if (sound._loop) {
        sound._node.bufferSource.loopStart = sound._start || 0;
        sound._node.bufferSource.loopEnd = sound._stop;
      }
      sound._node.bufferSource.playbackRate.value = self._rate;

      return self;
    }
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Setup the sound object, which each node attached to a Howl group is contained in.
   * @param {Object} howl The Howl parent group.
   */
  var Sound = function(howl) {
    this._parent = howl;
    this.init();
  };
  Sound.prototype = {
    /**
     * Initialize a new Sound object.
     * @return {Sound}
     */
    init: function() {
      var self = this;
      var parent = self._parent;

      // Setup the default parameters.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._muted = parent._muted;
      self._seek = 0;
      self._paused = true;
      self._ended = true;

      // Generate a unique ID for this sound.
      self._id = Math.round(Date.now() * Math.random());

      // Add itself to the parent's pool.
      parent._sounds.push(self);

      // Create the new node.
      self.create();

      return self;
    },

    /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */
    create: function() {
      var self = this;
      var parent = self._parent;
      var volume = (Howler._muted || self._muted || self._parent._muted) ? 0 : self._volume * Howler.volume();

      if (parent._webAudio) {
        // Create the gain node for controlling volume (the source will connect to this).
        self._node = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
        self._node.gain.setValueAtTime(volume, ctx.currentTime);
        self._node.paused = true;
        self._node.connect(masterGain);
      } else {
        self._node = new Audio();

        // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
        self._errorFn = self._errorListener.bind(self);
        self._node.addEventListener('error', self._errorFn, false);

        // Listen for 'canplaythrough' event to let us know the sound is ready.
        self._loadFn = self._loadListener.bind(self);
        self._node.addEventListener('canplaythrough', self._loadFn, false);

        // Setup the new audio node.
        self._node.src = parent._src;
        self._node.preload = 'auto';
        self._node.volume = volume;

        // Begin loading the source.
        self._node.load();
      }

      return self;
    },

    /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */
    reset: function() {
      var self = this;
      var parent = self._parent;

      // Reset all of the parameters of this sound.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._muted = parent._muted;
      self._seek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = null;

      // Generate a new ID so that it isn't confused with the previous sound.
      self._id = Math.round(Date.now() * Math.random());

      return self;
    },

    /**
     * HTML5 Audio error listener callback.
     */
    _errorListener: function() {
      var self = this;

      if (self._node.error && self._node.error.code === 4) {
        Howler.noAudio = true;
      }

      // Fire an error event and pass back the code.
      self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0);
      
      // Clear the event listener.
      self._node.removeEventListener('error', self._errorListener, false);
    },

    /**
     * HTML5 Audio canplaythrough listener callback.
     */
    _loadListener: function() {
      var self = this;
      var parent = self._parent;

      // Round up the duration to account for the lower precision in HTML5 Audio.
      parent._duration = Math.ceil(self._node.duration * 10) / 10;

      // Setup a sprite if none is defined.
      if (Object.keys(parent._sprite).length === 0) {
        parent._sprite = {__default: [0, parent._duration * 1000]};
      }

      if (!parent._loaded) {
        parent._loaded = true;
        parent._emit('load');
      }

      if (parent._autoplay) {
        parent.play();
      }

      // Clear the event listener.
      self._node.removeEventListener('canplaythrough', self._loadListener, false);
    }
  };

  /** Helper Methods **/
  /***************************************************************************/

  // Only define these methods when using Web Audio.
  if (usingWebAudio) {

    var cache = {};

    /**
     * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
     * @param  {Howl} self
     */
    var loadBuffer = function(self) {
      var url = self._src;

      // Check if the buffer has already been cached and use it instead.
      if (cache[url]) {
        // Set the duration from the cache.
        self._duration = cache[url].duration;

        // Load the sound into this Howl.
        loadSound(self);

        return;
      }

      if (/^data:[^;]+;base64,/.test(url)) {
        // Decode the base64 data URI without XHR, since some browsers don't support it.
        var data = atob(url.split(',')[1]);
        var dataView = new Uint8Array(data.length);
        for (var i=0; i<data.length; ++i) {
          dataView[i] = data.charCodeAt(i);
        }
        
        decodeAudioData(dataView.buffer, self);
      } else {
        // Load the buffer from the URL.
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          decodeAudioData(xhr.response, self);
        };
        xhr.onerror = function() {
          // If there is an error, switch to HTML5 Audio.
          if (self._webAudio) {
            self._html5 = true;
            self._webAudio = false;
            self._sounds = [];
            delete cache[url];
            self.load();
          }
        };
        safeXhrSend(xhr);
      }
    };

    /**
     * Send the XHR request wrapped in a try/catch.
     * @param  {Object} xhr XHR to send.
     */
    var safeXhrSend = function(xhr) {
      try {
        xhr.send();
      } catch (e) {
        xhr.onerror();
      }
    };

    /**
     * Decode audio data from an array buffer.
     * @param  {ArrayBuffer} arraybuffer The audio data.
     * @param  {Howl}        self
     */
    var decodeAudioData = function(arraybuffer, self) {
      // Decode the buffer into an audio source.
      ctx.decodeAudioData(arraybuffer, function(buffer) {
        if (buffer) {
          cache[self._src] = buffer;
          loadSound(self, buffer);
        }
      }, function() {
        self._emit('loaderror');
      });
    };

    /**
     * Sound is now loaded, so finish setting everything up and fire the loaded event.
     * @param  {Howl} self
     * @param  {Object} buffer The decoded buffer sound source.
     */
    var loadSound = function(self, buffer) {
      // Set the duration.
      if (buffer && !self._duration) {
        self._duration = buffer.duration;
      }

      // Setup a sprite if none is defined.
      if (Object.keys(self._sprite).length === 0) {
        self._sprite = {__default: [0, self._duration * 1000]};
      }

      // Fire the loaded event.
      if (!self._loaded) {
        self._loaded = true;
        self._emit('load');
      }

      // Begin playback if specified.
      if (self._autoplay) {
        self.play();
      }
    };

  }

  /**
   * Setup the audio context when available, or switch to HTML5 Audio mode.
   */
  function setupAudioContext() {
    try {
      if (typeof AudioContext !== 'undefined') {
        ctx = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        ctx = new webkitAudioContext();
      } else {
        usingWebAudio = false;
      }
    } catch(e) {
      usingWebAudio = false;
    }

    if (!usingWebAudio) {
      if (typeof Audio !== 'undefined') {
        try {
          new Audio();
        } catch(e) {
          noAudio = true;
        }
      } else {
        noAudio = true;
      }
    }
  }

  // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
  if (typeof define === 'function' && define.amd) {
    define('howler', function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  }

  // Add support for CommonJS libraries such as browserify.
  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // Define globally in case AMD is not available or unused.
  if (typeof window !== 'undefined') {
    window.HowlerGlobal = HowlerGlobal;
    window.Howler = Howler;
    window.Howl = Howl;
    window.Sound = Sound;
  }
})();
/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 */
(function () {
    /**
     * There is no constructor function for me.plugin
     * @namespace me.plugin
     * @memberOf me
     */
    me.plugin = (function () {

        // hold public stuff inside the singleton
        var singleton = {};

        /*--------------
            PUBLIC
          --------------*/

        /**
        * a base Object for plugin <br>
        * plugin must be installed using the register function
        * @see me.plugin
        * @class
        * @extends Object
        * @name plugin.Base
        * @memberOf me
        * @constructor
        */
        singleton.Base = Object.extend(
        /** @scope me.plugin.Base.prototype */
        {
            /** @ignore */
            init : function () {
                /**
                 * define the minimum required version of melonJS<br>
                 * this can be overridden by the plugin
                 * @public
                 * @type String
                 * @default "2.0.2"
                 * @name me.plugin.Base#version
                 */
                this.version = "2.0.2";
            }
        });

        /**
         * patch a melonJS function
         * @name patch
         * @memberOf me.plugin
         * @public
         * @function
         * @param {Object} proto target object
         * @param {String} name target function
         * @param {Function} fn replacement function
         * @example
         * // redefine the me.game.update function with a new one
         * me.plugin.patch(me.game, "update", function () {
         *   // display something in the console
         *   console.log("duh");
         *   // call the original me.game.update function
         *   this._patched();
         * });
         */
        singleton.patch = function (proto, name, fn) {
            // use the object prototype if possible
            if (typeof proto.prototype !== "undefined") {
                proto = proto.prototype;
            }
            // reuse the logic behind Object.extend
            if (typeof(proto[name]) === "function") {
                // save the original function
                var _parent = proto[name];
                // override the function with the new one
                Object.defineProperty(proto, name, {
                    "configurable" : true,
                    "value" : (function (name, fn) {
                        return function () {
                            this._patched = _parent;
                            var ret = fn.apply(this, arguments);
                            this._patched = null;
                            return ret;
                        };
                    })(name, fn)
                });
            }
            else {
                console.error(name + " is not an existing function");
            }
        };

        /**
         * Register a plugin.
         * @name register
         * @memberOf me.plugin
         * @see me.plugin.Base
         * @public
         * @function
         * @param {me.plugin.Base} plugin Plugin to instiantiate and register
         * @param {String} name
         * @param {} [arguments...] all extra parameters will be passed to the plugin constructor
         * @example
         * // register a new plugin
         * me.plugin.register(TestPlugin, "testPlugin");
         * // the plugin then also become available
         * // under then me.plugin namespace
         * me.plugin.testPlugin.myfunction ();
         */
        singleton.register = function (plugin, name) {
            // ensure me.plugin[name] is not already "used"
            if (me.plugin[name]) {
                console.error("plugin " + name + " already registered");
            }

            // get extra arguments
            var _args = [];
            if (arguments.length > 2) {
                // store extra arguments if any
                _args = Array.prototype.slice.call(arguments, 1);
            }

            // try to instantiate the plugin
            _args[0] = plugin;
            me.plugin[name] = new (plugin.bind.apply(plugin, _args))();

            // inheritance check
            if (!me.plugin[name] || !(me.plugin[name] instanceof me.plugin.Base)) {
                throw new me.Error("Plugin should extend the me.plugin.Base Class !");
            }

            // compatibility testing
            if (me.sys.checkVersion(me.plugin[name].version) > 0) {
                throw new me.Error("Plugin version mismatch, expected: " + me.plugin[name].version + ", got: " + me.version);
            }
        };

        // return our singleton
        return singleton;
    })();
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 * @desc Used to make a game entity draggable
 */
me.DraggableEntity = (function (Entity, Input, Event, Vector) {
    "use strict";

    return Entity.extend({
        /**
         * Constructor
         * @name init
         * @memberOf me.DraggableEntity
         * @function
         * @param {Number} x the x postion of the entity
         * @param {Number} y the y postion of the entity
         * @param {Object} settings the additional entity settings
         */
        init: function (x, y, settings) {
            Entity.prototype.init.apply(this, [x, y, settings]);
            this.dragging = false;
            this.dragId = null;
            this.grabOffset = new Vector(0, 0);
            this.onPointerEvent = Input.registerPointerEvent;
            this.removePointerEvent = Input.releasePointerEvent;
            this.initEvents();
        },

        /**
         * Initializes the events the modules needs to listen to
         * It translates the pointer events to me.events
         * in order to make them pass through the system and to make
         * this module testable. Then we subscribe this module to the
         * transformed events.
         * @name init
         * @memberOf me.DraggableEntity
         * @function
         */
        initEvents: function () {
            var self = this;
            this.mouseDown = function (e) {
                this.translatePointerEvent(e, Event.DRAGSTART);
            };
            this.mouseUp = function (e) {
                this.translatePointerEvent(e, Event.DRAGEND);
            };
            this.onPointerEvent("pointerdown", this, this.mouseDown.bind(this));
            this.onPointerEvent("pointerup", this, this.mouseUp.bind(this));
            Event.subscribe(Event.MOUSEMOVE, this.dragMove.bind(this));
            Event.subscribe(Event.DRAGSTART, function (e, draggable) {
                if (draggable === self) {
                    self.dragStart(e);
                }
            });
            Event.subscribe(Event.DRAGEND, function (e, draggable) {
                if (draggable === self) {
                    self.dragEnd(e);
                }
            });
        },

        /**
         * Translates a pointer event to a me.event
         * @name init
         * @memberOf me.DraggableEntity
         * @function
         * @param {Object} e the pointer event you want to translate
         * @param {String} translation the me.event you want to translate
         * the event to
         */
        translatePointerEvent: function (e, translation) {
            Event.publish(translation, [e, this]);
        },

        /**
         * Gets called when the user starts dragging the entity
         * @name dragStart
         * @memberOf me.DraggableEntity
         * @function
         * @param {Object} x the pointer event
         */
        dragStart: function (e) {
            if (this.dragging === false) {
                this.dragging = true;
                this.dragId = e.pointerId;
                this.grabOffset.set(e.gameX, e.gameY);
                this.grabOffset.sub(this.pos);
                return false;
            }
        },

        /**
         * Gets called when the user drags this entity around
         * @name dragMove
         * @memberOf me.DraggableEntity
         * @function
         * @param {Object} x the pointer event
         */
        dragMove: function (e) {
            if (this.dragging === true) {
                if (this.dragId === e.pointerId) {
                    this.pos.set(e.gameX, e.gameY);
                    this.pos.sub(this.grabOffset);
                }
            }
        },

        /**
         * Gets called when the user stops dragging the entity
         * @name dragEnd
         * @memberOf me.DraggableEntity
         * @function
         * @param {Object} x the pointer event
         */
        dragEnd: function () {
            if (this.dragging === true) {
                this.pointerId = undefined;
                this.dragging = false;
                return false;
            }
        },

        /**
         * Destructor
         * @name destroy
         * @memberOf me.DraggableEntity
         * @function
         */
        destroy: function () {
            Event.unsubscribe(Event.MOUSEMOVE, this.dragMove);
            Event.unsubscribe(Event.DRAGSTART, this.dragStart);
            Event.unsubscribe(Event.DRAGEND, this.dragEnd);
            this.removePointerEvent("pointerdown", this);
            this.removePointerEvent("pointerup", this);
        }
    });
}(me.Entity, me.input, me.event, me.Vector2d));

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2013, Olivier BIOT
 * http://www.melonjs.org
 * @desc Used to make a game entity a droptarget
 */
me.DroptargetEntity = (function (Entity, Event) {
    "use strict";

    return Entity.extend({
        /**
         * Constructor
         * @name init
         * @memberOf me.DroptargetEntity
         * @function
         * @param {Number} x the x postion of the entity
         * @param {Number} y the y postion of the entity
         * @param {Object} settings the additional entity settings
         */
        init: function (x, y, settings) {
            /**
             * constant for the overlaps method
             * @public
             * @constant
             * @type String
             * @name CHECKMETHOD_OVERLAP
             * @memberOf me.DroptargetEntity
             */
            this.CHECKMETHOD_OVERLAP = "overlaps";
            /**
             * constant for the contains method
             * @public
             * @constant
             * @type String
             * @name CHECKMETHOD_CONTAINS
             * @memberOf me.DroptargetEntity
             */
            this.CHECKMETHOD_CONTAINS = "contains";
            /**
             * the checkmethod we want to use
             * @public
             * @constant
             * @type String
             * @name checkMethod
             * @memberOf me.DroptargetEntity
             */
            this.checkMethod = null;
            Entity.prototype.init.apply(this, [x, y, settings]);
            Event.subscribe(Event.DRAGEND, this.checkOnMe.bind(this));
            this.checkMethod = this[this.CHECKMETHOD_OVERLAP];
        },

        /**
         * Sets the collision method which is going to be used to check a valid drop
         * @name setCheckMethod
         * @memberOf me.DroptargetEntity
         * @function
         * @param {Constant} checkMethod the checkmethod (defaults to CHECKMETHOD_OVERLAP)
         */
        setCheckMethod: function (checkMethod) {
            //  We can improve this check,
            //  because now you can use every method in theory
            if (typeof(this[checkMethod]) !== "undefined") {
                this.checkMethod = this[checkMethod];
            }
        },

        /**
         * Checks if a dropped entity is dropped on the current entity
         * @name checkOnMe
         * @memberOf me.DroptargetEntity
         * @function
         * @param {Object} draggableEntity the draggable entity that is dropped
         */
        checkOnMe: function (e, draggableEntity) {
            if (draggableEntity && this.checkMethod(draggableEntity.getBounds().translateV(draggableEntity.pos))) {
                // call the drop method on the current entity
                this.drop(draggableEntity);
            }
        },

        /**
         * Gets called when a draggable entity is dropped on the current entity
         * @name drop
         * @memberOf me.DroptargetEntity
         * @function
         * @param {Object} draggableEntity the draggable entity that is dropped
         */
        drop: function () {},

        /**
         * Destructor
         * @name destroy
         * @memberOf me.DroptargetEntity
         * @function
         */
        destroy: function () {
            Event.unsubscribe(Event.DRAGEND, this.checkOnMe);
        }
    });
}(me.Entity, me.event));

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    // generate a default image for the particles
    var pixel = (function () {
        var canvas = me.video.createCanvas(1, 1);
        var context = me.CanvasRenderer.getContext2d(canvas);
        context.fillStyle = "#fff";
        context.fillRect(0, 0, 1, 1);
        return canvas;
    })();

    /**
     * me.ParticleEmitterSettings contains the default settings for me.ParticleEmitter.<br>
     *
     * @protected
     * @class
     * @memberOf me
     * @see me.ParticleEmitter
     */
    me.ParticleEmitterSettings = {
        /**
         * Width of the particle spawn area.<br>
         * @public
         * @type Number
         * @name width
         * @memberOf me.ParticleEmitterSettings
         * @default 0
         */
        width : 0,

        /**
         * Height of the particle spawn area.<br>
         * @public
         * @type Number
         * @name height
         * @memberOf me.ParticleEmitterSettings
         * @default 0
         */
        height : 0,

        /**
         * Image used for particles.<br>
         * @public
         * @type CanvasImageSource
         * @name image
         * @memberOf me.ParticleEmitterSettings
         * @default 1x1 white pixel
         * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#canvasimagesource
         */
        image : pixel,

        /**
         * Total number of particles in the emitter.<br>
         * @public
         * @type Number
         * @name totalParticles
         * @default 50
         * @memberOf me.ParticleEmitterSettings
         */
        totalParticles : 50,

        /**
         * Start angle for particle launch in Radians.<br>
         * @public
         * @type Number
         * @name angle
         * @default Math.PI / 2
         * @memberOf me.ParticleEmitterSettings
         */
        angle : Math.PI / 2,

        /**
         * Variation in the start angle for particle launch in Radians.<br>
         * @public
         * @type Number
         * @name angleVariation
         * @default 0
         * @memberOf me.ParticleEmitterSettings
         */
        angleVariation : 0,

        /**
         * Minimum time each particle lives once it is emitted in ms.<br>
         * @public
         * @type Number
         * @name minLife
         * @default 1000
         * @memberOf me.ParticleEmitterSettings
         */
        minLife : 1000,

        /**
         * Maximum time each particle lives once it is emitted in ms.<br>
         * @public
         * @type Number
         * @name maxLife
         * @default 3000
         * @memberOf me.ParticleEmitterSettings
         */
        maxLife : 3000,

        /**
         * Start speed of particles.<br>
         * @public
         * @type Number
         * @name speed
         * @default 2
         * @memberOf me.ParticleEmitterSettings
         */
        speed : 2,

        /**
         * Variation in the start speed of particles.<br>
         * @public
         * @type Number
         * @name speedVariation
         * @default 1
         * @memberOf me.ParticleEmitterSettings
         */
        speedVariation : 1,

        /**
         * Minimum start rotation for particles sprites in Radians.<br>
         * @public
         * @type Number
         * @name minRotation
         * @default 0
         * @memberOf me.ParticleEmitterSettings
         */
        minRotation : 0,

        /**
         * Maximum start rotation for particles sprites in Radians.<br>
         * @public
         * @type Number
         * @name maxRotation
         * @default 0
         * @memberOf me.ParticleEmitterSettings
         */
        maxRotation : 0,

        /**
         * Minimum start scale ratio for particles (1 = no scaling).<br>
         * @public
         * @type Number
         * @name minStartScale
         * @default 1
         * @memberOf me.ParticleEmitterSettings
         */
        minStartScale : 1,

        /**
         * Maximum start scale ratio for particles (1 = no scaling).<br>
         * @public
         * @type Number
         * @name maxStartScale
         * @default 1
         * @memberOf me.ParticleEmitterSettings
         */
        maxStartScale : 1,

        /**
         * Minimum end scale ratio for particles.<br>
         * @public
         * @type Number
         * @name minEndScale
         * @default 0
         * @memberOf me.ParticleEmitterSettings
         */
        minEndScale : 0,

        /**
         * Maximum end scale ratio for particles.<br>
         * @public
         * @type Number
         * @name maxEndScale
         * @default 0
         * @memberOf me.ParticleEmitterSettings
         */
        maxEndScale : 0,

        /**
         * Vertical force (Gravity) for each particle.<br>
         * @public
         * @type Number
         * @name gravity
         * @default 0
         * @memberOf me.ParticleEmitterSettings
         * @see me.sys.gravity
         */
        gravity : 0,

        /**
         * Horizontal force (like a Wind) for each particle.<br>
         * @public
         * @type Number
         * @name wind
         * @default 0
         * @memberOf me.ParticleEmitterSettings
         */
        wind : 0,

        /**
         * Update the rotation of particle in accordance the particle trajectory.<br>
         * The particle sprite should aim at zero angle (draw from left to right).<br>
         * Override the particle minRotation and maxRotation.<br>
         * @public
         * @type Boolean
         * @name followTrajectory
         * @default false
         * @memberOf me.ParticleEmitterSettings
         */
        followTrajectory : false,

        /**
         * Enable the Texture Additive by canvas composite operation (lighter).<br>
         * WARNING: Composite Operation may decreases performance!.<br>
         * @public
         * @type Boolean
         * @name textureAdditive
         * @default false
         * @memberOf me.ParticleEmitterSettings
         */
        textureAdditive : false,

        /**
         * Update particles only in the viewport, remove it when out of viewport.<br>
         * @public
         * @type Boolean
         * @name onlyInViewport
         * @default true
         * @memberOf me.ParticleEmitterSettings
         */
        onlyInViewport : true,

        /**
         * Render particles in screen space. <br>
         * @public
         * @type Boolean
         * @name floating
         * @default false
         * @memberOf me.ParticleEmitterSettings
         */
        floating : false,

        /**
         * Maximum number of particles launched each time in this emitter (used only if emitter is Stream).<br>
         * @public
         * @type Number
         * @name maxParticles
         * @default 10
         * @memberOf me.ParticleEmitterSettings
         */
        maxParticles : 10,

        /**
         * How often a particle is emitted in ms (used only if emitter is Stream).<br>
         * Necessary that value is greater than zero.<br>
         * @public
         * @type Number
         * @name frequency
         * @default 100
         * @memberOf me.ParticleEmitterSettings
         */
        frequency : 100,

        /**
         * Duration that the emitter releases particles in ms (used only if emitter is Stream).<br>
         * After this period, the emitter stop the launch of particles.<br>
         * @public
         * @type Number
         * @name duration
         * @default Infinity
         * @memberOf me.ParticleEmitterSettings
         */
        duration : Infinity,

        /**
         * Skip n frames after updating the particle system once. <br>
         * This can be used to reduce the performance impact of emitters with many particles.<br>
         * @public
         * @type Number
         * @name framesToSkip
         * @default 0
         * @memberOf me.ParticleEmitterSettings
         */
        framesToSkip : 0
    };

    /**
     * Particle Emitter Object.
     * @class
     * @extends Rect
     * @memberOf me
     * @constructor
     * @param {Number} x x-position of the particle emitter
     * @param {Number} y y-position of the particle emitter
     * @param {object} settings An object containing the settings for the particle emitter. See {@link me.ParticleEmitterSettings}
     * @example
     *
     * // Create a basic emitter at position 100, 100
     * var emitter = new me.ParticleEmitter(100, 100);
     *
     * // Adjust the emitter properties
     * emitter.totalParticles = 200;
     * emitter.minLife = 1000;
     * emitter.maxLife = 3000;
     * emitter.z = 10;
     *
     * // Add the emitter to the game world
     * me.game.world.addChild(emitter);
     * me.game.world.addChild(emitter.container);
     *
     * // Launch all particles one time and stop, like a explosion
     * emitter.burstParticles();
     *
     * // Launch constantly the particles, like a fountain
     * emitter.streamParticles();
     *
     * // At the end, remove emitter from the game world
     * // call this in onDestroyEvent function
     * me.game.world.removeChild(emitter);
     * me.game.world.removeChild(emitter.container);
     *
     */
    me.ParticleEmitter = me.Rect.extend(
    /** @scope me.ParticleEmitter.prototype */
    {
        /**
         * @ignore
         */
        init: function (x, y, settings) {
            // Emitter is Stream, launch particles constantly
            /** @ignore */
            this._stream = false;

            // Frequency timer (in ms) for emitter launch new particles
            // used only in stream emitter
            /** @ignore */
            this._frequencyTimer = 0;

            // Time of live (in ms) for emitter launch new particles
            // used only in stream emitter
            /** @ignore */
            this._durationTimer = 0;

            // Emitter is emitting particles
            /** @ignore */
            this._enabled = false;
            // Emitter will always update
            this.isRenderable = false;
            // call the super constructor
            me.Rect.prototype.init.apply(this,
                [x, y,
                Infinity,
                Infinity]
            );

            // don't sort the particles by z-index
            this.autoSort = false;

            this.container = new me.ParticleContainer(this);

            /**
             * Z-order for particles, value is forwarded to the particle container <br>
             * @type Number
             * @name z
             * @memberOf me.ParticleEmitter
             */
            Object.defineProperty(this, "z", {
                get : function () { return this.container.z; },
                set : function (value) { this.container.z = value; },
                enumerable : true,
                configurable : true
            });

            /**
             * Floating property for particles, value is forwarded to the particle container <br>
             * @type Boolean
             * @name floating
             * @memberOf me.ParticleEmitter
             */
            Object.defineProperty(this, "floating", {
                get : function () { return this.container.floating; },
                set : function (value) { this.container.floating = value; },
                enumerable : true,
                configurable : true
            });

            // Reset the emitter to defaults
            this.reset(settings);
        },

        destroy: function () {
            this.reset();
        },

        /**
         * returns a random point inside the bounds for this emitter
         * @name getRandomPoint
         * @memberOf me.ParticleEmitter
         * @function
         * @return {me.Vector2d} new vector
         */
        getRandomPoint: function () {
            var vector = this.pos.clone();
            vector.x += (0).randomFloat(this.width);
            vector.y += (0).randomFloat(this.height);
            return vector;
        },

        /**
         * Reset the emitter with default values.<br>
         * @function
         * @param {Object} settings [optional] object with emitter settings. See {@link me.ParticleEmitterSettings}
         * @name reset
         * @memberOf me.ParticleEmitter
         */
        reset: function (settings) {
            // check if settings exists and create a dummy object if necessary
            settings = settings || {};
            var defaults = me.ParticleEmitterSettings;

            var width = (typeof settings.width === "number") ? settings.width : defaults.width;
            var height = (typeof settings.height === "number") ? settings.height : defaults.height;
            this.resize(width, height);

            this.image = settings.image || defaults.image;
            this.totalParticles = (typeof settings.totalParticles === "number") ? settings.totalParticles : defaults.totalParticles;
            this.angle = (typeof settings.angle === "number") ? settings.angle : defaults.angle;
            this.angleVariation = (typeof settings.angleVariation === "number") ? settings.angleVariation : defaults.angleVariation;
            this.minLife = (typeof settings.minLife === "number") ? settings.minLife : defaults.minLife;
            this.maxLife = (typeof settings.maxLife === "number") ? settings.maxLife : defaults.maxLife;
            this.speed = (typeof settings.speed === "number") ? settings.speed : defaults.speed;
            this.speedVariation = (typeof settings.speedVariation === "number") ? settings.speedVariation : defaults.speedVariation;
            this.minRotation = (typeof settings.minRotation === "number") ? settings.minRotation : defaults.minRotation;
            this.maxRotation = (typeof settings.maxRotation === "number") ? settings.maxRotation : defaults.maxRotation;
            this.minStartScale = (typeof settings.minStartScale === "number") ? settings.minStartScale : defaults.minStartScale;
            this.maxStartScale = (typeof settings.maxStartScale === "number") ? settings.maxStartScale : defaults.maxStartScale;
            this.minEndScale = (typeof settings.minEndScale === "number") ? settings.minEndScale : defaults.minEndScale;
            this.maxEndScale = (typeof settings.maxEndScale === "number") ? settings.maxEndScale : defaults.maxEndScale;
            this.gravity = (typeof settings.gravity === "number") ? settings.gravity : defaults.gravity;
            this.wind = (typeof settings.wind === "number") ? settings.wind : defaults.wind;
            this.followTrajectory = (typeof settings.followTrajectory === "boolean") ? settings.followTrajectory : defaults.followTrajectory;
            this.textureAdditive = (typeof settings.textureAdditive === "boolean") ? settings.textureAdditive : defaults.textureAdditive;
            this.onlyInViewport = (typeof settings.onlyInViewport === "boolean") ? settings.onlyInViewport : defaults.onlyInViewport;
            this.floating = (typeof settings.floating === "boolean") ? settings.floating : defaults.floating;
            this.maxParticles = (typeof settings.maxParticles === "number") ? settings.maxParticles : defaults.maxParticles;
            this.frequency = (typeof settings.frequency === "number") ? settings.frequency : defaults.frequency;
            this.duration = (typeof settings.duration === "number") ? settings.duration : defaults.duration;
            this.framesToSkip = (typeof settings.framesToSkip === "number") ? settings.framesToSkip : defaults.framesToSkip;

            // reset particle container values
            this.container.destroy();
        },

        // Add count particles in the game world
        /** @ignore */
        addParticles: function (count) {
            for (var i = 0; i < ~~count; i++) {
                // Add particle to the container
                var particle = me.pool.pull("me.Particle", this);
                this.container.addChild(particle);
            }
        },

        /**
         * Emitter is of type stream and is launching particles <br>
         * @function
         * @returns {Boolean} Emitter is Stream and is launching particles
         * @name isRunning
         * @memberOf me.ParticleEmitter
         */
        isRunning: function () {
            return this._enabled && this._stream;
        },

        /**
         * Launch particles from emitter constantly <br>
         * Particles example: Fountains
         * @param {Number} duration [optional] time that the emitter releases particles in ms
         * @function
         * @name streamParticles
         * @memberOf me.ParticleEmitter
         */
        streamParticles: function (duration) {
            this._enabled = true;
            this._stream = true;
            this.frequency = Math.max(this.frequency, 1);
            this._durationTimer = (typeof duration === "number") ? duration : this.duration;
        },

        /**
         * Stop the emitter from generating new particles (used only if emitter is Stream) <br>
         * @function
         * @name stopStream
         * @memberOf me.ParticleEmitter
         */
        stopStream: function () {
            this._enabled = false;
        },

        /**
         * Launch all particles from emitter and stop <br>
         * Particles example: Explosions <br>
         * @param {Number} total [optional] number of particles to launch
         * @function
         * @name burstParticles
         * @memberOf me.ParticleEmitter
         */
        burstParticles: function (total) {
            this._enabled = true;
            this._stream = false;
            this.addParticles((typeof total === "number") ? total : this.totalParticles);
            this._enabled = false;
        },

        /**
         * @ignore
         */
        update: function (dt) {
            // Launch new particles, if emitter is Stream
            if ((this._enabled) && (this._stream)) {
                // Check if the emitter has duration set
                if (this._durationTimer !== Infinity) {
                    this._durationTimer -= dt;

                    if (this._durationTimer <= 0) {
                        this.stopStream();
                        return false;
                    }
                }

                // Increase the emitter launcher timer
                this._frequencyTimer += dt;

                // Check for new particles launch
                var particlesCount = this.container.children.length;
                if ((particlesCount < this.totalParticles) && (this._frequencyTimer >= this.frequency)) {
                    if ((particlesCount + this.maxParticles) <= this.totalParticles) {
                        this.addParticles(this.maxParticles);
                    }
                    else {
                        this.addParticles(this.totalParticles - particlesCount);
                    }

                    this._frequencyTimer = 0;
                }
            }
            return true;
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * Particle Container Object.
     * @class
     * @extends me.Container
     * @memberOf me
     * @constructor
     * @param {me.ParticleEmitter} emitter the emitter which owns this container
     */
    me.ParticleContainer = me.Container.extend(
    /** @scope ParticleContainer */
    {
        /**
         * @ignore
         */
        init: function (emitter) {
            // call the super constructor
            me.Container.prototype.init.apply(this);

            // don't sort the particles by z-index
            this.autoSort = false;

            // count the updates
            this._updateCount = 0;

            // internally store how much time was skipped when frames are skipped
            this._dt = 0;

            // cache the emitter for later use
            this._emitter = emitter;

            // cache a reference to the viewport to use as our bounding box
            this.bounds = me.game.viewport;
        },

        /**
         * @ignore
         */
        getBounds : function () {
            return this.bounds;
        },

        /**
         * @ignore
         */
        update: function (dt) {
            // skip frames if necessary
            if (++this._updateCount > this._emitter.framesToSkip) {
                this._updateCount = 0;
            }
            if (this._updateCount > 0) {
                this._dt += dt;
                return false;
            }

            // apply skipped delta time
            dt += this._dt;
            this._dt = 0;

            // Update particles and remove them if they are dead
            var viewport = me.game.viewport;
            for (var i = this.children.length - 1; i >= 0; --i) {
                var particle = this.children[i];
                particle.isRenderable = true;
                // particle.inViewport = viewport.isVisible(particle);
                particle.inViewport = this.floating || (
                    particle.pos.x < viewport.pos.x + viewport.width &&
                    viewport.pos.x < particle.pos.x + particle.width &&
                    particle.pos.y < viewport.pos.y + viewport.height &&
                    viewport.pos.y < particle.pos.y + particle.height
                );
                if (!particle.update(dt)) {
                    this.removeChildNow(particle);
                }
            }
            return true;
        },

        /**
         * @ignore
         */
        draw : function (context, rect) {
            if (this.children.length > 0) {
                var gco;
                // Check for additive draw
                if (this._emitter.textureAdditive) {
                    gco = context.globalCompositeOperation;
                    context.globalCompositeOperation = "lighter";
                }

                me.Container.prototype.draw.apply(this, [context, rect]);

                // Restore globalCompositeOperation
                if (this._emitter.textureAdditive) {
                    context.globalCompositeOperation = gco;
                }
            }
        }
    });
})();

/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014, Olivier BIOT
 * http://www.melonjs.org
 *
 */
(function () {
    /**
     * Single Particle Object.
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {me.ParticleEmitter} particle emitter
     */
    me.Particle = me.Renderable.extend(
    /** @scope me.Particle.prototype */
    {
        /**
         * @ignore
         */
        init : function (emitter) {
            // Call the super constructor
            var point = emitter.getRandomPoint();
            me.Renderable.prototype.init.apply(this, [point.x, point.y, emitter.image.width, emitter.image.height]);

            // Particle will always update
            this.alwaysUpdate = true;

            // Particle will not act as a rednerable
            // FIXME: This is probably not needed. It's a hack that tries to
            // workaround performance issues within container.
            this.isRenderable = false;

            // Cache the image reference
            this.image = emitter.image;

            // Set the start particle Angle and Speed as defined in emitter
            var angle = emitter.angle + ((emitter.angleVariation > 0) ? (-1).random(2) * emitter.angleVariation : 0);
            var speed = emitter.speed + ((emitter.speedVariation > 0) ? (-1).random(2) * emitter.speedVariation : 0);

            // Set the start particle Velocity
            this.vel = new me.Vector2d(speed * Math.cos(angle), -speed * Math.sin(angle));

            // Set the start particle Time of Life as defined in emitter
            this.life = emitter.minLife.random(emitter.maxLife);
            this.startLife = this.life;

            // Set the start and end particle Scale as defined in emitter
            // clamp the values as minimum and maximum scales range
            this.startScale = emitter.minStartScale.randomFloat(
                emitter.maxStartScale
            ).clamp(emitter.minStartScale, emitter.maxStartScale);
            this.endScale = emitter.minEndScale.randomFloat(
                emitter.maxEndScale
            ).clamp(emitter.minEndScale, emitter.maxEndScale);

            // Set the particle Gravity and Wind (horizontal gravity) as defined in emitter
            this.gravity = emitter.gravity;
            this.wind = emitter.wind;

            // Set if the particle update the rotation in accordance the trajectory
            this.followTrajectory = emitter.followTrajectory;

            // Set if the particle update only in Viewport
            this.onlyInViewport = emitter.onlyInViewport;

            // Set the particle Z Order
            this.z = emitter.z;

            // cache inverse of the expected delta time
            this._deltaInv = me.sys.fps / 1000;

            this.transform = new me.Matrix2d();

            // Set the start particle rotation as defined in emitter
            // if the particle not follow trajectory
            if (!emitter.followTrajectory) {
                this.angle = emitter.minRotation.randomFloat(emitter.maxRotation);
            }
        },

        /**
         * Update the Particle <br>
         * This is automatically called by the game manager {@link me.game}
         * @name update
         * @memberOf me.Particle
         * @function
         * @ignore
         * @param {Number} dt time since the last update in milliseconds
         */
        update : function (dt) {
            // move things forward independent of the current frame rate
            var skew = dt * this._deltaInv;

            // Decrease particle life
            this.life = this.life > dt ? this.life - dt : 0;

            // Calculate the particle Age Ratio
            var ageRatio = this.life / this.startLife;

            // Resize the particle as particle Age Ratio
            var scale = this.startScale;
            if (this.startScale > this.endScale) {
                scale *= ageRatio;
                scale = (scale < this.endScale) ? this.endScale : scale;
            }
            else if (this.startScale < this.endScale) {
                scale /= ageRatio;
                scale = (scale > this.endScale) ? this.endScale : scale;
            }

            // Set the particle opacity as Age Ratio
            this.alpha = ageRatio;

            // Adjust the particle velocity
            this.vel.x += this.wind * skew;
            this.vel.y += this.gravity * skew;

            // If necessary update the rotation of particle in accordance the particle trajectory
            var angle = this.followTrajectory ? Math.atan2(this.vel.y, this.vel.x) : this.angle;

            // Update particle transform
            this.transform.set(scale, 0, 0, scale, 0, 0).rotate(angle);
            this.pos.x += this.vel.x * skew;
            this.pos.y += this.vel.y * skew;

            // Return true if the particle is not dead yet
            return (this.inViewport || !this.onlyInViewport) && (this.life > 0);
        },

        draw : function (renderer) {
            renderer.save();

            // particle alpha value
            renderer.setGlobalAlpha(renderer.globalAlpha() * this.alpha);

            // translate to the defined anchor point and scale it
            var transform = this.transform.val;
            renderer.transform(
                transform[0], transform[1],
                transform[2], transform[3],
                ~~this.pos.x, ~~this.pos.y
            );

            var w = this.width, h = this.height;
            renderer.drawImage(
                this.image,
                0, 0,
                w, h,
                -w / 2, -h / 2,
                w, h
            );

            renderer.restore();
        }
    });


    /*---------------------------------------------------------*/
    // END END END
    /*---------------------------------------------------------*/
})(window);
