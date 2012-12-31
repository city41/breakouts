goog.provide('breakout.scenes.LogoScene');

goog.require('goog.events');

goog.require('lime.Label');

goog.require('breakout.scenes.BackgroundScene');
goog.require('breakout.Logo');

breakout.scenes.LogoScene = function() {
	breakout.scenes.BackgroundScene.call(this);

	var s = breakout.director.getSize();
	this.appendChild(new breakout.Logo(s.width / 2, 68));

	this.appendChild(
		new lime.Label()
			.setText('Breakout')
			.setFontWeight('bold')
			.setFontSize(30)
			.setSize(s.width, 40)
			.setAnchorPoint(0.5, 0.5)
			.setPosition(s.width / 2, s.height / 2 + 40)
		);
};

goog.inherits(breakout.scenes.LogoScene, breakout.scenes.BackgroundScene);

goog.object.extend(breakout.scenes.LogoScene.prototype, {
		addText: function(text, x, y) {
			var lbl = new lime.Label()
				.setText(text)
				.setFontFamily('Verdana')
				.setFontSize(16)
				.setSize(breakout.director.getSize().width - 2 * breakout.TILE_SIZE, 20)
				.setAnchorPoint(0.5, 0.5)
				.setPosition(x, y);

		this.appendChild(lbl);
	}
});
