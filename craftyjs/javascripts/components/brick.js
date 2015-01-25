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
		this.bind('TweenEnd', function() {
			this.destroy();
			Crafty.trigger('BrickDeath', this);
		});
		this.tween({ w: 0, h: 0, x: this.x + breakout.brick.WIDTH / 2, y: this.y + breakout.brick.HEIGHT / 2 }, 600);
	}

	Crafty.c('Brick', {
		init: function() {
			createSprites();
			this.requires('Edges, Tween');
		},
		brick: function(color) {
			var finalX = this.x;
			var finalY = this.y;

			var colorOffset = colorOffsets[color];
			return this.attr({
				onDeath: onBrickDeath
			})
			// tweening the position as well as size so that the scaling appears to take place from the center
			// instead of the edge of the brick
			.attr({ w: 0, h: 0, x: finalX + breakout.brick.WIDTH / 2, y: finalY + breakout.brick.HEIGHT })
			.tween({ w: breakout.brick.WIDTH, h: breakout.brick.HEIGHT, x: finalX, y: finalY }, 600);
		}
	});

})();
