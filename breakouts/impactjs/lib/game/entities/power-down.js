ig.module('game.entities.power-down').requires('impact.entity').defines(function() {

	EntityPowerDown = ig.Entity.extend({
		gotIt: new ig.Sound('media/sfx/powerdown.*'),
		size: {
			x: 16,
			y: 16
		},
		vel: {
			x: 0,
			y: 80
		},

		type: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NONE,
		checkAgainst: ig.Entity.TYPE.A,

		animSheet: new ig.AnimationSheet('media/tiles16.png', 16, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);
			this.addAnim('idle', 0.2, [79]);
		},

		check: function(other) {
			if(other.isPaddle) {
				this.gotIt.play();
				other.onPowerDown();
				this.kill();
			}
		}
	});
});



