(function() {
	var spritesCreated = false;

	function createSprites() {
		if (!spritesCreated) {
			spritesCreated = true;
			Crafty.sprite(breakout.TILE_SIZE, 'media/tiles.png', {
				ball: [3, 4, 1, 1]
			});
		}
	}

	Crafty.c('Ball', {
		_checkWallCollision: function() {
			// hit a vertical wall?
			if (this.hit('v')) {
				this.x = this.prevX;
				this.vel.x *= - 1;
				return;
			}

			// or the top horizontal wall?
			if (this.hit('h')) {
				this.y = this.prevY;
				this.vel.y *= - 1;
				return;
			}
		},

		_checkPaddleCollision: function() {
			if (this.vel.y > 0) {
				var hit = this.hit('Paddle')[0];

				if (hit) {
					this.vel.x = this._determineBounceVelocity(hit.obj); 
					this.vel.y *= - 1;
				}
			}
		},

		_determineBounceVelocity: function(paddle) {
			var distance = Crafty.math.distance(paddle.centerX, paddle.centerY, this.centerX, this.centerY);
			
			var magnitude = distance - this.h / 2 - paddle.h / 2;
			var ratio = magnitude / (paddle.w / 2) * 2.5;

			if(this.centerX < paddle.centerX) {
				ratio = -ratio;
			}

			return this.speed * ratio;
		},

		_checkBrickCollision: function() {
			var hit = this.hit('Brick')[0];

			if(!hit) {
				return;
			}

			var brick = hit.obj;
			brick.onDeath();

			var dx = brick.x - this.x;
			if(this.centerX < brick.centerX) {
				dx -= this.w;
			} else {
				dx += brick.w;
			}

			var dy = brick.y - this.y;
			if(this.centerY < brick.centerY) {
				dy -= this.h;
			} else {
				dy += brick.h;
			}

			if(Math.abs(dx) < Math.abs(dy)) {
				this.x = this.prevX;
				this.vel.x *= -1;
			} else {
				this.y = this.prevY;
				this.vel.y *= -1;
			}
		},

		_enterFrame: function() {
			if (!this.active) {
				return;
			}

			this.prevX = this.x;
			this.prevY = this.y;

			this.x += this.vel.x;
			this.y += this.vel.y;

			// did the ball get past the paddle?
			if (this.y > Crafty.stage.elem.clientHeight) {
				this.destroy();
				Crafty.trigger('BallDeath');
				return;
			}

			this._checkWallCollision();
			this._checkBrickCollision();
			this._checkPaddleCollision();

		},
		init: function() {
			createSprites();
			this.requires('SpriteAnimation, ball, Collision, Edges');
		},
		ball: function(active) {
			this.speed = 170 / 60;
			return this.attr({
				active: active,
				vel: {
					x: this.speed,
					y: this.speed
				}
			}).animate('spin', 3, 4, 7).animate('spin', 10, - 1).bind('EnterFrame', this._enterFrame);
		}
	});
})();

