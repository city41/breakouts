ig.module('game.entities.brick').requires('impact.entity').defines(function() {

	EntityBrick = ig.Entity.extend({
		deathSound: new ig.Sound('media/sfx/brickDeath.*'),
		size: {
			x: 32,
			y: 16
		},

		type: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.FIXED,

		animSheet: new ig.AnimationSheet('media/tiles16.png', 32, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Add the animations
			var idleDuration = 0.8;
			var birthDuration = 0.13;
			var deathDuration = 0.06;

			this.addAnim('blue', idleDuration, [0]);
			this.addAnim('blueDeath', deathDuration, [1, 2, 3, 4], true);
			this.addAnim('blueBirth', birthDuration, [4, 3, 2, 1, 0], true);
			this.addAnim('orange', idleDuration, [6]);
			this.addAnim('orangeDeath', deathDuration, [7, 8, 9, 10], true);
			this.addAnim('orangeBirth', birthDuration, [10, 9, 8, 7, 6], true);
			this.addAnim('red', idleDuration, [12]);
			this.addAnim('redDeath', deathDuration, [13,14, 15, 16], true);
			this.addAnim('redBirth', birthDuration, [16, 15, 14, 13, 12], true);
			this.addAnim('green', idleDuration, [18]);
			this.addAnim('greenDeath', deathDuration, [19, 20, 21, 22], true);
			this.addAnim('greenBirth', birthDuration, [22, 21, 20, 19, 18], true);

			this.currentAnim = this.anims[this.color + 'Birth'];
			this.birthing = true;
		},

		update: function() {
			this.parent();
			if(this.birthing && this.currentAnim.loopCount === 1) {
				this.birthing = false;
				this.currentAnim = this.anims[this.color];
			}
		},

		collideWith: function(other) {
			this.die();
		},

		die: function() {
			if(!this.dying) {
				this.dying = true;
			
				this.deathSound.play();

				this.collides = ig.Entity.COLLIDES.NONE;
				this.currentAnim = this.anims[this.color + 'Death'];
				this.currentAnim.rewind();

				if(this.onDeath) {
					this.onDeath(this);
				}
			}
		},

		update: function() {
			this.parent();

			if(this.dying && this.currentAnim.loopCount > 0) {
				this.kill();
			}
		}
	});
});



