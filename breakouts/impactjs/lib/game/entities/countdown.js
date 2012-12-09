ig.module('game.entities.countdown').requires('impact.entity').defines(function() {

	EntityCountdown = ig.Entity.extend({
		blip: new ig.Sound('media/sfx/countdownBlip.*'),
		size: {
			x: 32,
			y: 48
		},

		animSheet: new ig.AnimationSheet('media/tiles16.png', 32, 48),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			var frames = [12, 13, 14];
			this.addAnim('count', this.duration / frames.length, frames, true);
			this.pos.x = ig.system.width / 2 - this.size.x / 2;
			this.pos.y = ig.system.height / 2 - this.size.y / 2;

			this.lastFrame = 0;
			this.blip.volume = 0.3;
		},

		update: function() {
			this.parent();

			if(this.currentAnim.frame != this.lastFrame) {
				this.blip.play();
			}
			this.lastFrame = this.currentAnim.frame;	

			if(this.currentAnim.loopCount > 0) {
				this.blip.play();
				this.kill();
			}
		},

		kill: function() {
			if(this.onDeath) {
				this.onDeath();
			}
			this.parent();
		}
	});
});

