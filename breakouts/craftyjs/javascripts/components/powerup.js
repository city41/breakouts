(function() {
	var spritesCreated = false;

	function createSprites() {
		if(!spritesCreated) {
			spritesCreated = true;
			Crafty.sprite(breakout.TILE_SIZE, 'media/tiles.png', {
				powerup: [6, 6]
			});
		}
	}

	Crafty.c('PowerUp', {
		_enterFrame: function() {
			this.y += this.vel.y;

			var hit = this.hit('Paddle')[0];

			if(hit) {
				hit.obj.onPowerUp();
				this.destroy();
			}

			if(this.vel.y > Crafty.stage.elem.clientHeight) {
				this.destroy();
			}
		},
		init: function() {
			createSprites();
			this.requires('powerup, Collision');
			this.bind('EnterFrame', this._enterFrame)
				.attr({
					vel: {
						y: 80 / 60
					}
				});
		}
	});

})();

