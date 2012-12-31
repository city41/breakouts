goog.provide('breakout.scenes.GameOver');

goog.require('goog.events');

goog.require('lime.Label');

goog.require('breakout.scenes.LogoScene');

breakout.scenes.GameOver = function() {
	breakout.scenes.LogoScene.call(this);

	var s = breakout.director.getSize();

	this.addText('game over', s.width / 2, s.height / 2 + 70);

	goog.events.listen(this, ['mousedown'], this._onMouseDown, this);

	lime.scheduleManager.callAfter(function() {
		breakout.director.replaceScene(new breakout.scenes.Menu());
	}, null, 2000);
};

goog.inherits(breakout.scenes.GameOver, breakout.scenes.LogoScene);

goog.object.extend(breakout.scenes.GameOver.prototype, {
	_onMouseDown: function(e) {
		breakout.director.replaceScene(new breakout.scenes.Menu());
	}
});




