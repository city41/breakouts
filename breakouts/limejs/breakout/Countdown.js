(function() {
	goog.provide('breakout.Countdown');

	goog.require('goog.events');

	goog.require('lime.Sprite');
	goog.require('lime.fill.Frame');
	goog.require('lime.animation.KeyframeAnimation');
goog.require('lime.audio.Audio');

	breakout.Countdown = function(duration) {
		lime.Sprite.call(this);
		this.duration = duration || 2;

		this.setSize(breakout.TILE_SIZE * 2, breakout.TILE_SIZE * 3);
		this.setAnchorPoint(0.5, 0.5);
		this.setPosition(breakout.director.getSize().width /2, breakout.director.getSize().height/2);

		this.animation = this._createAnimation();
		this.runAction(this.animation);

		goog.events.listen(this.animation, lime.animation.Event.STOP, function() {
			this.blip.play();
			if(this.onFinish) {
				this.onFinish();
			}
		}, false, this);

		this.blip = new lime.audio.Audio('media/sfx/countdownBlip.mp3');

		lime.scheduleManager.schedule(this.step, this);
	};

	goog.inherits(breakout.Countdown, lime.Sprite);

	goog.object.extend(breakout.Countdown.prototype, {
		wasRemovedFromTree: function() {
			lime.scheduleManager.unschedule(this.step, this);
		},

		step: function(dt) {
			if(this.currentFrame !== this.animation.currentFrame_) {
				this.currentFrame = this.animation.currentFrame_;

				//this.blip.baseElement.load();
				this.blip.play();
				this.blip = new lime.audio.Audio('media/sfx/countdownBlip.mp3');
			}
		},

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

