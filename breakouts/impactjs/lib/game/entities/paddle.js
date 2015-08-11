ig.module('game.entities.paddle').requires('impact.entity').defines(function() {

	EntityPaddle = ig.Entity.extend({
		size: {
			x: 48,
			y: 16
		},

		isPaddle: true,

		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.FIXED,

		animSheet: new ig.AnimationSheet('media/tiles16.png', 48, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.addAnim('idle', 1, [16]);
		},

		update: function() {
			this.pos.x = ig.input.mouse.x.limit(0, ig.system.width - this.size.x);
			this.parent();
		}
	});

});
