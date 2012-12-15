(function() {
	var spritesCreated = false;

	function createSprites() {
		if (!spritesCreated) {
			spritesCreated = true;
			Crafty.sprite(breakout.TILE_SIZE, 'media/tiles.png', {
				paddle: [0, 4, 3, 1],
				paddleMini: [0, 5, 2, 1]
			});
		}
	}

	Crafty.c('Paddle', {
		init: function() {
			createSprites();
			return this.requires('Edges, paddle');
		},
		_powerDownLength: 10,
		_setMiniSize: function() {
			this.w = breakout.TILE_SIZE * 2;
			this.sprite(0, 5, 2, 1);
		},
		_setFullSize: function() {
			this.w = breakout.TILE_SIZE * 3;
			this.sprite(0, 4, 3, 1);
		},
		onPowerDown: function() {
			Crafty.audio.play('powerdown');
			this._setMiniSize();
			var me = this;
			if(this._miniTimeout) {
				clearTimeout(this._miniTimeout);
				delete this._miniTimeout;
			}
			this._miniTimeout = setTimeout(function() {
				me._setFullSize();
				Crafty.audio.play('recover');
			}, 1000 * this._powerDownLength);
		}
	});
})();

