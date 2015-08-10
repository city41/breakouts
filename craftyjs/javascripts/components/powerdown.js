(function() {
	var spritesCreated = false;

	function createSprites() {
		if(!spritesCreated) {
			spritesCreated = true;
			Crafty.sprite(breakout.TILE_SIZE, 'media/tiles.png', {
				powerdown: [7, 6]
			});
		}
	}

	Crafty.c('PowerDown', {
		_enterFrame: function() {
			this.y += this.vel.y;

			var hit = this.hit('Paddle')[0];

			if(hit) {
				hit.obj.onPowerDown();
				this.destroy();
			}

			if(this.vel.y > Crafty.stage.elem.clientHeight) {
				this.destroy();
			}
		},
		init: function() {
			createSprites();
			this.requires('powerdown, Collision');
			this.bind('EnterFrame', this._enterFrame)
				.attr({
					vel: {
						y: 80 / 60
					}
				});
		}
	});

})();


