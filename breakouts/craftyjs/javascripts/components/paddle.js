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
		}
	});
})();

