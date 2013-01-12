(function() {
	window.breakout = window.breakout || {};

	breakout.brick = {
		WIDTH: breakout.TILE_SIZE * 2,
		HEIGHT: breakout.TILE_SIZE
	};

	var spritesCreated = false;
	var colorOffsets = {
		blue: 0,
		orange: 1,
		red: 2,
		green: 3
	};

	function createSprites() {
		if(!spritesCreated) {
			spritesCreated = true;
			Crafty.sprite(breakout.TILE_SIZE, 'media/tiles.png', {
				blue: [0, 0, 2, 1],
				orange: [0, 1, 2, 1],
				red: [0, 2, 2, 1],
				green: [0, 3, 2, 1],
				paddle: [0, 4, 3, 1],
				paddleMini: [0, 5, 2, 1],
				countdown: [0, 6, 2, 3],
			});
		}
	}

	function onBrickDeath() {
		Crafty.audio.play('brickDeath');
		this.stop();
		this.bind('AnimationEnd', function() {
			this.destroy();
			Crafty.trigger('BrickDeath', this);
		});
		this.animate('die', 10, 0);
	}

	Crafty.c('Brick', {
		init: function() {
			createSprites();
			this.requires('SpriteAnimation, Edges');
		},
		brick: function(color) {
			var colorOffset = colorOffsets[color];
			return this.attr({
				onDeath: onBrickDeath
			})
			.animate('die', [[2,colorOffset], [4,colorOffset], [6,colorOffset], [8,colorOffset]])
			.animate('birth', [[8,colorOffset], [6,colorOffset], [4,colorOffset], [2,colorOffset], [0,colorOffset]])
			.animate('birth', 20, 0);
		}
	});

})();

