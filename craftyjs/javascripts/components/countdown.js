(function() {
	var spritesCreated = false;

	function createSprites() {
		if (!spritesCreated) {
			spritesCreated = true;
			Crafty.sprite(breakout.TILE_SIZE, 'media/tiles.png', {
				countdown: [0, 6, 2, 3]
			});
		}
	}

	Crafty.c('Countdown', {
		init: function() {
			createSprites();
			this.requires('SpriteAnimation, Center, countdown');
			this._lastSlideNumber = 0;

		},
		countdown: function(duration, callback) {
			return this.animate('countdown', [[0, 6], [2, 6], [4, 6]])
				.animate('countdown', duration, 0)
				.bind('Change', function() {
					if(this._frame.currentSlideNumber !== this._lastSlideNumber) {
						Crafty.audio.play('countdownBlip', 1, 0.3);
					}
					this._lastSlideNumber = this._frame.currentSlideNumber;
				})
				.bind('AnimationEnd', function() {
					this.destroy();
					callback();
				});
		}
	});
})();

