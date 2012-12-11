goog.provide('breakout.Paddle');

goog.require('lime.Sprite');
goog.require('lime.fill.Frame');



breakout.Paddle = function() {
	lime.Sprite.call(this);

	this.setSize(breakout.TILE_SIZE * 3, breakout.TILE_SIZE);
	this.setAnchorPoint(0, 0);
	this.setPosition(breakout.director.getSize().width / 2 - this.getSize().width / 2, 432);
	
	this.setFill(new lime.fill.Frame('media/tiles.png', 0, 4 * breakout.TILE_SIZE, this.getSize().width, this.getSize().height));
};


goog.inherits(breakout.Paddle, lime.Sprite);


