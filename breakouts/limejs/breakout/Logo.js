goog.provide('breakout.Logo');

goog.require('lime.Sprite');
goog.require('lime.fill.Frame');


breakout.Logo = function(x, y) {
	lime.Sprite.call(this);

	this.setSize(131, 170);
	this.setAnchorPoint(0.5, 0);
	this.setPosition(x, y);
	
	this.setFill(new lime.fill.Frame('media/logo.png', 0, 0, this.getSize().width, this.getSize().height));
};


goog.inherits(breakout.Logo, lime.Sprite);



