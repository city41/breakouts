goog.provide('breakout.scenes.Win');

goog.require('goog.events');

goog.require('lime.Label');

goog.require('breakout.scenes.LogoScene');

breakout.scenes.Win = function() {
	breakout.scenes.LogoScene.call(this);

	var s = breakout.director.getSize();

	this.addText('you are the master!', s.width / 2, s.height / 2 + 70);

	goog.events.listen(this, ['mousedown'], this._onMouseDown, this);

	lime.scheduleManager.callAfter(function() {
		breakout.director.replaceScene(new breakout.scenes.Menu());
	}, null, 4000);
};

goog.inherits(breakout.scenes.Win, breakout.scenes.LogoScene);

goog.object.extend(breakout.scenes.Win.prototype, {
	_onMouseDown: function(e) {
		breakout.director.replaceScene(new breakout.scenes.Menu());
	}
});



