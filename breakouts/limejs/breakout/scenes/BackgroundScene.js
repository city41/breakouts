goog.provide('breakout.scenes.BackgroundScene');

goog.require('lime.Renderer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.fill.Frame');
goog.require('lime.parser.TMX');

breakout.scenes.BackgroundScene = function() {
	lime.Scene.call(this);

	this._loadBg();
};

goog.inherits(breakout.scenes.BackgroundScene, lime.Scene);

goog.object.extend(breakout.scenes.BackgroundScene.prototype, {
	_loadBg: function() {
		// defaulting to prerendered background, but allowing tmx if people want it via query param
		if(window.location.href.indexOf('usetiles') > -1 && !breakout.IS_MOBILE) {
			this._loadViaTmx();
		} else {
			this._loadViaImage();
		}
	},

	_loadViaImage: function() {
		var width = 20 * breakout.TILE_SIZE;
		var height = 26 * breakout.TILE_SIZE;

		var fill = new lime.fill.Frame('media/bg_prerendered.png', 0, 0, width, height);

		var sprite = new lime.Sprite()
			.setFill(fill)
			.setSize(width, height)
			.setAnchorPoint(0, 0)
			.setPosition(0, 0);

		this.appendChild(sprite);
	},

	_loadViaTmx: function() {
		var tmx = new lime.parser.TMX('media/bg.tmx');

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


