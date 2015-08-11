ig.module('game.entities.ball').requires('impact.entity').defines(function() {

	EntityBall = ig.Entity.extend({
		size: {
			x: 16,
			y: 16
		},
		speed: 170,
		maxVel: {
			x: 200,
			y: 200
		},

		type: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.ACTIVE,
		bounciness: 1,
		minBounceVelocity: 0,
		friction: {
			x: 0,
			y: 0
		},

		animSheet: new ig.AnimationSheet('media/tiles16.png', 16, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.addAnim('idle', 0.2, [51, 52, 53, 54, 55]);

			this.vel.x = this.speed;
			this.vel.y = this.speed;
		},

		update: function() {
			if(!this.active) {
				return;
			}
			this.parent();

			if (this.pos.y > ig.system.height) {
				if(this.onDeath) {
					this.onDeath(this);
				}
			}
		},

		collideWith: function(other, axis) {
			if (axis === 'y' && other.isPaddle) {
				this.vel.x = this._determineBounceVelocity(other);
			}
		},

		_determineBounceVelocity: function(paddle) {
			var magnitude = (this.distanceTo(paddle) - this.size.y / 2 - paddle.size.y / 2);
			var ratio = magnitude / (paddle.size.x / 2) * 2.5;

			if(this.pos.x + this.size.x / 2 < paddle.pos.x + paddle.size.x / 2) {
				// send the ball to the left if hit on the left side of the paddle, and vice versa
				ratio = -ratio;
			}

			return this.speed * ratio;
		}
	});
});
