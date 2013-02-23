/**
 * a ball entity
 */
EntityBall = me.ObjectEntity.extend({
	init: function(x, y, settings) {
		// define this here instead of tiled
		settings.image = "tiles16";
		settings.spritewidth = 16;
		settings.spriteheight = 16;
		this.parent(x, y, settings);

		// ensure the 'name' property is defined
		// since ball entities can also be added manually
		this.name = 'ball';
		
		this.addAnimation('idle', [51, 52, 53, 54, 55]);
		this.setCurrentAnimation('idle');

		this.speed = Math.round(170 / me.sys.fps);
		
		this.type = "ball";
		
		this.active = false;
			
		this.vel.set (this.speed, this.speed);  
		this.prevVel = this.vel.clone();
		this.prev = this.pos.clone();
		
		// some "optimization" to avoid traversing 
		// the whole object on each update
		this.viewportHeight = me.game.viewport.height - this.height;
	
	},

	update: function() {
		
		if (!this.active) {
			return false;
		}
		
		// update the ball animation
		this.parent();
				
		// this is workaround for 
		// the engine not implementing
		// bounciness
		this.prevVel.setV(this.vel);

		this.prev.setV(this.pos);
		
		// check for collision with the wall
		var res = this.updateMovement();
		if (res) {
			if (res.y !== 0) {
				this.pos.y = this.prev.y;
				this.vel.y = -this.prevVel.y;
				//this.vel.y *= -1;
			}
			if (res.x !== 0) {
				this.pos.x = this.prev.x;
				this.vel.x = -this.prevVel.x;
				//this.vel.x *= -1;
			}
		}
		
		// check if we miss the paddle and went out
		if (this.pos.y > this.viewportHeight) {
			// force immediate object destruction (true parameter)
			me.game.remove(this, true);
			me.state.current().onBallDeath();
		}
		
		// check for collision with paddle & bricks
		var res = me.game.collide(this);
		if (res) {
			if (res.obj.isPaddle) {
				if (res.y !== 0) {
					this.vel.x = this._determineBounceVelocity(res.obj);
					this.vel.y *= - 1;
				} else if (res.x !== 0) {
					this.vel.x *= - 1;
				}
			} else if (res.obj.type === 'brick') {
			
				var dx = res.obj.pos.x - this.pos.x;
				if (this.hWidth < res.obj.hWidth) {
					dx -= this.width;
				} else {
					dx += res.obj.width;
				}

				var dy = res.obj.pos.y - this.pos.y;
				if (this.hHeight < res.obj.hHeight) {
					dy -= this.height;
				} else {
					dy += res.obj.height;
				}

				if (Math.abs(dx) < Math.abs(dy)) {
					this.pos.x = this.prev.x;
					this.vel.x *= -1;
				} else {
					this.pos.y = this.prev.y;
					this.vel.y *= -1;
				}
			}
		}
		return true;
	},

	_determineBounceVelocity: function(paddle) {
		// check for distance to the paddle
		var distance = this.distanceTo(paddle) - this.hHeight - paddle.hHeight;
		
		var ratio = distance / paddle.collisionBox.hWidth * 2.5;
		
		if((this.pos.x + this.hWidth) < (paddle.pos.x + paddle.collisionBox.hWidth)) {
			// send the ball to the left if hit on the left side of the paddle, and vice versa
			ratio = -ratio;
		}
		return (this.speed * ratio);
	}
});

