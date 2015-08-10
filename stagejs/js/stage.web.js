/*
 * Stage.js 0.6.1
 * Copyright (c) 2015 Ali Shakiba, Piqnt LLC
 * Available under the MIT license
 * @license
 */

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Stage=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require("../lib/");

require("../lib/canvas");

require("../lib/image");

require("../lib/anim");

require("../lib/str");

require("../lib/layout");

require("../lib/addon/tween");

module.exports.Mouse = require("../lib/addon/mouse");

module.exports.Math = require("../lib/util/math");

module.exports._extend = require("../lib/util/extend");

module.exports._create = require("../lib/util/create");

require("../lib/loader/web");
},{"../lib/":11,"../lib/addon/mouse":3,"../lib/addon/tween":4,"../lib/anim":5,"../lib/canvas":7,"../lib/image":10,"../lib/layout":12,"../lib/loader/web":13,"../lib/str":19,"../lib/util/create":21,"../lib/util/extend":22,"../lib/util/math":24}],2:[function(require,module,exports){
function _identity(x) {
    return x;
}

var _cache = {};

var _modes = {};

var _easings = {};

function Easing(token) {
    if (typeof token === "function") {
        return token;
    }
    if (typeof token !== "string") {
        return _identity;
    }
    var fn = _cache[token];
    if (fn) {
        return fn;
    }
    var match = /^(\w+)(-(in|out|in-out|out-in))?(\((.*)\))?$/i.exec(token);
    if (!match || !match.length) {
        return _identity;
    }
    easing = _easings[match[1]];
    mode = _modes[match[3]];
    params = match[5];
    if (easing && easing.fn) {
        fn = easing.fn;
    } else if (easing && easing.fc) {
        fn = easing.fc.apply(easing.fc, params && params.replace(/\s+/, "").split(","));
    } else {
        fn = _identity;
    }
    if (mode) {
        fn = mode.fn(fn);
    }
    // TODO: It can be a memory leak with different `params`.
    _cache[token] = fn;
    return fn;
}

Easing.add = function(data) {
    var names = (data.name || data.mode).split(/\s+/);
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        if (name) {
            (data.name ? _easings : _modes)[name] = data;
        }
    }
};

Easing.add({
    mode: "in",
    fn: function(f) {
        return f;
    }
});

Easing.add({
    mode: "out",
    fn: function(f) {
        return function(t) {
            return 1 - f(1 - t);
        };
    }
});

Easing.add({
    mode: "in-out",
    fn: function(f) {
        return function(t) {
            return t < .5 ? f(2 * t) / 2 : 1 - f(2 * (1 - t)) / 2;
        };
    }
});

Easing.add({
    mode: "out-in",
    fn: function(f) {
        return function(t) {
            return t < .5 ? 1 - f(2 * (1 - t)) / 2 : f(2 * t) / 2;
        };
    }
});

Easing.add({
    name: "linear",
    fn: function(t) {
        return t;
    }
});

Easing.add({
    name: "quad",
    fn: function(t) {
        return t * t;
    }
});

Easing.add({
    name: "cubic",
    fn: function(t) {
        return t * t * t;
    }
});

Easing.add({
    name: "quart",
    fn: function(t) {
        return t * t * t * t;
    }
});

Easing.add({
    name: "quint",
    fn: function(t) {
        return t * t * t * t * t;
    }
});

Easing.add({
    name: "sin sine",
    fn: function(t) {
        return 1 - Math.cos(t * Math.PI / 2);
    }
});

Easing.add({
    name: "exp",
    fn: function(t) {
        return t == 0 ? 0 : Math.pow(2, 10 * (t - 1));
    }
});

Easing.add({
    name: "circle circ",
    fn: function(t) {
        return 1 - Math.sqrt(1 - t * t);
    }
});

Easing.add({
    name: "bounce",
    fn: function(t) {
        return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
    }
});

Easing.add({
    name: "poly",
    fc: function(e) {
        return function(t) {
            return Math.pow(t, e);
        };
    }
});

Easing.add({
    name: "elastic",
    fc: function(a, p) {
        p = p || .45;
        a = a || 1;
        var s = p / (2 * Math.PI) * Math.asin(1 / a);
        return function(t) {
            return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p);
        };
    }
});

Easing.add({
    name: "back",
    fc: function(s) {
        s = typeof s !== "undefined" ? s : 1.70158;
        return function(t) {
            return t * t * ((s + 1) * t - s);
        };
    }
});

module.exports = Easing;


},{}],3:[function(require,module,exports){
if (typeof DEBUG === "undefined") DEBUG = true;

function Mouse() {}

Mouse.CLICK = "click";

Mouse.START = "touchstart mousedown";

Mouse.MOVE = "touchmove mousemove";

Mouse.END = "touchend mouseup";

Mouse.CANCEL = "touchcancel";

Mouse.subscribe = function(stage, elem) {
    var visitor = null, data = {}, abs = null, rel = null, clicked = [];
    elem = elem || document;
    // click events are synthesized from start/end events on same nodes
    // elem.addEventListener('click', handleClick);
    elem.addEventListener("touchstart", handleStart);
    elem.addEventListener("touchend", handleEnd);
    elem.addEventListener("touchmove", handleMove);
    elem.addEventListener("touchcancel", handleCancel);
    elem.addEventListener("mousedown", handleStart);
    elem.addEventListener("mouseup", handleEnd);
    elem.addEventListener("mousemove", handleMove);
    function handleStart(event) {
        Mouse._xy(stage, elem, event, abs);
        DEBUG && console.log("Mouse Start: " + event.type + " " + abs);
        event.preventDefault();
        publish(event.type, event);
        findClicks();
    }
    function handleEnd(event) {
        // New xy is not valid/available, last xy is used instead.
        DEBUG && console.log("Mouse End: " + event.type + " " + abs);
        event.preventDefault();
        publish(event.type, event);
        if (clicked.length) {
            DEBUG && console.log("Mouse Click: " + clicked.length);
            fireClicks(event);
        }
    }
    function handleCancel(event) {
        DEBUG && console.log("Mouse Cancel: " + event.type);
        event.preventDefault();
        publish(event.type, event);
    }
    function handleMove(event) {
        Mouse._xy(stage, elem, event, abs);
        // DEBUG && console.log('Mouse Move: ' + event.type + ' ' +
        // abs);
        if (!stage._flag(event.type)) {
            return;
        }
        event.preventDefault();
        publish(event.type, event);
    }
    function findClicks() {
        while (clicked.length) {
            clicked.pop();
        }
        publish("click", null, clicked);
    }
    function fireClicks(event) {
        data.event = event;
        data.type = "click";
        data.stage = stage;
        data.collect = false;
        var cancel = false;
        while (clicked.length) {
            var node = clicked.shift();
            if (cancel) {
                continue;
            }
            cancel = visitor.end(node, data) ? true : cancel;
        }
    }
    function publish(type, event, collect) {
        rel.x = abs.x;
        rel.y = abs.y;
        data.event = event;
        data.type = type;
        data.stage = /* stage._capture || */ stage;
        data.collect = collect;
        data.stage.visit(visitor, data);
    }
    visitor = {
        reverse: true,
        visible: true,
        start: function(node, data) {
            return !node._flag(data.type);
        },
        end: function(node, data) {
            // data: event, type, stage, collect
            rel.raw = data.event;
            rel.type = data.type;
            var listeners = node.listeners(data.type);
            if (!listeners) {
                return;
            }
            node.matrix().reverse().map(abs, rel);
            if (!(node === data.stage || node.attr("spy") || Mouse._isInside(node, rel))) {
                return;
            }
            if (data.collect) {
                data.collect.push(node);
                return;
            }
            var cancel = false;
            for (var l = 0; l < listeners.length; l++) {
                cancel = listeners[l].call(node, rel) ? true : cancel;
            }
            return cancel;
        }
    };
    abs = {
        x: 0,
        y: 0,
        toString: function() {
            return (this.x | 0) + "x" + (this.y | 0);
        }
    };
    rel = {
        x: 0,
        y: 0,
        toString: function() {
            return abs + " / " + (this.x | 0) + "x" + (this.y | 0);
        }
    };
};

Mouse._isInside = function(node, point) {
    return point.x >= 0 && point.x <= node._pin._width && point.y >= 0 && point.y <= node._pin._height;
};

Mouse._xy = function(stage, elem, event, point) {
    var isTouch = false;
    // touch screen events
    if (event.touches) {
        if (event.touches.length) {
            isTouch = true;
            point.x = event.touches[0].pageX;
            point.y = event.touches[0].pageY;
        } else {
            return;
        }
    } else {
        // mouse events
        point.x = event.clientX;
        point.y = event.clientY;
        // See http://goo.gl/JuVnF2
        if (document.body.scrollLeft || document.body.scrollTop) {} else if (document.documentElement) {
            point.x += document.documentElement.scrollLeft;
            point.y += document.documentElement.scrollTop;
        }
    }
    // accounts for border
    point.x -= elem.clientLeft || 0;
    point.y -= elem.clientTop || 0;
    var par = elem;
    while (par) {
        point.x -= par.offsetLeft || 0;
        point.y -= par.offsetTop || 0;
        if (!isTouch) {
            // touch events offset scrolling with pageX/Y
            // so scroll offset not needed for them
            point.x += par.scrollLeft || 0;
            point.y += par.scrollTop || 0;
        }
        par = par.offsetParent;
    }
    point.x *= stage.viewport().ratio || 1;
    point.y *= stage.viewport().ratio || 1;
};

module.exports = Mouse;


},{}],4:[function(require,module,exports){
var Easing = require("./easing");

var Class = require("../core");

var Pin = require("../pin");

Class.prototype.tween = function(duration, delay) {
    if (!this._tween) {
        this._tween = new Tween(this);
    }
    return this._tween.tween(duration, delay);
};

var iid = 0;

function Tween(node) {
    // TODO: reuse head.start/keys/end
    var tween = this;
    this._owner = node;
    this._queue = [];
    this._next = null;
    var lastTime = 0;
    node.tick(function(elapsed, now, last) {
        if (!tween._queue.length) {
            return;
        }
        // ignore old elapsed
        var ignore = lastTime != last;
        lastTime = now;
        this.touch();
        if (ignore) {
            return;
        }
        var head = tween._queue[0];
        if (!head.time) {
            head.time = 1;
        } else {
            head.time += elapsed;
        }
        if (head.time < head.delay) {
            return;
        }
        if (!head.start) {
            head.start = {};
            head.keys = {};
            for (var key in head.end) {
                if (typeof (start = node.pin(key)) === "number") {
                    head.start[key] = start;
                    head.keys[key] = key;
                } else if (typeof (startX = node.pin(key + "X")) === "number" && typeof (startY = node.pin(key + "Y")) === "number") {
                    head.start[key + "X"] = startX;
                    head.keys[key + "X"] = key;
                    head.start[key + "Y"] = startY;
                    head.keys[key + "Y"] = key;
                }
            }
        }
        var p = (head.time - head.delay) / head.duration;
        var over = p >= 1;
        p = p > 1 ? 1 : p;
        p = typeof head.easing == "function" ? head.easing(p) : p;
        var q = 1 - p;
        for (var key in head.keys) {
            node.pin(key, head.start[key] * q + head.end[head.keys[key]] * p);
        }
        if (over) {
            tween._queue.shift();
            head.then && head.then.call(node);
        }
    }, true);
}

Tween.prototype.tween = function(duration, delay) {
    this._next = {
        id: ++iid,
        end: {},
        duration: duration || 400,
        delay: delay || 0
    };
    return this;
};

Tween.prototype.pin = function(a, b) {
    if (this._next !== this._queue[this._queue.length - 1]) {
        this._owner.touch();
        this._queue.push(this._next);
    }
    var end = this._next.end;
    if (typeof a === "object") {
        for (var attr in a) {
            end[attr] = a[attr];
        }
    } else if (typeof b !== "undefined") {
        end[a] = b;
    }
    return this;
};

Tween.prototype.clear = function(forward) {
    var tween;
    while (tween = this._queue.shift()) {
        forward && this._owner.pin(tween.end);
    }
    return this;
};

Tween.prototype.then = function(then) {
    this._next.then = then;
    return this;
};

Tween.prototype.ease = function(easing) {
    this._next.easing = Easing(easing);
    return this;
};

module.exports = Tween;


},{"../core":8,"../pin":16,"./easing":2}],5:[function(require,module,exports){
var Class = require("./core");

require("./pin");

require("./render");

var create = require("./util/create");

var math = require("./util/math");

Class.anim = function(frames, fps) {
    var anim = new Anim();
    anim.frames(frames).gotoFrame(0);
    fps && anim.fps(fps);
    return anim;
};

Anim._super = Class;

Anim.prototype = create(Anim._super.prototype);

// TODO: replace with atlas fps or texture time
Class.Anim = {
    FPS: 15
};

function Anim() {
    Anim._super.call(this);
    this.label("Anim");
    this._textures = [];
    this._fps = Class.Anim.FPS;
    this._ft = 1e3 / this._fps;
    this._time = -1;
    this._repeat = 0;
    this._index = 0;
    this._frames = [];
    var lastTime = 0;
    this.tick(function(t, now, last) {
        if (this._time < 0 || this._frames.length <= 1) {
            return;
        }
        // ignore old elapsed
        var ignore = lastTime != last;
        lastTime = now;
        if (ignore) {
            return true;
        }
        this._time += t;
        if (this._time < this._ft) {
            return true;
        }
        var n = this._time / this._ft | 0;
        this._time -= n * this._ft;
        this.moveFrame(n);
        if (this._repeat > 0 && (this._repeat -= n) <= 0) {
            this.stop();
            this._callback && this._callback();
            return false;
        }
        return true;
    }, false);
}

Anim.prototype.fps = function(fps) {
    if (typeof fps === "undefined") {
        return this._fps;
    }
    this._fps = fps > 0 ? fps : Class.Anim.FPS;
    this._ft = 1e3 / this._fps;
    return this;
};

/**
 * @deprecated Use frames
 */
Anim.prototype.setFrames = function(a, b, c) {
    return this.frames(a, b, c);
};

Anim.prototype.frames = function(frames) {
    this._index = 0;
    this._frames = Class.texture(frames).array();
    this.touch();
    return this;
};

Anim.prototype.length = function() {
    return this._frames ? this._frames.length : 0;
};

Anim.prototype.gotoFrame = function(frame, resize) {
    this._index = math.rotate(frame, this._frames.length) | 0;
    resize = resize || !this._textures[0];
    this._textures[0] = this._frames[this._index];
    if (resize) {
        this.pin("width", this._textures[0].width);
        this.pin("height", this._textures[0].height);
    }
    this.touch();
    return this;
};

Anim.prototype.moveFrame = function(move) {
    return this.gotoFrame(this._index + move);
};

Anim.prototype.repeat = function(repeat, callback) {
    this._repeat = repeat * this._frames.length - 1;
    this._callback = callback;
    this.play();
    return this;
};

Anim.prototype.play = function(frame) {
    if (typeof frame !== "undefined") {
        this.gotoFrame(frame);
        this._time = 0;
    } else if (this._time < 0) {
        this._time = 0;
    }
    this.touch();
    return this;
};

Anim.prototype.stop = function(frame) {
    this._time = -1;
    if (typeof frame !== "undefined") {
        this.gotoFrame(frame);
    }
    return this;
};


},{"./core":8,"./pin":16,"./render":17,"./util/create":21,"./util/math":24}],6:[function(require,module,exports){
var Class = require("./core");

var Texture = require("./texture");

var extend = require("./util/extend");

var create = require("./util/create");

var is = require("./util/is");

var string = require("./util/string");

// name : atlas
var _atlases_map = {};

// [atlas]
var _atlases_arr = [];

// TODO: return entire atlas as texture
// TODO: select atlas itself, call texture function
// TODO: print subquery not found error
// TODO: cache and clone or index textures
Class.atlas = function(def) {
    var atlas = is.fn(def.draw) ? def : new Atlas(def);
    if (def.name) {
        _atlases_map[def.name] = atlas;
    }
    _atlases_arr.push(atlas);
    deprecated(def, "imagePath");
    deprecated(def, "imageRatio");
    var url = def.imagePath;
    var ratio = def.imageRatio || 1;
    if (is.string(def.image)) {
        url = def.image;
    } else if (is.hash(def.image)) {
        url = def.image.url;
        ratio = def.image.ratio || ratio;
    }
    url && Class.preload(function(done) {
        DEBUG && console.log("Loading image: " + url);
        var imageloader = Class.config("image-loader");
        imageloader(url, function(image) {
            DEBUG && console.log("Image loaded: " + url);
            atlas.src(image, ratio);
            done();
        }, function(msg) {
            DEBUG && console.log("Error loading image: " + url, msg);
            done();
        });
    });
    return atlas;
};

Atlas._super = Texture;

Atlas.prototype = create(Atlas._super.prototype);

function Atlas(def) {
    Atlas._super.call(this);
    var atlas = this;
    deprecated(def, "filter");
    deprecated(def, "cutouts");
    deprecated(def, "sprites");
    deprecated(def, "factory");
    var map = def.map || def.filter;
    var ppu = def.ppu || def.ratio || 1;
    var trim = def.trim || 0;
    var textures = def.textures;
    var factory = def.factory;
    var cutouts = def.cutouts || def.sprites;
    function make(def) {
        if (!def || is.fn(def.draw)) {
            return def;
        }
        def = extend({}, def);
        if (is.fn(map)) {
            def = map(def);
        }
        if (ppu != 1) {
            def.x *= ppu, def.y *= ppu;
            def.width *= ppu, def.height *= ppu;
            def.top *= ppu, def.bottom *= ppu;
            def.left *= ppu, def.right *= ppu;
        }
        if (trim != 0) {
            def.x += trim, def.y += trim;
            def.width -= 2 * trim, def.height -= 2 * trim;
            def.top -= trim, def.bottom -= trim;
            def.left -= trim, def.right -= trim;
        }
        var texture = atlas.pipe();
        texture.top = def.top, texture.bottom = def.bottom;
        texture.left = def.left, texture.right = def.right;
        texture.src(def.x, def.y, def.width, def.height);
        return texture;
    }
    function find(query) {
        if (textures) {
            if (is.fn(textures)) {
                return textures(query);
            } else if (is.hash(textures)) {
                return textures[query];
            }
        }
        if (cutouts) {
            // deprecated
            var result = null, n = 0;
            for (var i = 0; i < cutouts.length; i++) {
                if (string.startsWith(cutouts[i].name, query)) {
                    if (n === 0) {
                        result = cutouts[i];
                    } else if (n === 1) {
                        result = [ result, cutouts[i] ];
                    } else {
                        result.push(cutouts[i]);
                    }
                    n++;
                }
            }
            if (n === 0 && is.fn(factory)) {
                result = function(subquery) {
                    return factory(query + (subquery ? subquery : ""));
                };
            }
            return result;
        }
    }
    this.select = function(query) {
        var found = find(query);
        if (found) {
            return new Selection(found, find, make);
        }
    };
}

var nfTexture = new Texture();

nfTexture.x = nfTexture.y = nfTexture.width = nfTexture.height = 0;

nfTexture.pipe = nfTexture.src = nfTexture.dest = function() {
    return this;
};

nfTexture.draw = function() {};

var nfSelection = new Selection(nfTexture);

function Selection(result, find, make) {
    function link(result, subquery) {
        if (!result) {
            return nfTexture;
        } else if (is.fn(result.draw)) {
            return result;
        } else if (is.hash(result) && is.number(result.width) && is.number(result.height) && is.fn(make)) {
            return make(result);
        } else if (is.hash(result) && is.defined(subquery)) {
            return link(result[subquery]);
        } else if (is.fn(result)) {
            return link(result(subquery));
        } else if (is.array(result)) {
            return link(result[0]);
        } else if (is.string(result) && is.fn(find)) {
            return link(find(result));
        }
    }
    this.one = function(subquery) {
        return link(result, subquery);
    };
    this.array = function(arr) {
        var array = is.array(arr) ? arr : [];
        if (is.array(result)) {
            for (var i = 0; i < result.length; i++) {
                array[i] = link(result[i]);
            }
        } else {
            array[0] = link(result);
        }
        return array;
    };
}

Class.texture = function(query) {
    if (!is.string(query)) {
        return new Selection(query);
    }
    var result = null;
    var i = query.indexOf(":");
    if (i > 0 && query.length > i + 1) {
        var atlas = _atlases_map[query.slice(0, i)];
        result = atlas && atlas.select(query.slice(i + 1));
    }
    for (var i = 0; !result && i < _atlases_arr.length; i++) {
        result = _atlases_arr[i].select(query);
    }
    if (!result) {
        console.error("Texture not found: " + query);
        result = nfSelection;
    }
    return result;
};

function deprecated(hash, name, msg) {
    if (name in hash) console.log(msg ? msg.replace("%name", name) : "'" + name + "' field of texture atlas is deprecated.");
}

module.exports = Atlas;


},{"./core":8,"./texture":20,"./util/create":21,"./util/extend":22,"./util/is":23,"./util/string":28}],7:[function(require,module,exports){
var Class = require("./core");

var Texture = require("./texture");

Class.canvas = function(type, attributes, callback) {
    if (typeof type === "string") {
        if (typeof attributes === "object") {} else {
            if (typeof attributes === "function") {
                callback = attributes;
            }
            attributes = {};
        }
    } else {
        if (typeof type === "function") {
            callback = type;
        }
        attributes = {};
        type = "2d";
    }
    var canvas = document.createElement("canvas");
    var context = canvas.getContext(type, attributes);
    var texture = new Texture(canvas);
    texture.context = function() {
        return context;
    };
    texture.size = function(width, height, ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        this.src(canvas, ratio);
        return this;
    };
    texture.canvas = function(fn) {
        if (typeof fn === "function") {
            fn.call(this, context);
        } else if (typeof fn === "undefined" && typeof callback === "function") {
            callback.call(this, context);
        }
        return this;
    };
    if (typeof callback === "function") {
        callback.call(texture, context);
    }
    return texture;
};


},{"./core":8,"./texture":20}],8:[function(require,module,exports){
if (typeof DEBUG === "undefined") DEBUG = true;

var stats = require("./util/stats");

var extend = require("./util/extend");

var once = require("./util/once");

var is = require("./util/is");

stats.create = 0;

function Class(arg) {
    if (!(this instanceof Class)) {
        if (is.fn(arg)) {
            return Class.app.apply(Class, arguments);
        } else if (is.object(arg)) {
            return Class.atlas.apply(Class, arguments);
        } else {
            return arg;
        }
    }
    stats.create++;
    for (var i = 0; i < _init.length; i++) {
        _init[i].call(this);
    }
}

var _init = [];

Class._init = function(fn) {
    _init.push(fn);
};

var _config = {};

Class.config = function() {
    if (arguments.length === 1 && is.string(arguments[0])) {
        return _config[arguments[0]];
    }
    if (arguments.length === 1 && is.object(arguments[0])) {
        extend(_config, arguments[0]);
    }
    if (arguments.length === 2 && is.string(arguments[0])) {
        _config[(arguments[0], arguments[1])];
    }
};

var _app_queue = [];

var _preload_queue = [];

var _stages = [];

var _started = false;

var _paused = false;

Class.app = function(app, opts) {
    if (!_started) {
        _app_queue.push(arguments);
        return;
    }
    DEBUG && console.log("Creating app...");
    var loader = Class.config("app-loader");
    loader(function(stage, canvas) {
        DEBUG && console.log("Initing app...");
        app(stage, canvas);
        _stages.push(stage);
        DEBUG && console.log("Starting app...");
        stage.start();
    }, opts);
};

Class.preload = function(load) {
    if (!_started) {
        _preload_queue.push(load);
        return;
    }
    load(function(err) {});
};

Class.start = function(config) {
    DEBUG && console.log("Starting...");
    Class.config(config);
    DEBUG && console.log("Preloading...");
    var loading = 0;
    if (!_preload_queue.length) {
        done();
    } else {
        while (_preload_queue.length) {
            var preload = _preload_queue.shift();
            preload(once(done));
            loading++;
        }
    }
    function done() {
        if (--loading <= 0) {
            DEBUG && console.log("Loading apps...");
            _started = true;
            while (_app_queue.length) {
                var args = _app_queue.shift();
                Class.app.apply(Class, args);
            }
        }
    }
};

Class.pause = function() {
    if (!_paused) {
        _paused = true;
        for (var i = _stages.length - 1; i >= 0; i--) {
            _stages[i].pause();
        }
    }
};

Class.resume = function() {
    if (_paused) {
        _paused = false;
        for (var i = _stages.length - 1; i >= 0; i--) {
            _stages[i].resume();
        }
    }
};

Class.create = function() {
    return new Class();
};

module.exports = Class;


},{"./util/extend":22,"./util/is":23,"./util/once":25,"./util/stats":27}],9:[function(require,module,exports){
var Class = require("./core");

var is = require("./util/is");

Class.prototype._listeners = null;

Class.prototype.on = Class.prototype.listen = function(types, listener) {
    if (types = _check(this, types, listener, true)) {
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            this._listeners[type] = this._listeners[type] || [];
            this._listeners[type].push(listener);
            this._flag(type, true);
        }
    }
    return this;
};

Class.prototype.off = function(types, listener) {
    if (types = _check(this, types, listener, false)) {
        for (var i = 0; i < types.length; i++) {
            var type = types[i], all = this._listeners[type], index;
            if (all && (index = all.indexOf(listener)) >= 0) {
                all.splice(index, 1);
                if (!all.length) {
                    delete this._listeners[type];
                }
                this._flag(type, false);
            }
        }
    }
    return this;
};

function _check(node, types, listener, create) {
    if (!types || !types.length || typeof listener !== "function") {
        return false;
    }
    if (!(types = (is.array(types) ? types.join(" ") : types).match(/\S+/g))) {
        return false;
    }
    if (node._listeners === null) {
        if (create) {
            node._listeners = {};
        } else {
            return false;
        }
    }
    return types;
}

Class.prototype.listeners = function(type) {
    return this._listeners && this._listeners[type];
};

Class.prototype.publish = function(name, args) {
    var listeners = this.listeners(name);
    if (!listeners || !listeners.length) {
        return 0;
    }
    for (var l = 0; l < listeners.length; l++) {
        listeners[l].apply(this, args);
    }
    return listeners.length;
};

Class.prototype.trigger = function(name, args) {
    this.publish(name, args);
    return this;
};


},{"./core":8,"./util/is":23}],10:[function(require,module,exports){
var Class = require("./core");

require("./pin");

require("./render");

var repeat = require("./util/repeat");

var create = require("./util/create");

Class.image = function(image) {
    var img = new Image();
    image && img.image(image);
    return img;
};

Image._super = Class;

Image.prototype = create(Image._super.prototype);

function Image() {
    Image._super.call(this);
    this.label("Image");
    this._textures = [];
    this._image = null;
}

/**
 * @deprecated Use image
 */
Image.prototype.setImage = function(a, b, c) {
    return this.image(a, b, c);
};

Image.prototype.image = function(image) {
    this._image = Class.texture(image).one();
    this.pin("width", this._image ? this._image.width : 0);
    this.pin("height", this._image ? this._image.height : 0);
    this._textures[0] = this._image.pipe();
    this._textures.length = 1;
    return this;
};

Image.prototype.tile = function(inner) {
    this._repeat(false, inner);
    return this;
};

Image.prototype.stretch = function(inner) {
    this._repeat(true, inner);
    return this;
};

Image.prototype._repeat = function(stretch, inner) {
    var self = this;
    this.untick(this._repeatTicker);
    this.tick(this._repeatTicker = function() {
        if (this._mo_stretch == this._pin._ts_transform) {
            return;
        }
        this._mo_stretch = this._pin._ts_transform;
        var width = this.pin("width");
        var height = this.pin("height");
        this._textures.length = repeat(this._image, width, height, stretch, inner, insert);
    });
    function insert(i, sx, sy, sw, sh, dx, dy, dw, dh) {
        var repeat = self._textures.length > i ? self._textures[i] : self._textures[i] = self._image.pipe();
        repeat.src(sx, sy, sw, sh);
        repeat.dest(dx, dy, dw, dh);
    }
};


},{"./core":8,"./pin":16,"./render":17,"./util/create":21,"./util/repeat":26}],11:[function(require,module,exports){
module.exports = require("./core");

module.exports.Matrix = require("./matrix");

module.exports.Texture = require("./texture");

require("./atlas");

require("./node");

require("./event");

require("./pin");

require("./render");

require("./root");


},{"./atlas":6,"./core":8,"./event":9,"./matrix":14,"./node":15,"./pin":16,"./render":17,"./root":18,"./texture":20}],12:[function(require,module,exports){
var Class = require("./core");

require("./pin");

require("./render");

var create = require("./util/create");

Class.row = function(align) {
    return Class.create().row(align);
};

Class.prototype.row = function(align) {
    this.sequence("row", align);
    return this;
};

Class.column = function(align) {
    return Class.create().column(align);
};

Class.prototype.column = function(align) {
    this.sequence("column", align);
    return this;
};

Class.sequence = function(type, align) {
    return Class.create().sequence(type, align);
};

Class.prototype.sequence = function(type, align) {
    this._padding = this._padding || 0;
    this._spacing = this._spacing || 0;
    this.untick(this._sequenceTicker);
    this.tick(this._sequenceTicker = function() {
        if (this._mo_seq == this._ts_touch) {
            return;
        }
        this._mo_seq = this._ts_touch;
        var alignChildren = this._mo_seqAlign != this._ts_children;
        this._mo_seqAlign = this._ts_children;
        var width = 0, height = 0;
        var child, next = this.first(true);
        var first = true;
        while (child = next) {
            next = child.next(true);
            child._pin.relativeMatrix();
            var w = child.pin("boxWidth");
            var h = child.pin("boxHeight");
            if (type == "column") {
                !first && (height += this._spacing);
                child.pin("offsetY") != height && child.pin("offsetY", height);
                width = Math.max(width, w);
                height = height + h;
                alignChildren && child.pin("alignX", align);
            } else if (type == "row") {
                !first && (width += this._spacing);
                child.pin("offsetX") != width && child.pin("offsetX", width);
                width = width + w;
                height = Math.max(height, h);
                alignChildren && child.pin("alignY", align);
            }
            first = false;
        }
        width += 2 * this._padding;
        height += 2 * this._padding;
        this.pin("width") != width && this.pin("width", width);
        this.pin("height") != height && this.pin("height", height);
    });
    return this;
};

Class.box = function() {
    return Class.create().box();
};

Class.prototype.box = function() {
    if (this._boxTicker) return this;
    this._padding = this._padding || 0;
    this.tick(this._boxTicker = function() {
        if (this._mo_box == this._ts_touch) {
            return;
        }
        this._mo_box = this._ts_touch;
        var width = 0, height = 0;
        var child, next = this.first(true);
        while (child = next) {
            next = child.next(true);
            child._pin.relativeMatrix();
            var w = child.pin("boxWidth");
            var h = child.pin("boxHeight");
            width = Math.max(width, w);
            height = Math.max(height, h);
        }
        width += 2 * this._padding;
        height += 2 * this._padding;
        this.pin("width") != width && this.pin("width", width);
        this.pin("height") != height && this.pin("height", height);
    });
    return this;
};

// TODO: move padding to pin
Class.prototype.padding = function(pad) {
    this._padding = pad;
    return this;
};

Class.prototype.spacing = function(space) {
    this._spacing = space;
    return this;
};


},{"./core":8,"./pin":16,"./render":17,"./util/create":21}],13:[function(require,module,exports){
/**
 * Default loader for web.
 */
if (typeof DEBUG === "undefined") DEBUG = true;

var Class = require("../core");

// TODO: don't hard-code this
var Mouse = require("../addon/mouse");

window.addEventListener("load", function() {
    DEBUG && console.log("On load.");
    Class.start({
        "app-loader": AppLoader,
        "image-loader": ImageLoader
    });
}, false);

function AppLoader(app, configs) {
    configs = configs || {};
    var canvas = configs.canvas, context = null, full = false;
    var width = 0, height = 0, ratio = 1;
    if (typeof canvas === "string") {
        canvas = document.getElementById(canvas);
    }
    if (!canvas) {
        canvas = document.getElementById("cutjs") || document.getElementById("stage");
    }
    if (!canvas) {
        full = true;
        DEBUG && console.log("Creating Canvas...");
        canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        var body = document.body;
        body.insertBefore(canvas, body.firstChild);
    }
    context = canvas.getContext("2d");
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    ratio = devicePixelRatio / backingStoreRatio;
    var requestAnimationFrame = window.requestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || function(callback) {
        return window.setTimeout(callback, 1e3 / 60);
    };
    DEBUG && console.log("Creating stage...");
    var root = Class.root(requestAnimationFrame, render);
    function render() {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, width, height);
        root.render(context);
    }
    root.background = function(color) {
        canvas.style.backgroundColor = color;
        return this;
    };
    Mouse.subscribe(root, canvas);
    app(root, canvas);
    resize();
    window.addEventListener("resize", resize, false);
    window.addEventListener("orientationchange", resize, false);
    function resize() {
        if (full) {
            // screen.availWidth/Height?
            width = window.innerWidth > 0 ? window.innerWidth : screen.width;
            height = window.innerHeight > 0 ? window.innerHeight : screen.height;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
        } else {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
        }
        width *= ratio;
        height *= ratio;
        if (canvas.width === width && canvas.height === height) {
            return;
        }
        canvas.width = width;
        canvas.height = height;
        DEBUG && console.log("Resize: " + width + " x " + height + " / " + ratio);
        root.viewport(width, height, ratio);
        render();
    }
}

function ImageLoader(src, success, error) {
    DEBUG && console.log("Loading image: " + src);
    var image = new Image();
    image.onload = function() {
        success(image);
    };
    image.onerror = error;
    image.src = src;
}


},{"../addon/mouse":3,"../core":8}],14:[function(require,module,exports){
function Matrix(a, b, c, d, e, f) {
    this._dirty = true;
    this.a = a || 1;
    this.b = b || 0;
    this.c = c || 0;
    this.d = d || 1;
    this.e = e || 0;
    this.f = f || 0;
}

Matrix.prototype.toString = function() {
    return "[" + this.a + ", " + this.b + ", " + this.c + ", " + this.d + ", " + this.e + ", " + this.f + "]";
};

Matrix.prototype.clone = function() {
    return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
};

Matrix.prototype.copyTo = function(m) {
    m.copyFrom(this);
    return this;
};

Matrix.prototype.copyFrom = function(m) {
    this._dirty = true;
    this.a = m.a;
    this.b = m.b;
    this.c = m.c;
    this.d = m.d;
    this.e = m.e;
    this.f = m.f;
    return this;
};

Matrix.prototype.identity = function() {
    this._dirty = true;
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
    return this;
};

Matrix.prototype.rotate = function(angle) {
    if (!angle) {
        return this;
    }
    this._dirty = true;
    var u = angle ? Math.cos(angle) : 1;
    // android bug may give bad 0 values
    var v = angle ? Math.sin(angle) : 0;
    var a = u * this.a - v * this.b;
    var b = u * this.b + v * this.a;
    var c = u * this.c - v * this.d;
    var d = u * this.d + v * this.c;
    var e = u * this.e - v * this.f;
    var f = u * this.f + v * this.e;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
};

Matrix.prototype.translate = function(x, y) {
    if (!x && !y) {
        return this;
    }
    this._dirty = true;
    this.e += x;
    this.f += y;
    return this;
};

Matrix.prototype.scale = function(x, y) {
    if (!(x - 1) && !(y - 1)) {
        return this;
    }
    this._dirty = true;
    this.a *= x;
    this.b *= y;
    this.c *= x;
    this.d *= y;
    this.e *= x;
    this.f *= y;
    return this;
};

Matrix.prototype.skew = function(x, y) {
    if (!x && !y) {
        return this;
    }
    this._dirty = true;
    var a = this.a + this.b * x;
    var b = this.b + this.a * y;
    var c = this.c + this.d * x;
    var d = this.d + this.c * y;
    var e = this.e + this.f * x;
    var f = this.f + this.e * y;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
};

Matrix.prototype.concat = function(m) {
    this._dirty = true;
    var n = this;
    var a = n.a * m.a + n.b * m.c;
    var b = n.b * m.d + n.a * m.b;
    var c = n.c * m.a + n.d * m.c;
    var d = n.d * m.d + n.c * m.b;
    var e = n.e * m.a + m.e + n.f * m.c;
    var f = n.f * m.d + m.f + n.e * m.b;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
};

Matrix.prototype.reverse = function() {
    if (this._dirty) {
        this._dirty = false;
        this.reversed = this.reversed || new Matrix();
        var z = this.a * this.d - this.b * this.c;
        this.reversed.a = this.d / z;
        this.reversed.b = -this.b / z;
        this.reversed.c = -this.c / z;
        this.reversed.d = this.a / z;
        this.reversed.e = (this.c * this.f - this.e * this.d) / z;
        this.reversed.f = (this.e * this.b - this.a * this.f) / z;
    }
    return this.reversed;
};

Matrix.prototype.map = function(p, q) {
    q = q || {};
    q.x = this.a * p.x + this.c * p.y + this.e;
    q.y = this.b * p.x + this.d * p.y + this.f;
    return q;
};

Matrix.prototype.mapX = function(x, y) {
    return this.a * x + this.c * y + this.e;
};

Matrix.prototype.mapY = function(x, y) {
    return this.b * x + this.d * y + this.f;
};

module.exports = Matrix;


},{}],15:[function(require,module,exports){
var Class = require("./core");

var is = require("./util/is");

var iid = 0;

// TODO: do not clear next/prev/parent on remove
Class.prototype._label = "";

Class.prototype._visible = true;

Class.prototype._parent = null;

Class.prototype._next = null;

Class.prototype._prev = null;

Class.prototype._first = null;

Class.prototype._last = null;

Class.prototype._attrs = null;

Class.prototype._flags = null;

Class.prototype.toString = function() {
    return "[" + this._label + "]";
};

/**
 * @deprecated Use label()
 */
Class.prototype.id = function(id) {
    return this.label(id);
};

Class.prototype.label = function(label) {
    if (typeof label === "undefined") {
        return this._label;
    }
    this._label = label;
    return this;
};

Class.prototype.attr = function(name, value) {
    if (typeof value === "undefined") {
        return this._attrs !== null ? this._attrs[name] : undefined;
    }
    (this._attrs !== null ? this._attrs : this._attrs = {})[name] = value;
    return this;
};

Class.prototype.visible = function(visible) {
    if (typeof visible === "undefined") {
        return this._visible;
    }
    this._visible = visible;
    this._parent && (this._parent._ts_children = ++iid);
    this._ts_pin = ++iid;
    this.touch();
    return this;
};

Class.prototype.hide = function() {
    return this.visible(false);
};

Class.prototype.show = function() {
    return this.visible(true);
};

Class.prototype.parent = function() {
    return this._parent;
};

Class.prototype.next = function(visible) {
    var next = this._next;
    while (next && visible && !next._visible) {
        next = next._next;
    }
    return next;
};

Class.prototype.prev = function(visible) {
    var prev = this._prev;
    while (prev && visible && !prev._visible) {
        prev = prev._prev;
    }
    return prev;
};

Class.prototype.first = function(visible) {
    var next = this._first;
    while (next && visible && !next._visible) {
        next = next._next;
    }
    return next;
};

Class.prototype.last = function(visible) {
    var prev = this._last;
    while (prev && visible && !prev._visible) {
        prev = prev._prev;
    }
    return prev;
};

Class.prototype.visit = function(visitor, data) {
    var reverse = visitor.reverse;
    var visible = visitor.visible;
    if (visitor.start && visitor.start(this, data)) {
        return;
    }
    var child, next = reverse ? this.last(visible) : this.first(visible);
    while (child = next) {
        next = reverse ? child.prev(visible) : child.next(visible);
        if (child.visit(visitor, data)) {
            return true;
        }
    }
    return visitor.end && visitor.end(this, data);
};

Class.prototype.append = function(child, more) {
    if (is.array(child)) for (var i = 0; i < child.length; i++) append(this, child[i]); else if (typeof more !== "undefined") // deprecated
    for (var i = 0; i < arguments.length; i++) append(this, arguments[i]); else if (typeof child !== "undefined") append(this, child);
    return this;
};

Class.prototype.prepend = function(child, more) {
    if (is.array(child)) for (var i = child.length - 1; i >= 0; i--) prepend(this, child[i]); else if (typeof more !== "undefined") // deprecated
    for (var i = arguments.length - 1; i >= 0; i--) prepend(this, arguments[i]); else if (typeof child !== "undefined") prepend(this, child);
    return this;
};

Class.prototype.appendTo = function(parent) {
    append(parent, this);
    return this;
};

Class.prototype.prependTo = function(parent) {
    prepend(parent, this);
    return this;
};

Class.prototype.insertNext = function(sibling, more) {
    if (is.array(sibling)) for (var i = 0; i < sibling.length; i++) insertAfter(sibling[i], this); else if (typeof more !== "undefined") // deprecated
    for (var i = 0; i < arguments.length; i++) insertAfter(arguments[i], this); else if (typeof sibling !== "undefined") insertAfter(sibling, this);
    return this;
};

Class.prototype.insertPrev = function(sibling, more) {
    if (is.array(sibling)) for (var i = sibling.length - 1; i >= 0; i--) insertBefore(sibling[i], this); else if (typeof more !== "undefined") // deprecated
    for (var i = arguments.length - 1; i >= 0; i--) insertBefore(arguments[i], this); else if (typeof sibling !== "undefined") insertBefore(sibling, this);
    return this;
};

Class.prototype.insertAfter = function(prev) {
    insertAfter(this, prev);
    return this;
};

Class.prototype.insertBefore = function(next) {
    insertBefore(this, next);
    return this;
};

function append(parent, child) {
    _ensure(child);
    _ensure(parent);
    child.remove();
    if (parent._last) {
        parent._last._next = child;
        child._prev = parent._last;
    }
    child._parent = parent;
    parent._last = child;
    if (!parent._first) {
        parent._first = child;
    }
    child._parent._flag(child, true);
    child._ts_parent = ++iid;
    parent._ts_children = ++iid;
    parent.touch();
}

function prepend(parent, child) {
    _ensure(child);
    _ensure(parent);
    child.remove();
    if (parent._first) {
        parent._first._prev = child;
        child._next = parent._first;
    }
    child._parent = parent;
    parent._first = child;
    if (!parent._last) {
        parent._last = child;
    }
    child._parent._flag(child, true);
    child._ts_parent = ++iid;
    parent._ts_children = ++iid;
    parent.touch();
}

function insertBefore(self, next) {
    _ensure(self);
    _ensure(next);
    self.remove();
    var parent = next._parent;
    var prev = next._prev;
    next._prev = self;
    prev && (prev._next = self) || parent && (parent._first = self);
    self._parent = parent;
    self._prev = prev;
    self._next = next;
    self._parent._flag(self, true);
    self._ts_parent = ++iid;
    self.touch();
}

function insertAfter(self, prev) {
    _ensure(self);
    _ensure(prev);
    self.remove();
    var parent = prev._parent;
    var next = prev._next;
    prev._next = self;
    next && (next._prev = self) || parent && (parent._last = self);
    self._parent = parent;
    self._prev = prev;
    self._next = next;
    self._parent._flag(self, true);
    self._ts_parent = ++iid;
    self.touch();
}

Class.prototype.remove = function(child, more) {
    if (typeof child !== "undefined") {
        if (is.array(child)) {
            for (var i = 0; i < child.length; i++) _ensure(child[i]).remove();
        } else if (typeof more !== "undefined") {
            for (var i = 0; i < arguments.length; i++) _ensure(arguments[i]).remove();
        } else {
            _ensure(child).remove();
        }
        return this;
    }
    if (this._prev) {
        this._prev._next = this._next;
    }
    if (this._next) {
        this._next._prev = this._prev;
    }
    if (this._parent) {
        if (this._parent._first === this) {
            this._parent._first = this._next;
        }
        if (this._parent._last === this) {
            this._parent._last = this._prev;
        }
        this._parent._flag(this, false);
        this._parent._ts_children = ++iid;
        this._parent.touch();
    }
    this._prev = this._next = this._parent = null;
    this._ts_parent = ++iid;
    // this._parent.touch();
    return this;
};

Class.prototype.empty = function() {
    var child, next = this._first;
    while (child = next) {
        next = child._next;
        child._prev = child._next = child._parent = null;
        this._flag(child, false);
    }
    this._first = this._last = null;
    this._ts_children = ++iid;
    this.touch();
    return this;
};

Class.prototype.touch = function() {
    this._ts_touch = ++iid;
    this._parent && this._parent.touch();
    return this;
};

/**
 * Deep flags used for optimizing event distribution.
 */
Class.prototype._flag = function(obj, name) {
    if (typeof name === "undefined") {
        return this._flags !== null && this._flags[obj] || 0;
    }
    if (typeof obj === "string") {
        if (name) {
            this._flags = this._flags || {};
            if (!this._flags[obj] && this._parent) {
                this._parent._flag(obj, true);
            }
            this._flags[obj] = (this._flags[obj] || 0) + 1;
        } else if (this._flags && this._flags[obj] > 0) {
            if (this._flags[obj] == 1 && this._parent) {
                this._parent._flag(obj, false);
            }
            this._flags[obj] = this._flags[obj] - 1;
        }
    }
    if (typeof obj === "object") {
        if (obj._flags) {
            for (var type in obj._flags) {
                if (obj._flags[type] > 0) {
                    this._flag(type, name);
                }
            }
        }
    }
    return this;
};

function _ensure(obj) {
    if (obj && obj instanceof Class) {
        return obj;
    }
    throw "Invalid node: " + obj;
}

module.exports = Class;


},{"./core":8,"./util/is":23}],16:[function(require,module,exports){
var Class = require("./core");

var Matrix = require("./matrix");

var iid = 0;

Class._init(function() {
    this._pin = new Pin(this);
});

Class.prototype.matrix = function() {
    return this._pin.absoluteMatrix();
};

Class.prototype.pin = function(a, b) {
    if (typeof a === "object") {
        this._pin.set(a);
        return this;
    } else if (typeof a === "string") {
        if (typeof b === "undefined") {
            return this._pin.get(a);
        } else {
            this._pin.set(a, b);
            return this;
        }
    } else if (typeof a === "undefined") {
        return this._pin;
    }
};

function Pin(owner) {
    this._owner = owner;
    this._parent = null;
    // relative to parent
    this._relativeMatrix = new Matrix();
    // relative to stage
    this._absoluteMatrix = new Matrix();
    this.reset();
}

Pin.prototype.reset = function() {
    this._textureAlpha = 1;
    this._alpha = 1;
    this._width = 0;
    this._height = 0;
    this._scaleX = 1;
    this._scaleY = 1;
    this._skewX = 0;
    this._skewY = 0;
    this._rotation = 0;
    // scale/skew/rotate center
    this._pivoted = false;
    this._pivotX = null;
    this._pivotY = null;
    // self pin point
    this._handled = false;
    this._handleX = 0;
    this._handleY = 0;
    // parent pin point
    this._aligned = false;
    this._alignX = 0;
    this._alignY = 0;
    // as seen by parent px
    this._offsetX = 0;
    this._offsetY = 0;
    this._boxX = 0;
    this._boxY = 0;
    this._boxWidth = this._width;
    this._boxHeight = this._height;
    // TODO: also set for owner
    this._ts_translate = ++iid;
    this._ts_transform = ++iid;
    this._ts_matrix = ++iid;
};

Pin.prototype._update = function() {
    this._parent = this._owner._parent && this._owner._parent._pin;
    // if handled and transformed then be translated
    if (this._handled && this._mo_handle != this._ts_transform) {
        this._mo_handle = this._ts_transform;
        this._ts_translate = ++iid;
    }
    if (this._aligned && this._parent && this._mo_align != this._parent._ts_transform) {
        this._mo_align = this._parent._ts_transform;
        this._ts_translate = ++iid;
    }
    return this;
};

Pin.prototype.toString = function() {
    return this._owner + " (" + (this._parent ? this._parent._owner : null) + ")";
};

// TODO: ts fields require refactoring
Pin.prototype.absoluteMatrix = function() {
    this._update();
    var ts = Math.max(this._ts_transform, this._ts_translate, this._parent ? this._parent._ts_matrix : 0);
    if (this._mo_abs == ts) {
        return this._absoluteMatrix;
    }
    this._mo_abs = ts;
    var abs = this._absoluteMatrix;
    abs.copyFrom(this.relativeMatrix());
    this._parent && abs.concat(this._parent._absoluteMatrix);
    this._ts_matrix = ++iid;
    return abs;
};

Pin.prototype.relativeMatrix = function() {
    this._update();
    var ts = Math.max(this._ts_transform, this._ts_translate, this._parent ? this._parent._ts_transform : 0);
    if (this._mo_rel == ts) {
        return this._relativeMatrix;
    }
    this._mo_rel = ts;
    var rel = this._relativeMatrix;
    rel.identity();
    if (this._pivoted) {
        rel.translate(-this._pivotX * this._width, -this._pivotY * this._height);
    }
    rel.scale(this._scaleX, this._scaleY);
    rel.skew(this._skewX, this._skewY);
    rel.rotate(this._rotation);
    if (this._pivoted) {
        rel.translate(this._pivotX * this._width, this._pivotY * this._height);
    }
    // calculate effective box
    if (this._pivoted) {
        // origin
        this._boxX = 0;
        this._boxY = 0;
        this._boxWidth = this._width;
        this._boxHeight = this._height;
    } else {
        // aabb
        var p, q;
        if (rel.a > 0 && rel.c > 0 || rel.a < 0 && rel.c < 0) {
            p = 0, q = rel.a * this._width + rel.c * this._height;
        } else {
            p = rel.a * this._width, q = rel.c * this._height;
        }
        if (p > q) {
            this._boxX = q;
            this._boxWidth = p - q;
        } else {
            this._boxX = p;
            this._boxWidth = q - p;
        }
        if (rel.b > 0 && rel.d > 0 || rel.b < 0 && rel.d < 0) {
            p = 0, q = rel.b * this._width + rel.d * this._height;
        } else {
            p = rel.b * this._width, q = rel.d * this._height;
        }
        if (p > q) {
            this._boxY = q;
            this._boxHeight = p - q;
        } else {
            this._boxY = p;
            this._boxHeight = q - p;
        }
    }
    this._x = this._offsetX;
    this._y = this._offsetY;
    this._x -= this._boxX + this._handleX * this._boxWidth;
    this._y -= this._boxY + this._handleY * this._boxHeight;
    if (this._aligned && this._parent) {
        this._parent.relativeMatrix();
        this._x += this._alignX * this._parent._width;
        this._y += this._alignY * this._parent._height;
    }
    rel.translate(this._x, this._y);
    return this._relativeMatrix;
};

Pin.prototype.get = function(a) {
    return Pin._get(this, a);
};

// TODO: Use get/set or defineProperty instead?
Pin.prototype.set = function(a, b) {
    if (typeof a === "string") {
        Pin._set(this, a, b);
    } else if (typeof a === "object") {
        for (b in a) Pin._set(this, b, a[b], a);
    }
    if (this._owner) {
        this._owner._ts_pin = ++iid;
        this._owner.touch();
    }
    return this;
};

Pin._get = function(pin, key) {
    if (typeof (key = Pin._getters[key]) !== "undefined") {
        return key.call(Pin._getters, pin);
    }
};

Pin._set = function(pin, key, value, all) {
    if (typeof (key = Pin._setters[key]) !== "undefined" && typeof value !== "undefined") {
        key.call(Pin._setters, pin, value, all);
    }
};

Pin._getters = {
    alpha: function(pin) {
        return pin._alpha;
    },
    textureAlpha: function(pin) {
        return pin._textureAlpha;
    },
    width: function(pin) {
        return pin._width;
    },
    height: function(pin) {
        return pin._height;
    },
    boxWidth: function(pin) {
        return pin._boxWidth;
    },
    boxHeight: function(pin) {
        return pin._boxHeight;
    },
    // scale : function(pin) {
    // },
    scaleX: function(pin) {
        return pin._scaleX;
    },
    scaleY: function(pin) {
        return pin._scaleY;
    },
    // skew : function(pin) {
    // },
    skewX: function(pin) {
        return pin._skewX;
    },
    skewY: function(pin) {
        return pin._skewY;
    },
    rotation: function(pin) {
        return pin._rotation;
    },
    // pivot : function(pin) {
    // },
    pivotX: function(pin) {
        return pin._pivotX;
    },
    pivotY: function(pin) {
        return pin._pivotY;
    },
    // offset : function(pin) {
    // },
    offsetX: function(pin) {
        return pin._offsetX;
    },
    offsetY: function(pin) {
        return pin._offsetY;
    },
    // align : function(pin) {
    // },
    alignX: function(pin) {
        return pin._alignX;
    },
    alignY: function(pin) {
        return pin._alignY;
    },
    // handle : function(pin) {
    // },
    handleX: function(pin) {
        return pin._handleX;
    },
    handleY: function(pin) {
        return pin._handleY;
    }
};

Pin._setters = {
    alpha: function(pin, value) {
        pin._alpha = value;
    },
    textureAlpha: function(pin, value) {
        pin._textureAlpha = value;
    },
    width: function(pin, value) {
        pin._width_ = value;
        pin._width = value;
        pin._ts_transform = ++iid;
    },
    height: function(pin, value) {
        pin._height_ = value;
        pin._height = value;
        pin._ts_transform = ++iid;
    },
    scale: function(pin, value) {
        pin._scaleX = value;
        pin._scaleY = value;
        pin._ts_transform = ++iid;
    },
    scaleX: function(pin, value) {
        pin._scaleX = value;
        pin._ts_transform = ++iid;
    },
    scaleY: function(pin, value) {
        pin._scaleY = value;
        pin._ts_transform = ++iid;
    },
    skew: function(pin, value) {
        pin._skewX = value;
        pin._skewY = value;
        pin._ts_transform = ++iid;
    },
    skewX: function(pin, value) {
        pin._skewX = value;
        pin._ts_transform = ++iid;
    },
    skewY: function(pin, value) {
        pin._skewY = value;
        pin._ts_transform = ++iid;
    },
    rotation: function(pin, value) {
        pin._rotation = value;
        pin._ts_transform = ++iid;
    },
    pivot: function(pin, value) {
        pin._pivotX = value;
        pin._pivotY = value;
        pin._pivoted = true;
        pin._ts_transform = ++iid;
    },
    pivotX: function(pin, value) {
        pin._pivotX = value;
        pin._pivoted = true;
        pin._ts_transform = ++iid;
    },
    pivotY: function(pin, value) {
        pin._pivotY = value;
        pin._pivoted = true;
        pin._ts_transform = ++iid;
    },
    offset: function(pin, value) {
        pin._offsetX = value;
        pin._offsetY = value;
        pin._ts_translate = ++iid;
    },
    offsetX: function(pin, value) {
        pin._offsetX = value;
        pin._ts_translate = ++iid;
    },
    offsetY: function(pin, value) {
        pin._offsetY = value;
        pin._ts_translate = ++iid;
    },
    align: function(pin, value) {
        this.alignX(pin, value);
        this.alignY(pin, value);
    },
    alignX: function(pin, value) {
        pin._alignX = value;
        pin._aligned = true;
        pin._ts_translate = ++iid;
        this.handleX(pin, value);
    },
    alignY: function(pin, value) {
        pin._alignY = value;
        pin._aligned = true;
        pin._ts_translate = ++iid;
        this.handleY(pin, value);
    },
    handle: function(pin, value) {
        this.handleX(pin, value);
        this.handleY(pin, value);
    },
    handleX: function(pin, value) {
        pin._handleX = value;
        pin._handled = true;
        pin._ts_translate = ++iid;
    },
    handleY: function(pin, value) {
        pin._handleY = value;
        pin._handled = true;
        pin._ts_translate = ++iid;
    },
    resizeMode: function(pin, value, all) {
        if (all) {
            if (value == "in") {
                value = "in-pad";
            } else if (value == "out") {
                value = "out-crop";
            }
            pin._scaleTo(all.resizeWidth, all.resizeHeight, value);
        }
    },
    resizeWidth: function(pin, value, all) {
        if (!all || !all.resizeMode) {
            pin._scaleTo(value, null);
        }
    },
    resizeHeight: function(pin, value, all) {
        if (!all || !all.resizeMode) {
            pin._scaleTo(null, value);
        }
    },
    scaleMode: function(pin, value, all) {
        if (all) {
            pin._scaleTo(all.scaleWidth, all.scaleHeight, value);
        }
    },
    scaleWidth: function(pin, value, all) {
        if (!all || !all.scaleMode) {
            pin._scaleTo(value, null);
        }
    },
    scaleHeight: function(pin, value, all) {
        if (!all || !all.scaleMode) {
            pin._scaleTo(null, value);
        }
    },
    matrix: function(pin, value) {
        this.scaleX(pin, value.a);
        this.skewX(pin, value.c / value.d);
        this.skewY(pin, value.b / value.a);
        this.scaleY(pin, value.d);
        this.offsetX(pin, value.e);
        this.offsetY(pin, value.f);
        this.rotation(pin, 0);
    }
};

Pin.prototype._scaleTo = function(width, height, mode) {
    var w = typeof width === "number";
    var h = typeof height === "number";
    var m = typeof mode === "string";
    var pin = this;
    pin._ts_transform = ++iid;
    if (w) {
        pin._scaleX = width / pin._width_;
        pin._width = pin._width_;
    }
    if (h) {
        pin._scaleY = height / pin._height_;
        pin._height = pin._height_;
    }
    if (w && h && m) {
        if (mode == "out" || mode == "out-crop") {
            pin._scaleX = pin._scaleY = Math.max(pin._scaleX, pin._scaleY);
        } else if (mode == "in" || mode == "in-pad") {
            pin._scaleX = pin._scaleY = Math.min(pin._scaleX, pin._scaleY);
        }
        if (mode == "out-crop" || mode == "in-pad") {
            pin._width = width / pin._scaleX;
            pin._height = height / pin._scaleY;
        }
    }
};

module.exports = Pin;


},{"./core":8,"./matrix":14}],17:[function(require,module,exports){
var Class = require("./core");

require("./pin");

var stats = require("./util/stats");

var create = require("./util/create");

Class.prototype._textures = null;

Class.prototype._tickBefore = null;

Class.prototype._tickAfter = null;

Class.prototype._alpha = 1;

Class.prototype.render = function(context) {
    if (!this._visible) {
        return;
    }
    stats.node++;
    var m = this.matrix();
    context.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    // move this elsewhere!
    this._alpha = this._pin._alpha * (this._parent ? this._parent._alpha : 1);
    var alpha = this._pin._textureAlpha * this._alpha;
    if (context.globalAlpha != alpha) {
        context.globalAlpha = alpha;
    }
    if (this._textures !== null) {
        for (var i = 0, n = this._textures.length; i < n; i++) {
            this._textures[i].draw(context);
        }
    }
    if (context.globalAlpha != this._alpha) {
        context.globalAlpha = this._alpha;
    }
    var child, next = this._first;
    while (child = next) {
        next = child._next;
        child.render(context);
    }
};

Class.prototype.MAX_ELAPSE = Infinity;

Class.prototype._tick = function(elapsed, now, last) {
    if (!this._visible) {
        return;
    }
    if (elapsed > this.MAX_ELAPSE) {
        elapsed = this.MAX_ELAPSE;
    }
    var ticked = false;
    if (this._tickBefore !== null) {
        for (var i = 0, n = this._tickBefore.length; i < n; i++) {
            stats.tick++;
            ticked = this._tickBefore[i].call(this, elapsed, now, last) === true || ticked;
        }
    }
    var child, next = this._first;
    while (child = next) {
        next = child._next;
        if (child._flag("_tick")) {
            ticked = child._tick(elapsed, now, last) === true ? true : ticked;
        }
    }
    if (this._tickAfter !== null) {
        for (var i = 0, n = this._tickAfter.length; i < n; i++) {
            stats.tick++;
            ticked = this._tickAfter[i].call(this, elapsed, now, last) === true || ticked;
        }
    }
    return ticked;
};

Class.prototype.tick = function(ticker, before) {
    if (typeof ticker !== "function") {
        return;
    }
    if (before) {
        if (this._tickBefore === null) {
            this._tickBefore = [];
        }
        this._tickBefore.push(ticker);
    } else {
        if (this._tickAfter === null) {
            this._tickAfter = [];
        }
        this._tickAfter.push(ticker);
    }
    this._flag("_tick", this._tickAfter !== null && this._tickAfter.length > 0 || this._tickBefore !== null && this._tickBefore.length > 0);
};

Class.prototype.untick = function(ticker) {
    if (typeof ticker !== "function") {
        return;
    }
    var i;
    if (this._tickBefore !== null && (i = this._tickBefore.indexOf(ticker)) >= 0) {
        this._tickBefore.splice(i, 1);
    }
    if (this._tickAfter !== null && (i = this._tickAfter.indexOf(ticker)) >= 0) {
        this._tickAfter.splice(i, 1);
    }
};


},{"./core":8,"./pin":16,"./util/create":21,"./util/stats":27}],18:[function(require,module,exports){
var Class = require("./core");

require("./pin");

require("./render");

var stats = require("./util/stats");

var create = require("./util/create");

var extend = require("./util/extend");

Root._super = Class;

Root.prototype = create(Root._super.prototype);

Class.root = function(request, render) {
    return new Root(request, render);
};

function Root(request, render) {
    Root._super.call(this);
    this.label("Root");
    this._paused = true;
    var self = this;
    var lastTime = 0;
    var loop = function(now) {
        if (self._paused === true) {
            return;
        }
        stats.tick = stats.node = stats.draw = 0;
        var last = lastTime || now;
        var elapsed = now - last;
        lastTime = now;
        var ticked = self._tick(elapsed, now, last);
        if (self._mo_touch != self._ts_touch) {
            self._mo_touch = self._ts_touch;
            render.call(self);
            self.request();
        } else if (ticked) {
            self.request();
        } else {
            self.pause();
        }
        stats.fps = elapsed ? 1e3 / elapsed : 0;
    };
    this.request = function() {
        request(loop);
    };
}

Root.prototype.start = function() {
    return this.resume();
};

Root.prototype.resume = function(force) {
    if (this._paused || force) {
        this._paused = false;
        this.request();
    }
    return this;
};

Root.prototype.pause = function() {
    this._paused = true;
    return this;
};

Root.prototype.touch = function() {
    this.resume();
    return Root._super.prototype.touch.call(this);
};

Root.prototype.background = function(color) {
    // to be implemented by loaders
    return this;
};

Root.prototype.viewport = function(width, height, ratio) {
    if (typeof width === "undefined") {
        return extend({}, this._viewport);
    }
    this._viewport = {
        width: width,
        height: height,
        ratio: ratio || 1
    };
    this._updateViewbox();
    var data = extend({}, this._viewport);
    this.visit({
        start: function(node) {
            if (!node._flag("viewport")) {
                return true;
            }
            node.publish("viewport", [ data ]);
        }
    });
    return this;
};

// TODO: static/fixed viewbox
Root.prototype.viewbox = function(width, height, mode) {
    this._viewbox = {
        width: width,
        height: height,
        mode: /^(in|out|in-pad|out-crop)$/.test(mode) ? mode : "in-pad"
    };
    this._updateViewbox();
    return this;
};

Root.prototype._updateViewbox = function() {
    var box = this._viewbox;
    var size = this._viewport;
    if (size && box) {
        this.pin({
            width: box.width,
            height: box.height
        });
        this._pin._scaleTo(size.width, size.height, box.mode);
    } else if (size) {
        this.pin({
            width: size.width,
            height: size.height
        });
    }
};


},{"./core":8,"./pin":16,"./render":17,"./util/create":21,"./util/extend":22,"./util/stats":27}],19:[function(require,module,exports){
var Class = require("./core");

require("./pin");

require("./render");

var create = require("./util/create");

var is = require("./util/is");

Class.string = function(frames) {
    return new Str().frames(frames);
};

Str._super = Class;

Str.prototype = create(Str._super.prototype);

function Str() {
    Str._super.call(this);
    this.label("String");
    this._textures = [];
}

/**
 * @deprecated Use frames
 */
Str.prototype.setFont = function(a, b, c) {
    return this.frames(a, b, c);
};

Str.prototype.frames = function(frames) {
    this._textures = [];
    if (typeof frames == "string") {
        frames = Class.texture(frames);
        this._item = function(value) {
            return frames.one(value);
        };
    } else if (typeof frames === "object") {
        this._item = function(value) {
            return frames[value];
        };
    } else if (typeof frames === "function") {
        this._item = frames;
    }
    return this;
};

/**
 * @deprecated Use value
 */
Str.prototype.setValue = function(a, b, c) {
    return this.value(a, b, c);
};

Str.prototype.value = function(value) {
    if (typeof value === "undefined") {
        return this._value;
    }
    if (this._value === value) {
        return this;
    }
    this._value = value;
    if (value === null) {
        value = "";
    } else if (typeof value !== "string" && !is.array(value)) {
        value = value.toString();
    }
    this._spacing = this._spacing || 0;
    var width = 0, height = 0;
    for (var i = 0; i < value.length; i++) {
        var image = this._textures[i] = this._item(value[i]);
        width += i > 0 ? this._spacing : 0;
        image.dest(width, 0);
        width = width + image.width;
        height = Math.max(height, image.height);
    }
    this.pin("width", width);
    this.pin("height", height);
    this._textures.length = value.length;
    return this;
};


},{"./core":8,"./pin":16,"./render":17,"./util/create":21,"./util/is":23}],20:[function(require,module,exports){
var stats = require("./util/stats");

var math = require("./util/math");

function Texture(image, ratio) {
    if (typeof image === "object") {
        this.src(image, ratio);
    }
}

Texture.prototype.pipe = function() {
    return new Texture(this);
};

/**
 * Signatures: (image), (x, y, w, h), (w, h)
 */
Texture.prototype.src = function(x, y, w, h) {
    if (typeof x === "object") {
        var image = x, ratio = y || 1;
        this._image = image;
        this._sx = this._dx = 0;
        this._sy = this._dy = 0;
        this._sw = this._dw = image.width / ratio;
        this._sh = this._dh = image.height / ratio;
        this.width = image.width / ratio;
        this.height = image.height / ratio;
        this.ratio = ratio;
    } else {
        if (typeof w === "undefined") {
            w = x, h = y;
        } else {
            this._sx = x, this._sy = y;
        }
        this._sw = this._dw = w;
        this._sh = this._dh = h;
        this.width = w;
        this.height = h;
    }
    return this;
};

/**
 * Signatures: (x, y, w, h), (x, y)
 */
Texture.prototype.dest = function(x, y, w, h) {
    this._dx = x, this._dy = y;
    this._dx = x, this._dy = y;
    if (typeof w !== "undefined") {
        this._dw = w, this._dh = h;
        this.width = w, this.height = h;
    }
    return this;
};

Texture.prototype.draw = function(context, x1, y1, x2, y2, x3, y3, x4, y4) {
    var image = this._image;
    if (image === null || typeof image !== "object") {
        return;
    }
    var sx = this._sx, sy = this._sy;
    var sw = this._sw, sh = this._sh;
    var dx = this._dx, dy = this._dy;
    var dw = this._dw, dh = this._dh;
    if (typeof x3 !== "undefined") {
        x1 = math.limit(x1, 0, this._sw), x2 = math.limit(x2, 0, this._sw - x1);
        y1 = math.limit(y1, 0, this._sh), y2 = math.limit(y2, 0, this._sh - y1);
        sx += x1, sy += y1, sw = x2, sh = y2;
        dx = x3, dy = y3, dw = x4, dh = y4;
    } else if (typeof x2 !== "undefined") {
        dx = x1, dy = y1, dw = x2, dh = y2;
    } else if (typeof x1 !== "undefined") {
        dw = x1, dh = y1;
    }
    var ratio = this.ratio || 1;
    sx *= ratio, sy *= ratio, sw *= ratio, sh *= ratio;
    try {
        if (typeof image.draw === "function") {
            image.draw(context, sx, sy, sw, sh, dx, dy, dw, dh);
        } else {
            stats.draw++;
            context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    } catch (ex) {
        if (!image._draw_failed) {
            console.log("Unable to draw: ", image);
            console.log(ex);
            image._draw_failed = true;
        }
    }
};

module.exports = Texture;


},{"./util/math":24,"./util/stats":27}],21:[function(require,module,exports){
if (typeof Object.create == "function") {
    module.exports = function(proto, props) {
        return Object.create.call(Object, proto, props);
    };
} else {
    module.exports = function(proto, props) {
        if (props) throw Error("Second argument is not supported!");
        if (typeof proto !== "object" || proto === null) throw Error("Invalid prototype!");
        noop.prototype = proto;
        return new noop();
    };
    function noop() {}
}


},{}],22:[function(require,module,exports){
module.exports = function(base) {
    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                base[key] = obj[key];
            }
        }
    }
    return base;
};


},{}],23:[function(require,module,exports){
var objProto = Object.prototype;

var owns = objProto.hasOwnProperty;

var toStr = objProto.toString;

var NON_HOST_TYPES = {
    "boolean": 1,
    number: 1,
    string: 1,
    undefined: 1
};

var hexRegex = /^[A-Fa-f0-9]+$/;

var is = module.exports = {};

is.a = is.an = is.type = function(value, type) {
    return typeof value === type;
};

is.defined = function(value) {
    return typeof value !== "undefined";
};

is.empty = function(value) {
    var type = toStr.call(value);
    var key;
    if ("[object Array]" === type || "[object Arguments]" === type || "[object String]" === type) {
        return value.length === 0;
    }
    if ("[object Object]" === type) {
        for (key in value) {
            if (owns.call(value, key)) {
                return false;
            }
        }
        return true;
    }
    return !value;
};

is.equal = function(value, other) {
    if (value === other) {
        return true;
    }
    var type = toStr.call(value);
    var key;
    if (type !== toStr.call(other)) {
        return false;
    }
    if ("[object Object]" === type) {
        for (key in value) {
            if (!is.equal(value[key], other[key]) || !(key in other)) {
                return false;
            }
        }
        for (key in other) {
            if (!is.equal(value[key], other[key]) || !(key in value)) {
                return false;
            }
        }
        return true;
    }
    if ("[object Array]" === type) {
        key = value.length;
        if (key !== other.length) {
            return false;
        }
        while (--key) {
            if (!is.equal(value[key], other[key])) {
                return false;
            }
        }
        return true;
    }
    if ("[object Function]" === type) {
        return value.prototype === other.prototype;
    }
    if ("[object Date]" === type) {
        return value.getTime() === other.getTime();
    }
    return false;
};

is.instance = function(value, constructor) {
    return value instanceof constructor;
};

is.nil = function(value) {
    return value === null;
};

is.undef = function(value) {
    return typeof value === "undefined";
};

is.array = function(value) {
    return "[object Array]" === toStr.call(value);
};

is.emptyarray = function(value) {
    return is.array(value) && value.length === 0;
};

is.arraylike = function(value) {
    return !!value && !is.boolean(value) && owns.call(value, "length") && isFinite(value.length) && is.number(value.length) && value.length >= 0;
};

is.boolean = function(value) {
    return "[object Boolean]" === toStr.call(value);
};

is.element = function(value) {
    return value !== undefined && typeof HTMLElement !== "undefined" && value instanceof HTMLElement && value.nodeType === 1;
};

is.fn = function(value) {
    return "[object Function]" === toStr.call(value);
};

is.number = function(value) {
    return "[object Number]" === toStr.call(value);
};

is.nan = function(value) {
    return !is.number(value) || value !== value;
};

is.object = function(value) {
    return "[object Object]" === toStr.call(value);
};

is.hash = function(value) {
    return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

is.regexp = function(value) {
    return "[object RegExp]" === toStr.call(value);
};

is.string = function(value) {
    return "[object String]" === toStr.call(value);
};

is.hex = function(value) {
    return is.string(value) && (!value.length || hexRegex.test(value));
};


},{}],24:[function(require,module,exports){
module.exports.random = function(min, max) {
    if (typeof min === "undefined") {
        max = 1, min = 0;
    } else if (typeof max === "undefined") {
        max = min, min = 0;
    }
    return min == max ? min : Math.random() * (max - min) + min;
};

module.exports.rotate = function(num, min, max) {
    if (typeof min === "undefined") {
        max = 1, min = 0;
    } else if (typeof max === "undefined") {
        max = min, min = 0;
    }
    if (max > min) {
        num = (num - min) % (max - min);
        return num + (num < 0 ? max : min);
    } else {
        num = (num - max) % (min - max);
        return num + (num <= 0 ? min : max);
    }
};

module.exports.limit = function(num, min, max) {
    if (num < min) {
        return min;
    } else if (num > max) {
        return max;
    } else {
        return num;
    }
};

module.exports.length = function(x, y) {
    return Math.sqrt(x * x + y * y);
};


},{}],25:[function(require,module,exports){
module.exports = function(fn, ctx) {
    var called = false;
    return function() {
        if (!called) {
            called = true;
            fn.apply(ctx, arguments);
        }
    };
};


},{}],26:[function(require,module,exports){
module.exports = function(img, owidth, oheight, stretch, inner, insert) {
    var width = img.width;
    var height = img.height;
    var left = img.left;
    var right = img.right;
    var top = img.top;
    var bottom = img.bottom;
    left = typeof left === "number" && left === left ? left : 0;
    right = typeof right === "number" && right === right ? right : 0;
    top = typeof top === "number" && top === top ? top : 0;
    bottom = typeof bottom === "number" && bottom === bottom ? bottom : 0;
    width = width - left - right;
    height = height - top - bottom;
    if (!inner) {
        owidth = Math.max(owidth - left - right, 0);
        oheight = Math.max(oheight - top - bottom, 0);
    }
    var i = 0;
    if (top > 0 && left > 0) insert(i++, 0, 0, left, top, 0, 0, left, top);
    if (bottom > 0 && left > 0) insert(i++, 0, height + top, left, bottom, 0, oheight + top, left, bottom);
    if (top > 0 && right > 0) insert(i++, width + left, 0, right, top, owidth + left, 0, right, top);
    if (bottom > 0 && right > 0) insert(i++, width + left, height + top, right, bottom, owidth + left, oheight + top, right, bottom);
    if (stretch) {
        if (top > 0) insert(i++, left, 0, width, top, left, 0, owidth, top);
        if (bottom > 0) insert(i++, left, height + top, width, bottom, left, oheight + top, owidth, bottom);
        if (left > 0) insert(i++, 0, top, left, height, 0, top, left, oheight);
        if (right > 0) insert(i++, width + left, top, right, height, owidth + left, top, right, oheight);
        // center
        insert(i++, left, top, width, height, left, top, owidth, oheight);
    } else {
        // tile
        var l = left, r = owidth, w;
        while (r > 0) {
            w = Math.min(width, r), r -= width;
            var t = top, b = oheight, h;
            while (b > 0) {
                h = Math.min(height, b), b -= height;
                insert(i++, left, top, w, h, l, t, w, h);
                if (r <= 0) {
                    if (left) insert(i++, 0, top, left, h, 0, t, left, h);
                    if (right) insert(i++, width + left, top, right, h, l + w, t, right, h);
                }
                t += h;
            }
            if (top) insert(i++, left, 0, w, top, l, 0, w, top);
            if (bottom) insert(i++, left, height + top, w, bottom, l, t, w, bottom);
            l += w;
        }
    }
    return i;
};


},{}],27:[function(require,module,exports){
module.exports = {};


},{}],28:[function(require,module,exports){
module.exports.startsWith = function(str, sub) {
    return typeof str === "string" && typeof sub === "string" && str.substring(0, sub.length) == sub;
};


},{}]},{},[1])(1)
});