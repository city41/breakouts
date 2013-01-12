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
					// have x velocity be a factor of where on the paddle the ball struck
					// so player can have some control on where to send the ball next
					this.vel.x = (this.centerX - hit.obj.centerX) / (hit.obj.w / 2);
					this.vel.y *= - 1;
				}
			}
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
			return this.attr({
				active: active,
				vel: {
					x: 170 / 60,
					y: 170 / 60
				}
			}).animate('spin', 3, 4, 7).animate('spin', 10, - 1).bind('EnterFrame', this._enterFrame);
		}
	});
})();

