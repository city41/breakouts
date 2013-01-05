goog.provide('breakout.Paddle');

goog.require('lime.Sprite');
goog.require('lime.fill.Frame');
goog.require('lime.audio.Audio');

goog.require('goog.math');



breakout.Paddle = function() {
	lime.Sprite.call(this);

	this.setAnchorPoint(0, 0);
	this.setPosition(breakout.director.getSize().width / 2 - this.getSize().width / 2, 368);
	
	this.fullSize = new goog.math.Size(breakout.TILE_SIZE * 3, breakout.TILE_SIZE);
	this.miniSize = new goog.math.Size(breakout.TILE_SIZE * 2, breakout.TILE_SIZE);

	this.fullSprite = new lime.fill.Frame('media/tiles.png', 0, 4 * breakout.TILE_SIZE, 3 * breakout.TILE_SIZE, breakout.TILE_SIZE);
	this.miniSprite = new lime.fill.Frame('media/tiles.png', 0, 5 * breakout.TILE_SIZE, 2 * breakout.TILE_SIZE, breakout.TILE_SIZE);

	this.setFill(this.fullSprite);
	this.setSize(this.fullSize);

	this.recover = new lime.audio.Audio('media/sfx/recover.mp3');
};


goog.inherits(breakout.Paddle, lime.Sprite);

goog.object.extend(breakout.Paddle.prototype, {
	powerDownLength: 10,

	setMiniSize: function() {
		this.setFill(this.miniSprite);
		this.setSize(this.miniSize);
	},

	setFullSize: function() {
		this.setFill(this.fullSprite);
		this.setSize(this.fullSize);
		this.recover.play();
	},

	onPowerDown: function() {
		this.setMiniSize();
		lime.scheduleManager.callAfter(this.setFullSize, this, this.powerDownLength * 1000);
	}
});

