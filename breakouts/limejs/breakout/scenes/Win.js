goog.provide('breakout.scenes.Win');

goog.require('goog.events');

goog.require('lime.Label');

goog.require('breakout.scenes.LogoScene');
goog.require('breakout.scenes.Menu');

breakout.scenes.Win = function() {
	breakout.scenes.LogoScene.call(this);

	var s = breakout.director.getSize();

	this.addText('you are the master!', s.width / 2, s.height / 2 + 60);

	goog.events.listen(this, ['mousedown'], this._onMouseDown, this);
};

goog.inherits(breakout.scenes.Win, breakout.scenes.LogoScene);

goog.object.extend(breakout.scenes.Win.prototype, {
	_onMouseDown: function(e) {
		breakout.director.replaceScene(new breakout.scenes.Menu());
	}
});



