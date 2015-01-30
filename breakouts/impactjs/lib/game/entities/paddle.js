ig.module('game.entities.paddle').requires('impact.entity').defines(function() {

	EntityPaddle = ig.Entity.extend({
		recover: new ig.Sound('media/sfx/recover.*'),

		fullSize: {
			x: 48,
			y: 16
		},
		smallSize: {
			x: 32,
			y: 16
		},

		isPaddle: true,
		powerDownLength: 10,

		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.FIXED,

		animSheet: new ig.AnimationSheet('media/tiles16.png', 48, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.addAnim('idle', 1, [16]);
			this.addAnim('mini', 1, [20]);

			this.size = this.fullSize;
		},

		update: function() {
			this.pos.x = ig.input.mouse.x.limit(0, ig.system.width - this.size.x);
			this.parent();

			if(this.miniTimer && this.miniTimer.delta() > 0) {
				this.size = this.fullSize;
				this.currentAnim = this.anims.idle;
				this.recover.play();
				delete this.miniTimer;
			}
		},

		onPowerDown: function() {
			this.currentAnim = this.anims.mini;
			this.size = this.smallSize;
			this.miniTimer = new ig.Timer(this.powerDownLength);
		}
	});

});

