(function() {
	goog.provide('breakout.Countdown');

	goog.require('goog.events');

	goog.require('lime.Sprite');
	goog.require('lime.fill.Frame');
	goog.require('lime.animation.KeyframeAnimation');

	breakout.Countdown = function(duration) {
		lime.Sprite.call(this);
		this.duration = duration || 2;

		this.setSize(breakout.TILE_SIZE * 2, breakout.TILE_SIZE * 3);
		this.setAnchorPoint(0.5, 0.5);
		this.setPosition(breakout.director.getSize().width /2, breakout.director.getSize().height/2);

		var animation = this._createAnimation();
		this.runAction(animation);

		goog.events.listen(animation, lime.animation.Event.STOP, function() {
			if(this.onFinish) {
				this.onFinish();
			}
		}, false, this);
	};

	goog.inherits(breakout.Countdown, lime.Sprite);

	goog.object.extend(breakout.Countdown.prototype, {
		_getFrames: function() {
			var frames = [];

			var w = this.getSize().width;
			var h = this.getSize().height;
			for(var i = 0; i < 3; ++i) {
				var frame = new lime.fill.Frame('media/tiles.png', i * w, 6 * breakout.TILE_SIZE, w, h);
				frames.push(frame);
			}

			return frames;
		},

		_createAnimation: function() {
			var frames = this._getFrames();

			var animation = new lime.animation.KeyframeAnimation().
				setFrames(frames).
				setDelay(this.duration / frames.length).
				setLooping(false);

			return animation;
		}
	});

})();

