goog.provide('breakout.scenes.BackgroundScene');

goog.require('lime.Renderer');
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
		var tmxFile = breakout.IS_MOBILE ? 'media/bg_mobile.tmx' : 'media/bg.tmx';

		var tmx = new lime.parser.TMX(tmxFile);

		for(var t = 0; t < tmx.layers[0].tiles.length; ++t) {
			var tile = tmx.layers[0].tiles[t];
			if(tile.tile.frame) {
				var sprite = new lime.Sprite().setPosition(tile.px, tile.py);
				sprite.setAnchorPoint(0, 0);
				sprite.setFill(tile.tile.frame);
				this.appendChild(sprite);
			}
		}
	}
});


