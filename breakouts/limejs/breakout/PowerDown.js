goog.provide('breakout.PowerDown');

goog.require('goog.math');
goog.require('lime.Sprite');
goog.require('lime.fill.Frame');
goog.require('lime.audio.Audio');

breakout.PowerDown = function() {
	lime.Sprite.call(this);
	this.setSize(breakout.TILE_SIZE, breakout.TILE_SIZE);

	this.vel = {
		x: 0,
		y: 80/1000
	};

	var fill = new lime.fill.Frame('media/tiles.png', 7 * breakout.TILE_SIZE, 6 * breakout.TILE_SIZE, breakout.TILE_SIZE, breakout.TILE_SIZE);
	this.setFill(fill);

	this.gotIt = new lime.audio.Audio('media/sfx/powerdown.mp3');

	lime.scheduleManager.schedule(this.step, this);
};

goog.inherits(breakout.PowerDown, lime.Sprite);

goog.object.extend(breakout.PowerDown.prototype, {
	wasRemovedFromTree: function() {
		lime.scheduleManager.unschedule(this.step, this);
	},

	step: function(dt) {
		var pos = this.getPosition();

		pos.x += this.vel.x * dt;
		pos.y += this.vel.y * dt;

		this.setPosition(pos);

		this._checkForPaddleCollision();

		if (this.getPosition().y > breakout.director.getSize().height) {
			this.die();
		}
	},

	die: function() {
		this.getParent().removeChild(this);
	},

	_checkForPaddleCollision: function() {
		var paddleBox = this.paddle.getBoundingBox();
		var myBox = this.getBoundingBox();

		if(goog.math.Box.intersects(paddleBox, myBox)) {
			this.gotIt.play();
			this.paddle.onPowerDown();
			this.die();
		}
	}
});


