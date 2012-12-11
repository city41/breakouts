goog.provide('breakout.scenes.BackgroundScene');

goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.parser.TMX');

breakout.scenes.BackgroundScene = function() {
	lime.Scene.call(this);

	this._loadBg();
};

goog.inherits(breakout.scenes.BackgroundScene, lime.Scene);

goog.object.extend(breakout.scenes.BackgroundScene.prototype, {
	_loadBg: function() {
		var tmx = new lime.parser.TMX('media/bg.tmx');

		for(var t = 0; t < tmx.layers[0].tiles.length; ++t) {
			var tile = tmx.layers[0].tiles[t];
			var sprite = new lime.Sprite().setPosition(tile.px, tile.py);
			sprite.setAnchorPoint(0, 0);
			sprite.setFill(tile.tile.frame);
			this.appendChild(sprite);
		}
	}
});


