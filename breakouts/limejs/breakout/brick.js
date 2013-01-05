(function() {
	// not sure why, but closure compiler is obfuscating only 'orange' O_o
	var colorYOffsets = {};
	colorYOffsets['blue'] = 0;
	colorYOffsets['orange'] = 1;
	colorYOffsets['red'] = 2;
	colorYOffsets['green'] = 3;

	goog.provide('breakout.Brick');

	goog.require('lime.Sprite');
	goog.require('lime.audio.Audio');
	goog.require('lime.fill.Frame');
	goog.require('lime.animation.ScaleTo');

	breakout.Brick = function(color) {
		lime.Sprite.call(this);
		this.setAnchorPoint(0.5, 0.5);
		this.color = color;
		this.setSize(breakout.TILE_SIZE * 2, breakout.TILE_SIZE);

		var y = colorYOffsets[this.color] * this.getSize().height;
		this.setFill(new lime.fill.Frame('media/tiles.png', 0, y, this.getSize().width, this.getSize().height));

		this.deathSound = new lime.audio.Audio('media/sfx/brickDeath.mp3');

		this.birth();
	};


	goog.inherits(breakout.Brick, lime.Sprite);

	goog.object.extend(breakout.Brick.prototype, {
		birth: function() {
			this.setScale(0);
			this.runAction(new lime.animation.ScaleTo(1).setDuration(0.5));
		},

		die: function() {
			if(this.dying) {
				return;
			}

			this.dying = true;

			this.deathSound.play();

			this.setScale(1);
			var ani = new lime.animation.ScaleTo(0).setDuration(0.3);
			goog.events.listen(ani, lime.animation.Event.STOP, function() {
				if(this.getParent()) {
					this.getParent().removeChild(this);
				}
			}, false, this);

			this.runAction(ani);

			if(this.onDeath) {
				this.onDeath(this);
			}
		}
	});
})();

