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
			this.requires('SpriteAnimation, countdown, Center');
			this._lastFrame = 0;

		},
		countdown: function(duration, callback) {
			return this.reel('countdown', duration, [[0, 6], [2, 6], [4, 6]])
				.animate('countdown', 0)
				.bind('FrameChange', function() {
					if (this._currentReel.currentFrame !== this._lastFrame) {
						Crafty.audio.play('countdownBlip', 1, 0.3);
					}
					this._lastFrame = this._currentReel.currentFrame;
				})
				.bind('AnimationEnd', function() {
					Crafty.audio.play('countdownBlip', 1, 0.3);
					this.destroy();
					callback();
				});
		}
	});
})();
