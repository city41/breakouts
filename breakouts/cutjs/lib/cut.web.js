/*
 * CutJS
 * Copyright (c) 2013-2014 Ali Shakiba, Piqnt LLC and other contributors
 * Available under the MIT license
 * @license
 */
DEBUG = (typeof DEBUG === "undefined" || DEBUG) && console;

function Cut() {
    Cut._stats.create++;
    this._id = "";
    this._visible = true;
    this._parent = null;
    this._next = null;
    this._prev = null;
    this._first = null;
    this._last = null;
    this._pin = new Cut.Pin(this);
    this._outs = [];
    this._tickBefore = [];
    this._tickAfter = [];
    this._alpha = 1;
}

Cut._create = function() {
    if (typeof Object.create == "function") {
        return function() {
            return Object.create.apply(null, arguments);
        };
    } else {
        var F = function() {};
        return function(proto) {
            if (arguments.length > 1) {
                throw Error("Second argument is not supported!");
            }
            if (proto === null || typeof proto != "object") {
                throw Error("Invalid prototype!");
            }
            F.prototype = proto;
            return new F();
        };
    }
}();

Cut._stats = {
    create: 0,
    tick: 0,
    paint: 0,
    paste: 0
};

Cut.create = function() {
    return new Cut();
};

Cut.prototype.render = function(context) {
    Cut._stats.tick = Cut._stats.paint = Cut._stats.paste = 0;
    var now = Cut._now();
    var elapsed = this._lastTime ? now - this._lastTime : 0;
    this._lastTime = now;
    this._tick(elapsed);
    this._paint(context);
    Cut._stats.fps = 1e3 / (Cut._now() - now);
};

Cut.prototype.MAX_ELAPSE = Infinity;

Cut.prototype._tick = function(elapsed) {
    if (!this._visible) {
        return;
    }
    if (elapsed > this.MAX_ELAPSE) {
        elapsed = this.MAX_ELAPSE;
    }
    this._pin.tick();
    var length = this._tickBefore.length;
    for (var i = 0; i < length; i++) {
        Cut._stats.tick++;
        this._tickBefore[i].call(this, elapsed);
    }
    var child, next = this._first;
    while (child = next) {
        next = child._next;
        child._tick(elapsed);
    }
    var length = this._tickAfter.length;
    for (var i = 0; i < length; i++) {
        Cut._stats.tick++;
        this._tickAfter[i].call(this, elapsed);
    }
};

Cut.prototype.tick = function(ticker, before) {
    if (before) {
        this._tickBefore.push(ticker);
    } else {
        this._tickAfter.push(ticker);
    }
};

Cut.prototype._paint = function(context) {
    if (!this._visible) {
        return;
    }
    Cut._stats.paint++;
    var m = this.matrix();
    context.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    this._alpha = this._pin._alpha * (this._parent ? this._parent._alpha : 1);
    var alpha = this._pin._textureAlpha * this._alpha;
    if (context.globalAlpha != alpha) {
        context.globalAlpha = alpha;
    }
    var length = this._outs.length;
    for (var i = 0; i < length; i++) {
        this._outs[i].paste(context);
    }
    if (context.globalAlpha != this._alpha) {
        context.globalAlpha = this._alpha;
    }
    var child, next = this._first;
    while (child = next) {
        next = child._next;
        child._paint(context);
    }
};

Cut.prototype.toString = function() {
    return "[" + this._id + "]";
};

Cut.prototype.id = function(id) {
    if (!arguments.length) {
        return this._id;
    }
    this._id = id;
    return this;
};

Cut.prototype.attr = function(name, value) {
    if (arguments.length < 2) {
        return this._attrs ? this._attrs[name] : undefined;
    }
    (this._attrs ? this._attrs : this._attrs = {})[name] = value;
    return this;
};

Cut.prototype.on = Cut.prototype.listen = function(types, listener) {
    if (typeof listener !== "function") {
        return this;
    }
    types = (Cut._isArray(types) ? types.join(" ") : types).split(/\s+/);
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (type) {
            this._listeners = this._listeners || {};
            this._listeners[type] = this._listeners[type] || [];
            this._listeners[type].push(listener);
        }
    }
    return this;
};

Cut.prototype.listeners = function(type) {
    return this._listeners && this._listeners[type];
};

Cut.prototype.publish = function(name, args) {
    var listeners = this.listeners(name);
    if (!listeners || !listeners.length) {
        return false;
    }
    for (var l = 0; l < listeners.length; l++) {
        listeners[l].apply(this, args);
    }
    return true;
};

Cut.prototype.visit = function(visitor) {
    var reverse = visitor.reverse;
    var visible = visitor.visible;
    if (visitor.start && visitor.start(this)) {
        return;
    }
    var child, next = reverse ? this.last(visible) : this.first(visible);
    while (child = next) {
        next = reverse ? child.prev(visible) : child.next(visible);
        if (child.visit(visitor, reverse)) {
            return true;
        }
    }
    return visitor.end && visitor.end(this);
};

Cut.prototype.visible = function(visible) {
    if (!arguments.length) {
        return this._visible;
    }
    this._visible = visible;
    this._parent && (this._parent._ts_children = Cut._TS++);
    this._ts_pin = Cut._TS++;
    this.touch();
    return this;
};

Cut.prototype.hide = function() {
    return this.visible(false);
};

Cut.prototype.show = function() {
    return this.visible(true);
};

Cut.prototype.parent = function() {
    return this._parent;
};

Cut.prototype.next = function(visible) {
    var next = this._next;
    while (next && visible && !next._visible) {
        next = next._next;
    }
    return next;
};

Cut.prototype.prev = function(visible) {
    var prev = this._prev;
    while (prev && visible && !prev._visible) {
        prev = prev._prev;
    }
    return prev;
};

Cut.prototype.first = function(visible) {
    var next = this._first;
    while (next && visible && !next._visible) {
        next = next._next;
    }
    return next;
};

Cut.prototype.last = function(visible) {
    var prev = this._last;
    while (prev && visible && !prev._visible) {
        prev = prev._prev;
    }
    return prev;
};

Cut.prototype.append = function() {
    for (var i = 0; i < arguments.length; i++) {
        if (!Cut._isCut(arguments[i])) {
            throw "It is not a Cut node!";
        }
        arguments[i].appendTo(this);
    }
    return this;
};

Cut.prototype.prepend = function() {
    for (var i = 0; i < arguments.length; i++) {
        if (!Cut._isCut(arguments[i])) {
            throw "It is not a Cut node!";
        }
        arguments[i].prependTo(this);
    }
    return this;
};

Cut.prototype.appendTo = function(parent) {
    if (!parent) {
        throw "Parent is null!";
    }
    if (!Cut._isCut(parent)) {
        throw "It is not a Cut node!";
    }
    this.remove();
    if (parent._last) {
        parent._last._next = this;
        this._prev = parent._last;
    }
    this._parent = parent;
    parent._last = this;
    if (!parent._first) {
        parent._first = this;
    }
    this._ts_parent = Cut._TS++;
    parent._ts_children = Cut._TS++;
    parent.touch();
    return this;
};

Cut.prototype.prependTo = function(parent) {
    if (!parent) {
        throw "Parent is null!";
    }
    if (!Cut._isCut(parent)) {
        throw "It is not a Cut node!";
    }
    this.remove();
    if (parent._first) {
        parent._first._prev = this;
        this._next = parent._first;
    }
    this._parent = parent;
    parent._first = this;
    if (!parent._last) {
        parent._last = this;
    }
    this._ts_parent = Cut._TS++;
    parent._ts_children = Cut._TS++;
    parent.touch();
    return this;
};

Cut.prototype.insertNext = function() {
    if (arguments.length) {
        for (var i = 0; i < arguments.length; i++) {
            if (!Cut._isCut(arguments[i])) {
                throw "It is not a Cut node!";
            }
            arguments[i] && arguments[i].insertAfter(this);
        }
    }
    return this;
};

Cut.prototype.insertPrev = function() {
    if (arguments.length) {
        for (var i = 0; i < arguments.length; i++) {
            if (!Cut._isCut(arguments[i])) {
                throw "It is not a Cut node!";
            }
            arguments[i] && arguments[i].insertBefore(this);
        }
    }
    return this;
};

Cut.prototype.insertBefore = function(next) {
    if (!next) {
        throw "Next is null!";
    }
    if (!Cut._isCut(next)) {
        throw "It is not a Cut node!";
    }
    this.remove();
    var parent = next._parent;
    var prev = next._prev;
    next._prev = this;
    prev && (prev._next = this) || parent && (parent._first = this);
    this._parent = parent;
    this._prev = prev;
    this._next = next;
    this._ts_parent = Cut._TS++;
    this.touch();
};

Cut.prototype.insertAfter = function(prev) {
    if (!prev) {
        throw "Prev is null!";
    }
    if (!Cut._isCut(prev)) {
        throw "It is not a Cut node!";
    }
    this.remove();
    var parent = prev._parent;
    var next = prev._next;
    prev._next = this;
    next && (next._prev = this) || parent && (parent._last = this);
    this._parent = parent;
    this._prev = prev;
    this._next = next;
    this._ts_parent = Cut._TS++;
    this.touch();
};

Cut.prototype.remove = function() {
    if (arguments.length) {
        for (var i = 0; i < arguments.length; i++) {
            if (!Cut._isCut(arguments[i])) {
                throw "It is not a Cut node!";
            }
            arguments[i] && arguments[i].remove();
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
    }
    if (this._parent) {
        this._parent._ts_children = Cut._TS++;
        this._parent.touch();
    }
    this._prev = this._next = this._parent = null;
    this._ts_parent = Cut._TS++;
    return this;
};

Cut.prototype.empty = function() {
    var child, next = this._first;
    while (child = next) {
        next = child._next;
        child._prev = child._next = child._parent = null;
    }
    this._first = this._last = null;
    this._ts_children = Cut._TS++;
    this.touch();
    return this;
};

Cut.prototype.touch = function() {
    this._ts_touch = Cut._TS++;
    this._parent && this._parent.touch();
    return this;
};

Cut.prototype.pin = function() {
    if (!arguments.length) {
        return this._pin;
    }
    var obj = this._pin.update.apply(this._pin, arguments);
    return obj === this._pin ? this : obj;
};

Cut.prototype.pinChildren = function(pin) {
    pin && Cut._extend(this._pinAll = this._pinAll || {}, pin);
    if (this._pinAllTicker) {
        return this;
    }
    this._pinAllTicker = function() {
        if (this._mo_pinAll == this._ts_children) {
            return;
        }
        this._mo_pinAll = this._ts_children;
        var child, next = this.first(true);
        while (child = next) {
            next = child.next(true);
            child.pin(this._pinAll);
        }
    };
    this.tick(this._pinAllTicker, true);
    return this;
};

Cut.prototype.matrix = function() {
    return this._pin.absoluteMatrix(this, this._parent ? this._parent._pin : null);
};

Cut.prototype.tween = function(duration, delay) {
    return (this._tween || (this._tween = new Cut.Tween(this))).tween(duration, delay);
};

Cut.Tween = function(cut) {
    var tween = this;
    this._owner = cut;
    this._queue = [];
    this._next = null;
    cut.tick(function(elapsed) {
        if (!tween._queue.length) {
            return;
        }
        this.touch();
        var head = tween._queue[0];
        if (!head.time) {
            head.time = 1;
        } else {
            head.time += elapsed;
        }
        if (head.time < head.delay) {
            return;
        }
        var prog = (head.time - head.delay) / head.duration;
        var over = prog >= 1;
        prog = prog > 1 ? 1 : prog;
        prog = head.easing ? head.easing(prog) : prog;
        if (!head.start) {
            head.start = {};
            for (var key in head.end) {
                var value = cut.pin(key);
                head.start[key] = value || 0;
            }
        }
        for (var key in head.start) {
            var start = head.start[key];
            var end = head.end[key];
            cut.pin(key, start + (end - start) * prog);
        }
        if (over) {
            tween._queue.shift();
            head.then && head.then.call(cut);
        }
    }, true);
};

Cut.Tween.prototype.tween = function(duration, delay) {
    this._next = {
        id: Cut._TS++,
        end: {},
        duration: duration || 400,
        delay: delay || 0
    };
    return this;
};

Cut.Tween.prototype.pin = function(pin) {
    if (this._next !== this._queue[this._queue.length - 1]) {
        this._owner.touch();
        this._queue.push(this._next);
    }
    var end = this._next.end;
    if (arguments.length === 1) {
        Cut._extend(end, arguments[0]);
    } else if (arguments.length === 2) {
        end[arguments[0]] = arguments[1];
    }
    return this;
};

Cut.Tween.prototype.clear = function(forward) {
    var tween;
    while (tween = this._queue.shift()) {
        forward && this._owner.pin(tween.end);
    }
    return this;
};

Cut.Tween.prototype.then = function(then) {
    this._next.then = then;
    return this;
};

Cut.Tween.prototype.easing = function(easing) {
    this._next.easing = easing;
    return this;
};

Cut.root = function(request, render) {
    return new Cut.Root(request, render);
};

Cut.Root = function(request, render) {
    Cut.String.prototype._super.apply(this, arguments);
    this._paused = true;
    this._render = render;
    this._request = request;
    var self = this;
    var requestCallback = function() {
        if (self._paused === true) {
            return;
        }
        self._mo_touch = self._ts_touch;
        self._render();
        self.request();
        self._mo_touch == self._ts_touch && self.pause();
    };
    this.request = function() {
        this._request.call(null, requestCallback);
    };
    this.on("viewport", function(width, height) {
        this._size = {
            width: width,
            height: height
        };
        this._updateViewbox();
        return true;
    });
};

Cut.Root.prototype = Cut._create(Cut.prototype);

Cut.Root.prototype._super = Cut;

Cut.Root.prototype.constructor = Cut.Root;

Cut.Root.prototype.viewbox = function(width, height, mode) {
    this._viewbox = {
        width: width,
        height: height,
        mode: typeof mode === "undefined" ? "in" : mode
    };
    this._updateViewbox();
    return this;
};

Cut.Root.prototype._updateViewbox = function() {
    var viewbox = this._viewbox;
    var size = this._size;
    if (!size) {} else if (viewbox) {
        this.pin({
            width: viewbox.width,
            height: viewbox.height,
            resizeMode: viewbox.mode,
            resizeWidth: size.width,
            resizeHeight: size.height
        });
    } else {
        this.pin({
            width: size.width,
            height: size.height
        });
    }
};

Cut.Root.prototype.start = function() {
    return this.resume();
};

Cut.Root.prototype.resume = function(force) {
    if (this._paused || force) {
        this._paused = false;
        this.request();
    }
    return this;
};

Cut.Root.prototype.pause = function() {
    this._paused = true;
    return this;
};

Cut.Root.prototype.touch = function() {
    this.resume();
    return Cut.prototype.touch.apply(this, arguments);
};

Cut.image = function(cutout) {
    var image = new Cut.Image();
    cutout && image.setImage(cutout);
    return image;
};

Cut.Image = function() {
    Cut.Image.prototype._super.apply(this, arguments);
};

Cut.Image.prototype = Cut._create(Cut.prototype);

Cut.Image.prototype._super = Cut;

Cut.Image.prototype.constructor = Cut.Image;

Cut.Image.prototype.setImage = function(cutout) {
    this._outs[0] = Cut.Out.select(cutout);
    this.pin({
        width: this._outs[0] ? this._outs[0].dWidth() : 0,
        height: this._outs[0] ? this._outs[0].dHeight() : 0
    });
    return this;
};

Cut.Image.prototype.cropX = function(w, x) {
    return this.setImage(this._outs[0].cropX(w, x));
};

Cut.Image.prototype.cropY = function(h, y) {
    return this.setImage(this._outs[0].cropY(h, y));
};

Cut.anim = function(cutouts, fps) {
    var anim = new Cut.Anim().setFrames(cutouts).gotoFrame(0);
    fps && anim.fps(fps);
    return anim;
};

Cut.Anim = function() {
    Cut.Anim.prototype._super.apply(this, arguments);
    this._fps = Cut.Anim.FPS;
    this._ft = 1e3 / this._fps;
    this._time = 0;
    this._frame = 0;
    this._frames = [];
    this._labels = {};
    this.tick(function() {
        if (this._time && this._frames.length > 1) {
            var t = Cut._now() - this._time;
            if (t >= this._ft) {
                var n = t < 2 * this._ft ? 1 : Math.floor(t / this._ft);
                this._time += n * this._ft;
                this.moveFrame(n);
                if (this._repeat && (this._repeat -= n) <= 0) {
                    this.stop();
                    this._callback && this._callback();
                }
            }
            this.touch();
        }
    }, false);
};

Cut.Anim.prototype = Cut._create(Cut.prototype);

Cut.Anim.prototype._super = Cut;

Cut.Anim.prototype.constructor = Cut.Anim;

Cut.Anim.FPS = 22;

Cut.Anim.prototype.fps = function(fps) {
    if (!arguments.length) {
        return this._fps;
    }
    this._fps = fps || Cut.Anim.FPS;
    this._ft = 1e3 / this._fps;
    return this;
};

Cut.Anim.prototype.setFrames = function(cutouts) {
    this._time = this._time || 0;
    this._frame = 0;
    this._frames = [];
    this._labels = {};
    cutouts = Cut.Out.select(cutouts, true);
    if (cutouts && cutouts.length) {
        for (var i = 0; i < cutouts.length; i++) {
            var cutout = cutouts[i];
            this._frames.push(cutout);
            this._labels[cutout.name] = i;
        }
    }
    return this;
};

Cut.Anim.prototype.length = function() {
    return this._frames ? this._frames.length : 0;
};

Cut.Anim.prototype.gotoFrame = function(frame, resize) {
    frame = Cut.Math.rotate(frame, this._frames.length) | 0;
    this._frame = frame;
    resize = resize || !this._outs[0];
    this._outs[0] = this._frames[this._frame];
    if (resize) {
        this.pin({
            width: this._outs[0].dWidth(),
            height: this._outs[0].dHeight()
        });
    }
    this._ts_frame = Cut._TS++;
    this.touch();
    return this;
};

Cut.Anim.prototype.moveFrame = function(move) {
    return this.gotoFrame(this._frame + move);
};

Cut.Anim.prototype.gotoLabel = function(label, resize) {
    return this.gotoFrame(this._labels[label] || 0, resize);
};

Cut.Anim.prototype.repeat = function(repeat, callback) {
    this._repeat = repeat * this._frames.length - 1;
    this._callback = callback;
    this.play();
    return this;
};

Cut.Anim.prototype.play = function(frame) {
    if (arguments.length) {
        this.gotoFrame(frame);
        this._time = Cut._now();
    } else if (!this._time) {
        this._time = Cut._now();
    }
    return this;
};

Cut.Anim.prototype.stop = function(frame) {
    this._time = null;
    if (arguments.length) {
        this.gotoFrame(frame);
    }
    return this;
};

Cut.string = function(selector) {
    return new Cut.String().setFont(selector);
};

Cut.String = function() {
    Cut.String.prototype._super.apply(this, arguments);
    this.row();
};

Cut.String.prototype = Cut._create(Cut.prototype);

Cut.String.prototype._super = Cut;

Cut.String.prototype.constructor = Cut.String;

Cut.String.prototype.setFont = function(selector) {
    this._font = selector;
    return this;
};

Cut.String.prototype.setValue = function(value) {
    if (this.value === value) return this;
    this.value = value;
    if (typeof value !== "string" && !Cut._isArray(value)) {
        value = value + "";
    }
    var child = this._first;
    for (var i = 0; i < value.length; i++) {
        var selector = this._font + value[i];
        if (child) {
            child.setImage(selector).show();
        } else {
            child = Cut.image(selector).appendTo(this);
        }
        child = child._next;
    }
    while (child) {
        child.hide();
        child = child._next;
    }
    return this;
};

Cut.row = function(align) {
    return Cut.create().row(align);
};

Cut.prototype.row = function(align) {
    this.box("row").pinChildren({
        alignY: align
    });
    return this;
};

Cut.column = function(align) {
    return Cut.create().column(align);
};

Cut.prototype.column = function(align) {
    this.box("column").pinChildren({
        alignX: align
    });
    return this;
};

Cut.box = function(type) {
    return new Cut.create().box();
};

Cut.prototype.box = function(type) {
    if (this._boxTicker) return this;
    this._padding = 0;
    this.padding = function(pad) {
        this._padding = pad;
        return this;
    };
    this._spacing = 0;
    this.spacing = function(space) {
        this._spacing = space;
        return this;
    };
    this._boxTicker = function() {
        if (this._mo_box == this._ts_touch) {
            return;
        }
        this._mo_box = this._ts_touch;
        var width = 0, height = 0;
        var child, next = this.first(true);
        var first = true;
        while (child = next) {
            next = child.next(true);
            child.pin().relativeMatrix();
            if (type == "column") {
                !first && (height += this._spacing || 0);
                child.pin("offsetY") != height && child.pin("offsetY", height);
                width = Math.max(width, child._pin._boundWidth);
                height = height + child._pin._boundHeight;
            } else if (type == "row") {
                !first && (width += this._spacing || 0);
                child.pin("offsetX") != width && child.pin("offsetX", width);
                width = width + child._pin._boundWidth;
                height = Math.max(height, child._pin._boundHeight);
            } else {
                width = Math.max(width, child._pin._boundWidth);
                height = Math.max(height, child._pin._boundHeight);
            }
            first = false;
        }
        width += this._padding * 2;
        height += this._padding * 2;
        this.pin("width") != width && this.pin("width", width);
        this.pin("height") != height && this.pin("height", height);
    };
    this.tick(this._boxTicker);
    return this;
};

Cut.Image.prototype.tile = function(inner) {
    if (this._tileTicker) {
        return this;
    }
    var base = null;
    var self = this;
    function slice(c) {
        return self._outs[c] || (self._outs[c] = base.clone());
    }
    this._tileTicker = function() {
        if (this._mo_tile == this._ts_touch) {
            return;
        }
        this._mo_tile = this._ts_touch;
        base = base || this._outs[0].clone();
        var bleft = base._left, bright = base._right;
        var btop = base._top, bbottom = base._bottom;
        var bwidth = base.dWidth() - bleft - bright;
        var bheight = base.dHeight() - btop - bbottom;
        var width = this.pin("width");
        width = inner ? width : width - bleft - bright;
        var height = this.pin("height");
        height = inner ? height : height - btop - bbottom;
        var left = inner ? -bleft : 0;
        var top = inner ? -btop : 0;
        var c = 0;
        if (btop && bleft) {
            slice(c++).cropX(bleft, 0).cropY(btop, 0).offset(left, top);
        }
        if (bbottom && bleft) {
            slice(c++).cropX(bleft, 0).cropY(bbottom, bheight + btop).offset(left, top + height + btop);
        }
        if (btop && bright) {
            slice(c++).cropX(bright, bwidth + bleft).cropY(btop, 0).offset(left + width + bleft, top);
        }
        if (bbottom && bright) {
            slice(c++).cropX(bright, bwidth + bleft).cropY(bbottom, bheight + btop).offset(left + width + bleft, top + height + btop);
        }
        var x = left + bleft;
        var r = width;
        while (r > 0) {
            var w = Math.min(bwidth, r);
            r -= bwidth;
            var y = top + btop;
            var b = height;
            while (b > 0) {
                var h = Math.min(bheight, b);
                b -= bheight;
                slice(c++).cropX(w, bleft).cropY(h, btop).offset(x, y);
                if (r <= 0) {
                    if (bleft) {
                        slice(c++).cropX(bleft, 0).cropY(h, btop).offset(left, y);
                    }
                    if (bright) {
                        slice(c++).cropX(bright, bwidth + bleft).cropY(h, btop).offset(x + w, y);
                    }
                }
                y += h;
            }
            if (btop) {
                slice(c++).cropX(w, bleft).cropY(btop, 0).offset(x, top);
            }
            if (bbottom) {
                slice(c++).cropX(w, bleft).cropY(bbottom, bheight + btop).offset(x, y);
            }
            x += w;
        }
        this._outs.length = c;
    };
    this.tick(this._tileTicker);
    return this;
};

Cut.Image.prototype.stretch = function(inner) {
    if (this._stretchTicker) {
        return this;
    }
    var base = null;
    var self = this;
    function slice(c) {
        return self._outs[c] || (self._outs[c] = base.clone());
    }
    this._stretchTicker = function() {
        if (this._mo_stretch == this._pin._ts_transform) {
            return;
        }
        this._mo_stretch = this._pin._ts_transform;
        base = base || this._outs[0].clone();
        var oleft = base._left, oright = base._right;
        var otop = base._top, obottom = base._bottom;
        var owidth = base.dWidth(), oheight = base.dHeight();
        var width = this.pin("width"), height = this.pin("height");
        width = inner ? width + oleft + oright : Math.max(width, oleft + oright);
        height = inner ? height + otop + obottom : Math.max(height, otop + obottom);
        var c = 0;
        if (otop && oleft) {
            slice(c++).cropX(oleft, 0).cropY(otop, 0).offset(0, 0);
        }
        if (obottom && oleft) {
            slice(c++).cropX(oleft, 0).cropY(obottom, oheight - obottom).offset(0, height - obottom);
        }
        if (otop && oright) {
            slice(c++).cropX(oright, owidth - oright).cropY(otop, 0).offset(width - oright, 0);
        }
        if (obottom && oright) {
            slice(c++).cropX(oright, owidth - oright).cropY(obottom, oheight - obottom).offset(width - oright, height - obottom);
        }
        if (otop) {
            slice(c++).cropX(owidth - oleft - oright, oleft).cropY(otop, 0).offset(oleft, 0).dWidth(width - oleft - oright);
        }
        if (obottom) {
            slice(c++).cropX(owidth - oleft - oright, oleft).cropY(obottom, oheight - obottom).offset(oleft, height - obottom).dWidth(width - oleft - oright);
        }
        if (oleft) {
            slice(c++).cropX(oleft, 0).cropY(oheight - otop - obottom, otop).offset(0, otop).dHeight(height - otop - obottom);
        }
        if (oright) {
            slice(c++).cropX(oright, owidth - oright).cropY(oheight - otop - obottom, otop).offset(width - oright, otop).dHeight(height - otop - obottom);
        }
        slice(c++).cropX(owidth - oleft - oright, oleft).cropY(oheight - otop - obottom, otop).offset(oleft, otop).dWidth(width - oleft - oright).dHeight(height - otop - obottom);
        this._outs.length = c;
    };
    this.tick(this._stretchTicker);
    return this;
};

Cut._images = {};

Cut.loadImages = function(loader, callback) {
    var loading = 0;
    var noimage = true;
    var textures = Cut._textures;
    for (var texture in textures) {
        if (textures[texture].getImagePath()) {
            loading++;
            var src = textures[texture].getImagePath();
            var image = loader(src, complete, error);
            Cut.addImage(image, src);
            noimage = false;
        }
    }
    if (noimage) {
        DEBUG && console.log("No image to load.");
        callback && callback();
    }
    function complete() {
        DEBUG && console.log("Loading image completed.");
        done();
    }
    function error(msg) {
        DEBUG && console.log("Error loading image: " + msg);
        done();
    }
    function done() {
        if (--loading <= 0) {
            callback && callback();
        }
    }
};

Cut.getImage = function(src) {
    return Cut._images[src];
};

Cut.addImage = function(image, src) {
    Cut._images[src] = image;
    return this;
};

Cut._textures = {};

Cut.addTexture = function() {
    for (var i = 0; i < arguments.length; i++) {
        var data = arguments[i];
        Cut._textures[data.name] = new Cut.Texture(data);
    }
    return this;
};

Cut.Texture = function(texture) {
    texture.cutouts = texture.cutouts || [];
    var selectionCache = {};
    var imageCache = null;
    this.getImagePath = function() {
        return texture.imagePath;
    };
    function image() {
        imageCache || (imageCache = Cut.getImage(texture.imagePath));
        return imageCache;
    }
    for (var i = 0; i < texture.cutouts.length; i++) {
        map(texture.cutouts[i]);
    }
    function map(cutout) {
        if (!cutout) {
            return cutout;
        }
        if (cutout.isCutout) {
            return cutout;
        }
        if (typeof texture.map === "function") {
            cutout = texture.map(cutout);
        } else if (typeof texture.filter === "function") {
            cutout = texture.filter(cutout);
        }
        var ratio = texture.ratio || 1;
        if (ratio != 1) {
            cutout.x *= ratio, cutout.y *= ratio;
            cutout.width *= ratio, cutout.height *= ratio;
            cutout.top *= ratio, cutout.bottom *= ratio;
            cutout.left *= ratio, cutout.right *= ratio;
        }
        var trim = texture.trim || 0;
        if (trim) {
            cutout.x += trim, cutout.y += trim;
            cutout.width -= 2 * trim, cutout.height -= 2 * trim;
            cutout.top -= trim, cutout.bottom -= trim;
            cutout.left -= trim, cutout.right -= trim;
        }
        return cutout;
    }
    function wrap(cutout) {
        if (!cutout.isCutout) {
            cutout = new Cut.Out(cutout, image, texture.imageRatio);
        }
        return cutout;
    }
    this.select = function(selector, prefix) {
        if (!prefix) {
            var id = selector + "?";
            var result = selectionCache[id];
            if (typeof result === "undefined") {
                for (var i = 0; i < texture.cutouts.length; i++) {
                    var item = texture.cutouts[i];
                    if (item.name == selector) {
                        result = item;
                        break;
                    }
                }
                selectionCache[id] = result;
            }
            if (!result && texture.factory) {
                result = map(texture.factory(selector));
            }
            if (!result) {
                throw "Cutout not found: '" + texture.name + ":" + selector + "'";
            }
            return wrap(result);
        } else {
            var id = selector + "*";
            var results = selectionCache[id];
            if (typeof results === "undefined") {
                results = [];
                var length = selector.length;
                for (var i = 0; i < texture.cutouts.length; i++) {
                    var item = texture.cutouts[i];
                    if (item.name && item.name.substring(0, length) == selector) {
                        results.push(texture.cutouts[i]);
                    }
                }
                selectionCache[id] = results;
            }
            if (!results.length) {
                throw "Cutouts not found: '" + texture.name + ":" + selector + "'";
            }
            for (var i = 0; i < results.length; i++) {
                results[i] = wrap(results[i]);
            }
            return results;
        }
    };
};

Cut.Out = function(data, image, ratio) {
    this.isCutout = true;
    this._data = data;
    this.name = data.name;
    this._image = image;
    this._ratio = ratio || 1;
    this._sx = data.x * this._ratio;
    this._sy = data.y * this._ratio;
    this._sw = data.width * this._ratio;
    this._sh = data.height * this._ratio;
    this._dx = 0;
    this._dy = 0;
    this._dw = data.width;
    this._dh = data.height;
    this._top = data.top || 0;
    this._bottom = data.bottom || 0;
    this._left = data.left || 0;
    this._right = data.right || 0;
};

Cut.Out.prototype.clone = function() {
    return new Cut.Out(this._data, this._image, this._ratio);
};

Cut.Out.prototype.dWidth = function(width) {
    if (arguments.length) {
        this._dw = width;
        return this;
    }
    return this._dw;
};

Cut.Out.prototype.dHeight = function(height) {
    if (arguments.length) {
        this._dh = height;
        return this;
    }
    return this._dh;
};

Cut.Out.prototype.cropX = function(w, x) {
    x = x || 0;
    w = Math.min(w, this._data.width - x);
    this._dw = w;
    this._sw = w * this._ratio;
    this._sx = (this._data.x + x) * this._ratio;
    return this;
};

Cut.Out.prototype.cropY = function(h, y) {
    y = y || 0;
    h = Math.min(h, this._data.height - y);
    this._dh = h;
    this._sh = h * this._ratio;
    this._sy = (this._data.y + y) * this._ratio;
    return this;
};

Cut.Out.prototype.offset = function(x, y) {
    this._dx = x;
    this._dy = y;
    return this;
};

Cut.Out.prototype.paste = function(context) {
    Cut._stats.paste++;
    var img = this._image();
    try {
        img && context.drawImage(img, this._sx, this._sy, this._sw, this._sh, this._dx, this._dy, this._dw, this._dh);
    } catch (e) {
        if (!this.failed) {
            console.log("Unable to paste: ", this._sx, this._sy, this._sw, this._sh, this._dx, this._dy, this._dw, this._dh, img);
        }
        this.failed = true;
    }
};

Cut.Out.prototype.toString = function() {
    return "[" + this.name + ": " + this._dw + "x" + this._dh + "]";
};

Cut.Out.select = function(selector, prefix) {
    if (typeof selector !== "string") {
        return selector;
    }
    var i = selector.indexOf(":");
    if (i < 0) {
        throw "Invalid selector: '" + selector + "'";
        return null;
    }
    var split = [ selector.slice(0, i), selector.slice(i + 1) ];
    var texture = Cut._textures[split[0]];
    if (texture == null) {
        throw "Texture not found: '" + selector + "'";
        return !prefix ? null : [];
    }
    return texture.select(split[1], prefix);
};

Cut.drawing = function() {
    return Cut.image(Cut.Out.drawing.apply(Cut.Out, arguments));
};

Cut.Out.drawing = function(name, w, h, ratio, draw, data) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    if (typeof draw === "function") {} else if (typeof ratio === "function") {
        if (typeof name === "string") {
            data = draw, draw = ratio, ratio = 1;
        } else {
            data = draw, draw = ratio, ratio = h, h = w, w = name, name = Math.random() * 1e3 | 0;
        }
    } else if (typeof h === "function") {
        data = ratio, draw = h, ratio = 1, h = w, w = name, name = Math.random() * 1e3 | 0;
    }
    canvas.width = Math.ceil(w * ratio);
    canvas.height = Math.ceil(h * ratio);
    data || (data = {});
    data.name || (data.name = name);
    data.x || (data.x = 0);
    data.y || (data.y = 0);
    data.width || (data.width = w);
    data.height || (data.height = h);
    data = new Cut.Out(data, function() {
        return canvas;
    }, ratio);
    draw.call(data, context, ratio);
    return data;
};

Cut.Pin = function(owner) {
    this._owner = owner;
    this._parent = null;
    this._relativeMatrix = new Cut.Matrix();
    this._absoluteMatrix = new Cut.Matrix();
    this._boundMatrix = new Cut.Matrix();
    this.reset();
};

Cut.Pin._EMPTY = {};

Cut.Pin.prototype.reset = function() {
    this._textureAlpha = 1;
    this._alpha = 1;
    this._width = 0;
    this._height = 0;
    this._scaleX = 1;
    this._scaleY = 1;
    this._skewX = 0;
    this._skewX = 0;
    this._rotation = 0;
    this._pivoted = false;
    this._pivotX = null;
    this._pivotY = null;
    this._handled = false;
    this._handleX = 0;
    this._handleY = 0;
    this._aligned = false;
    this._alignX = 0;
    this._alignY = 0;
    this._offsetX = 0;
    this._offsetY = 0;
    this._boundX = 0;
    this._boundY = 0;
    this._boundWidth = this._width;
    this._boundHeight = this._height;
    this._ts_translate = Cut._TS++;
    this._ts_transform = Cut._TS++;
    this._ts_matrix = Cut._TS++;
};

Cut.Pin.prototype.tick = function() {
    this._parent = this._owner._parent && this._owner._parent._pin;
    if (this._handled && this._mo_handle != this._ts_transform) {
        this._mo_handle = this._ts_transform;
        this._ts_translate = Cut._TS++;
    }
    if (this._aligned && this._parent && this._mo_align != this._parent._ts_transform) {
        this._mo_align = this._parent._ts_transform;
        this._ts_translate = Cut._TS++;
    }
    return this;
};

Cut.Pin.prototype.toString = function() {
    return this._owner.id() + " [" + this._alignX + ", " + this._alignY + "] [" + this._handleX + ", " + this._handleY + "] [" + (this._parent ? this._parent._owner.id() : null) + "]";
};

Cut.Pin.prototype.absoluteMatrix = function() {
    var ts = Math.max(this._ts_transform, this._ts_translate, this._parent ? this._parent._ts_matrix : 0);
    if (this._mo_abs == ts) {
        return this._absoluteMatrix;
    }
    this._mo_abs = ts;
    var abs = this._absoluteMatrix;
    abs.copyFrom(this.relativeMatrix());
    this._parent && abs.concat(this._parent._absoluteMatrix);
    this._ts_matrix = Cut._TS++;
    return abs;
};

Cut.Pin.prototype.relativeMatrix = function() {
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
    rel.rotate(this._rotation);
    rel.skew(this._skewX, this._skewX);
    if (this._pivoted) {
        rel.translate(this._pivotX * this._width, this._pivotY * this._height);
    }
    this.boundMatrix();
    this._x = this._offsetX - this._boundX;
    this._y = this._offsetY - this._boundY;
    if (this._handled) {
        this._x -= this._handleX * this._boundWidth;
        this._y -= this._handleY * this._boundHeight;
    }
    if (this._aligned && this._parent) {
        this._parent.relativeMatrix();
        this._x += this._alignX * this._parent._width;
        this._y += this._alignY * this._parent._height;
    }
    rel.translate(this._x, this._y);
    return this._relativeMatrix;
};

Cut.Pin.prototype.boundMatrix = function() {
    if (this._mo_bound == this._ts_transform) {
        return;
    }
    this._mo_bound = this._ts_transform;
    if (this._pivoted) {
        this._boundX = 0;
        this._boundY = 0;
        this._boundWidth = this._width;
        this._boundHeight = this._height;
        return;
    }
    var m = this._boundMatrix;
    m.identity();
    m.scale(this._scaleX, this._scaleY);
    m.rotate(this._rotation);
    m.skew(this._skewX, this._skewX);
    var p, q;
    if (m.a > 0 && m.c > 0 || m.a < 0 && m.c < 0) {
        p = 0, q = m.a * this._width + m.c * this._height;
    } else {
        p = m.a * this._width, q = m.c * this._height;
    }
    this._boundX = Math.min(p, q);
    this._boundWidth = Math.abs(p - q);
    if (m.b > 0 && m.d > 0 || m.b < 0 && m.d < 0) {
        p = 0, q = m.b * this._width + m.d * this._height;
    } else {
        p = m.b * this._width, q = m.d * this._height;
    }
    this._boundY = Math.min(p, q);
    this._boundHeight = Math.abs(p - q);
};

Cut.Pin.prototype.update = function() {
    if (arguments.length == 1 && typeof arguments[0] === "string") {
        return this["_" + arguments[0]];
    }
    this._transform_flag = false;
    this._translate_flag = false;
    if (arguments.length == 1 && typeof arguments[0] === "object") {
        var set = arguments[0], key, value;
        for (key in set) {
            if (!Cut.Pin._setters[key] && !Cut.Pin._setters2[key]) {
                DEBUG && console.log("Invalid pin: " + key + "/" + set[key]);
            }
        }
        ctx = Cut.Pin._setters;
        for (key in set) {
            value = set[key];
            if (setter = ctx[key]) {
                (value || value === 0) && setter.call(ctx, this, value, set);
            }
        }
        ctx = Cut.Pin._setters2;
        for (key in set) {
            value = set[key];
            if (setter = ctx[key]) {
                (value || value === 0) && setter.call(ctx, this, value, set);
            }
        }
    } else if (arguments.length == 2 && typeof arguments[0] === "string") {
        var key = arguments[0], value = arguments[1];
        if ((ctx = Cut.Pin._setters) && (setter = ctx[key])) {
            (value || value === 0) && setter.call(ctx, this, value, Cut.Pin._EMPTY);
        } else if ((ctx = Cut.Pin._setters2) && (setter = ctx[key])) {
            (value || value === 0) && setter.call(ctx, this, value, Cut.Pin._EMPTY);
        } else {
            DEBUG && console.log("Invalid pin: " + key + "/" + value);
        }
    }
    if (this._translate_flag) {
        this._translate_flag = false;
        this._ts_translate = Cut._TS++;
    }
    if (this._transform_flag) {
        this._transform_flag = false;
        this._ts_transform = Cut._TS++;
    }
    if (this._owner) {
        this._owner._ts_pin = Cut._TS++;
        this._owner.touch();
    }
    return this;
};

Cut.Pin._setters = {
    alpha: function(pin, value, set) {
        pin._alpha = value;
    },
    textureAlpha: function(pin, value, set) {
        pin._textureAlpha = value;
    },
    width: function(pin, value, set) {
        pin._width_ = value;
        pin._width = value;
        pin._transform_flag = true;
    },
    height: function(pin, value, set) {
        pin._height_ = value;
        pin._height = value;
        pin._transform_flag = true;
    },
    scale: function(pin, value, set) {
        pin._scaleX = value;
        pin._scaleY = value;
        pin._transform_flag = true;
    },
    scaleX: function(pin, value, set) {
        pin._scaleX = value;
        pin._transform_flag = true;
    },
    scaleY: function(pin, value, set) {
        pin._scaleY = value;
        pin._transform_flag = true;
    },
    skew: function(pin, value, set) {
        pin._skewX = value;
        pin._skewY = value;
        pin._transform_flag = true;
    },
    skewX: function(pin, value, set) {
        pin._skewX = value;
        pin._transform_flag = true;
    },
    skewY: function(pin, value, set) {
        pin._skewY = value;
        pin._transform_flag = true;
    },
    rotation: function(pin, value, set) {
        pin._rotation = value;
        pin._transform_flag = true;
    },
    pivot: function(pin, value, set) {
        pin._pivotX = value;
        pin._pivotY = value;
        pin._pivoted = true;
        pin._transform_flag = true;
    },
    pivotX: function(pin, value, set) {
        pin._pivotX = value;
        pin._pivoted = true;
        pin._transform_flag = true;
    },
    pivotY: function(pin, value, set) {
        pin._pivotY = value;
        pin._pivoted = true;
        pin._transform_flag = true;
    },
    offset: function(pin, value, set) {
        pin._offsetX = value;
        pin._offsetY = value;
        pin._translate_flag = true;
    },
    offsetX: function(pin, value, set) {
        pin._offsetX = value;
        pin._translate_flag = true;
    },
    offsetY: function(pin, value, set) {
        pin._offsetY = value;
        pin._translate_flag = true;
    },
    align: function(pin, value, set) {
        this.alignX.apply(this, arguments);
        this.alignY.apply(this, arguments);
    },
    alignX: function(pin, value, set) {
        pin._alignX = value;
        pin._aligned = true;
        pin._translate_flag = true;
        this.handleX(pin, value, set);
    },
    alignY: function(pin, value, set) {
        pin._alignY = value;
        pin._aligned = true;
        pin._translate_flag = true;
        this.handleY(pin, value, set);
    },
    handle: function(pin, value, set) {
        this.handleX(pin, value, set);
        this.handleY(pin, value, set);
    },
    handleX: function(pin, value, set) {
        pin._handleX = value;
        pin._handled = true;
        pin._translate_flag = true;
    },
    handleY: function(pin, value, set) {
        pin._handleY = value;
        pin._handled = true;
        pin._translate_flag = true;
    }
};

Cut.Pin._setters2 = {
    resizeMode: function(pin, value, set) {
        if (Cut._isNum(set.resizeWidth) && Cut._isNum(set.resizeHeight)) {
            this.resizeWidth(pin, set.resizeWidth, set, true);
            this.resizeHeight(pin, set.resizeHeight, set, true);
            if (value == "out") {
                pin._scaleX = pin._scaleY = Math.max(pin._scaleX, pin._scaleY);
            } else if (value == "in") {
                pin._scaleX = pin._scaleY = Math.min(pin._scaleX, pin._scaleY);
            }
            pin._width = set.resizeWidth / pin._scaleX;
            pin._height = set.resizeHeight / pin._scaleY;
        }
    },
    resizeWidth: function(pin, value, set, force) {
        if (set.resizeMode && !force) {
            return;
        }
        pin._scaleX = value / pin._width_;
        pin._width = pin._width_;
        pin._transform_flag = true;
    },
    resizeHeight: function(pin, value, set, force) {
        if (set.resizeMode && !force) {
            return;
        }
        pin._scaleY = value / pin._height_;
        pin._height = pin._height_;
        pin._transform_flag = true;
    },
    scaleMode: function(pin, value, set) {
        if (Cut._isNum(set.scaleWidth) && Cut._isNum(set.scaleHeight)) {
            this.scaleWidth(pin, set.scaleWidth, set, true);
            this.scaleHeight(pin, set.scaleHeight, set, true);
            if (value == "out") {
                pin._scaleX = pin._scaleY = Math.max(pin._scaleX, pin._scaleY);
            } else if (value == "in") {
                pin._scaleX = pin._scaleY = Math.min(pin._scaleX, pin._scaleY);
            }
        }
    },
    scaleWidth: function(pin, value, set, force) {
        if (set.scaleMode && !force) {
            return;
        }
        pin._scaleX = value / pin._width_;
        pin._transform_flag = true;
    },
    scaleHeight: function(pin, value, set, force) {
        if (set.scaleMode && !force) {
            return;
        }
        pin._scaleY = value / pin._height_;
        pin._transform_flag = true;
    }
};

Cut.Matrix = function(a, b, c, d, tx, ty) {
    this.changed = true;
    this.a = a || 1;
    this.b = b || 0;
    this.c = c || 0;
    this.d = d || 1;
    this.tx = tx || 0;
    this.ty = ty || 0;
};

Cut.Matrix.prototype.toString = function() {
    return "[" + this.a + ", " + this.b + ", " + this.c + ", " + this.d + ", " + this.tx + ", " + this.ty + "]";
};

Cut.Matrix.prototype.clone = function() {
    return new Cut.Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

Cut.Matrix.prototype.copyTo = function(m) {
    m.copyFrom(this);
    return this;
};

Cut.Matrix.prototype.copyFrom = function(m) {
    this.changed = true;
    this.a = m.a;
    this.b = m.b;
    this.c = m.c;
    this.d = m.d;
    this.tx = m.tx;
    this.ty = m.ty;
    return this;
};

Cut.Matrix.prototype.identity = function() {
    this.changed = true;
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
    return this;
};

Cut.Matrix.prototype.rotate = function(angle) {
    if (!angle) {
        return this;
    }
    this.changed = true;
    var u = angle ? Math.cos(angle) : 1;
    var v = angle ? Math.sin(angle) : 0;
    var a = u * this.a - v * this.b;
    var b = u * this.b + v * this.a;
    var c = u * this.c - v * this.d;
    var d = u * this.d + v * this.c;
    var tx = u * this.tx - v * this.ty;
    var ty = u * this.ty + v * this.tx;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
    return this;
};

Cut.Matrix.prototype.translate = function(x, y) {
    if (!x && !y) {
        return this;
    }
    this.changed = true;
    this.tx += x;
    this.ty += y;
    return this;
};

Cut.Matrix.prototype.scale = function(x, y) {
    if (!(x - 1) && !(y - 1)) {
        return this;
    }
    this.changed = true;
    this.a *= x;
    this.b *= y;
    this.c *= x;
    this.d *= y;
    this.tx *= x;
    this.ty *= y;
    return this;
};

Cut.Matrix.prototype.skew = function(b, c) {
    if (!b && !c) {
        return this;
    }
    this.changed = true;
    this.a += this.b * c;
    this.d += this.c * b;
    this.b += this.a * b;
    this.c += this.d * c;
    this.tx += this.ty * c;
    this.ty += this.tx * b;
    return this;
};

Cut.Matrix.prototype.concat = function(m) {
    this.changed = true;
    var a = this.a * m.a + this.b * m.c;
    var b = this.b * m.d + this.a * m.b;
    var c = this.c * m.a + this.d * m.c;
    var d = this.d * m.d + this.c * m.b;
    var tx = this.tx * m.a + m.tx + this.ty * m.c;
    var ty = this.ty * m.d + m.ty + this.tx * m.b;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
    return this;
};

Cut.Matrix.prototype.reverse = function() {
    if (this.changed) {
        this.changed = false;
        this.reversed = this.reversed || new Cut.Matrix();
        var z = this.a * this.d - this.b * this.c;
        this.reversed.a = this.d / z;
        this.reversed.b = -this.b / z;
        this.reversed.c = -this.c / z;
        this.reversed.d = this.a / z;
        this.reversed.tx = (this.c * this.ty - this.tx * this.d) / z;
        this.reversed.ty = (this.tx * this.b - this.a * this.ty) / z;
    }
    return this.reversed;
};

Cut.Matrix.prototype.map = function(p, q) {
    q = q || {};
    q.x = this.a * p.x + this.c * p.y + this.tx;
    q.y = this.b * p.x + this.d * p.y + this.ty;
    return q;
};

Cut.Matrix.prototype.mapX = function(x, y) {
    return this.a * x + this.c * y + this.tx;
};

Cut.Matrix.prototype.mapY = function(x, y) {
    return this.b * x + this.d * y + this.ty;
};

Cut.Math = {};

Cut.Math.random = function(min, max) {
    if (arguments.length == 0) {
        max = 1, min = 0;
    } else if (arguments.length == 1) {
        max = min, min = 0;
    }
    if (min == max) {
        return min;
    }
    return Math.random() * (max - min) + min;
};

Cut.Math.rotate = function(num, min, max) {
    if (arguments.length < 3) {
        max = min || 0;
        min = 0;
    }
    if (max > min) {
        num = (num - min) % (max - min);
        return num + (num < 0 ? max : min);
    } else {
        num = (num - max) % (min - max);
        return num + (num <= 0 ? min : max);
    }
};

Cut.Math.length = function(x, y) {
    return Math.sqrt(x * x + y * y);
};

Cut._TS = 0;

Cut._isCut = function(obj) {
    return obj instanceof Cut;
};

Cut._isNum = function(x) {
    return typeof x === "number";
};

Cut._isFunc = function(x) {
    return typeof x === "function";
};

Cut._isArray = "isArray" in Array ? Array.isArray : function(value) {
    return Object.prototype.toString.call(value) === "[object Array]";
};

Cut._extend = function(base, extension, attribs) {
    if (attribs) {
        for (var i = 0; i < attribs.length; i++) {
            var attr = attribs[i];
            base[attr] = extension[attr];
        }
    } else {
        for (var attr in extension) {
            base[attr] = extension[attr];
        }
    }
    return base;
};

Cut._now = function() {
    if (typeof performance !== "undefined" && performance.now) {
        return function() {
            return performance.now();
        };
    } else if (Date.now) {
        return function() {
            return Date.now();
        };
    } else {
        return function() {
            return +new Date();
        };
    }
}();

Cut._function = function(value) {
    return typeof value === "function" ? value : function() {
        return value;
    };
};

Cut._status = function(msg) {
    if (!Cut._statusbox) {
        var statusbox = Cut._statusbox = document.createElement("div");
        statusbox.style.position = "absolute";
        statusbox.style.color = "black";
        statusbox.style.background = "white";
        statusbox.style.zIndex = 999;
        statusbox.style.top = "5px";
        statusbox.style.right = "5px";
        statusbox.style.padding = "1px 5px";
        document.body.appendChild(statusbox);
    }
    Cut._statusbox.innerHTML = msg;
};

DEBUG = (typeof DEBUG === "undefined" || DEBUG) && console;

window.addEventListener("load", function() {
    DEBUG && console.log("On load.");
    Cut.Loader.start();
}, false);

Cut.Loader = {
    start: function() {
        if (this.started) {
            return;
        }
        this.started = true;
        Cut.Loader.play();
    },
    play: function() {
        this.played = true;
        for (var i = this.loaders.length - 1; i >= 0; i--) {
            this.roots.push(this.loaders[i]());
            this.loaders.splice(i, 1);
        }
    },
    pause: function() {
        for (var i = this.loaders.length - 1; i >= 0; i--) {
            this.roots[i].pause();
        }
    },
    resume: function() {
        for (var i = this.loaders.length - 1; i >= 0; i--) {
            this.roots[i].resume();
        }
    },
    loaders: [],
    roots: [],
    load: function(app, canvas) {
        function loader() {
            var context = null, full = false;
            var width = 0, height = 0, ratio = 1;
            DEBUG && console.log("Creating root...");
            var root = Cut.root(requestAnimationFrame, function() {
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, width, height);
                this.render(context);
            });
            if (typeof canvas === "string") {
                canvas = document.getElementById(canvas);
            }
            if (!canvas) {
                canvas = document.getElementById("cutjs");
            }
            if (!canvas) {
                full = true;
                DEBUG && console.log("Creating element...");
                canvas = document.createElement("canvas");
                canvas.style.position = "absolute";
                var body = document.body;
                body.insertBefore(canvas, body.firstChild);
            }
            DEBUG && console.log("Loading images...");
            Cut.loadImages(function(src, handleComplete, handleError) {
                var image = new Image();
                DEBUG && console.log("Loading image: " + src);
                image.onload = handleComplete;
                image.onerror = handleError;
                image.src = src;
                return image;
            }, init);
            function init() {
                DEBUG && console.log("Images loaded.");
                context = canvas.getContext("2d");
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
                ratio = devicePixelRatio / backingStoreRatio;
                canvas.resize = resize;
                DEBUG && console.log("Loading...");
                app(root, canvas);
                resize();
                window.addEventListener("resize", resize, false);
                DEBUG && console.log("Start playing...");
                root.start();
            }
            function resize() {
                if (full) {
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
                canvas.width = width;
                canvas.height = height;
                root.ratio = ratio;
                DEBUG && console.log("Resize: " + width + " x " + height + " / " + ratio);
                root.visit({
                    start: function(cut) {
                        var stop = true;
                        var listeners = cut.listeners("viewport");
                        if (listeners) {
                            for (var l = 0; l < listeners.length; l++) stop &= !listeners[l].call(cut, width, height);
                        }
                        return stop;
                    }
                });
            }
            return root;
        }
        if (this.played) {
            this.roots.push(loader());
        } else {
            this.loaders.push(loader);
        }
    }
};

!function() {
    var vendors = [ "ms", "moz", "webkit", "o" ];
    for (var v = 0; v < vendors.length && !window.requestAnimationFrame; v++) {
        var vendor = vendors[v];
        window.requestAnimationFrame = window[vendor + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendor + "CancelAnimationFrame"] || window[vendor + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
        var next = 0;
        window.requestAnimationFrame = function(callback) {
            var now = new Date().getTime();
            next = Math.max(next + 16, now);
            return window.setTimeout(function() {
                callback(next);
            }, next - now);
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}();

DEBUG = true || (typeof DEBUG === "undefined" || DEBUG) && console;

Cut.prototype.spy = function(spy) {
    if (!arguments.length) {
        return this._spy;
    }
    this._spy = spy ? true : false;
    return this;
};

Cut.Mouse = {
    CLICK: "click",
    START: "touchstart mousedown",
    MOVE: "touchmove mousemove",
    END: "touchend mouseup"
};

Cut.Mouse.subscribe = function(listener, elem, move) {
    elem = elem || document;
    var isTouchSupported = "ontouchstart" in window;
    var CLICK = "click";
    var START = isTouchSupported ? "touchstart" : "mousedown";
    var MOVE = isTouchSupported ? "touchmove" : "mousemove";
    var END = isTouchSupported ? "touchend" : "mouseup";
    elem.addEventListener(CLICK, mouseClick);
    elem.addEventListener(START, mouseStart);
    elem.addEventListener(END, mouseEnd);
    move && elem.addEventListener(MOVE, mouseMove);
    var visitor = null;
    var abs = {
        x: 0,
        y: 0,
        toString: function() {
            return (this.x | 0) + "x" + (this.y | 0);
        }
    };
    var rel = {
        x: 0,
        y: 0,
        toString: function() {
            return abs + " / " + (this.x | 0) + "x" + (this.y | 0);
        }
    };
    var clicked = {
        x: 0,
        y: 0,
        state: 0
    };
    function mouseStart(event) {
        update(event, elem);
        DEBUG && console.log("Mouse Start: " + event.type + " " + abs);
        !move && elem.addEventListener(MOVE, mouseMove);
        event.preventDefault();
        publish(event.type, event);
        clicked.x = abs.x;
        clicked.y = abs.y;
        clicked.state = 1;
    }
    function mouseEnd(event) {
        try {
            DEBUG && console.log("Mouse End: " + event.type + " " + abs);
            !move && elem.removeEventListener(MOVE, mouseMove);
            event.preventDefault();
            publish(event.type, event);
            if (clicked.state == 1 && clicked.x == abs.x && clicked.y == abs.y) {
                DEBUG && console.log("Mouse Click [+]");
                publish("click", event);
                clicked.state = 2;
            } else {
                clicked.state = 0;
            }
        } catch (e) {
            console && console.log(e);
        }
    }
    function mouseMove(event) {
        try {
            update(event, elem);
            event.preventDefault();
            publish(event.type, event);
        } catch (e) {
            console && console.log(e);
        }
    }
    function mouseClick(event) {
        try {
            update(event, elem);
            DEBUG && console.log("Mouse Click: " + event.type + " " + abs);
            event.preventDefault();
            if (clicked.state != 2) {
                publish(event.type, event);
            } else {
                DEBUG && console.log("Mouse Click [-]");
            }
        } catch (e) {
            console && console.log(e);
        }
    }
    function publish(type, event) {
        abs.type = type;
        abs.event = event;
        rel.x = abs.x;
        rel.y = abs.y;
        listener.visit(visitor);
    }
    visitor = {
        reverse: true,
        visible: true,
        start: function(cut) {
            if (!(cut.spy() || listener === cut)) {
                cut.matrix().reverse().map(abs, rel);
                if (rel.x < 0 || rel.x > cut._pin._width || rel.y < 0 || rel.y > cut._pin._height) {
                    return true;
                }
            }
        },
        end: function(cut) {
            var listeners = cut.listeners(abs.type);
            if (listeners) {
                cut.matrix().reverse().map(abs, rel);
                for (var l = 0; l < listeners.length; l++) if (listeners[l].call(cut, abs.event, rel)) {
                    return true;
                }
            }
        }
    };
    function update(event, elem) {
        var isTouch = false;
        if (event.touches) {
            if (event.touches.length) {
                isTouch = true;
                abs.x = event.touches[0].pageX;
                abs.y = event.touches[0].pageY;
            } else {
                return;
            }
        } else {
            abs.x = event.clientX;
            abs.y = event.clientY;
            if (document.body.scrollLeft || document.body.scrollTop) {} else if (document.documentElement) {
                abs.x += document.documentElement.scrollLeft;
                abs.y += document.documentElement.scrollTop;
            }
        }
        abs.x -= elem.clientLeft || 0;
        abs.y -= elem.clientTop || 0;
        var par = elem;
        while (par) {
            abs.x -= par.offsetLeft || 0;
            abs.y -= par.offsetTop || 0;
            if (!isTouch) {
                abs.x += par.scrollLeft || 0;
                abs.y += par.scrollTop || 0;
            }
            par = par.offsetParent;
        }
        abs.x *= listener.ratio || 1;
        abs.y *= listener.ratio || 1;
    }
};