ig.module('game.entities.logo').requires('impact.entity').defines(function() {

	EntityLogo = ig.Entity.extend({
		size: {
			x: 131,
			y: 200
		},

		animSheet: new ig.AnimationSheet('media/logo.png', 131, 200),

		init: function(x, y, settings) {
			this.parent(x, y, settings);
			this.addAnim('idle', 1, [0]);
		}
	});
});


