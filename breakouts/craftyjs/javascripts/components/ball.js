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

	function _isVerticalHit(src, dest) {
		var rightSideDistance = Math.abs(dest.left - src.right);
		var leftSideDistance = Math.abs(dest.right - src.left);
		var topSideDistance = Math.abs(dest.bottom - src.top);
		var bottomSideDistance = Math.abs(dest.top - src.bottom);

		return (rightSideDistance < topSideDistance && rightSideDistance < bottomSideDistance) ||
			(leftSideDistance < topSideDistance && leftSideDistance < bottomSideDistance);
	}

	function _isHorizontalHit(src, dest) {
		return ! _isVerticalHit(src, dest);
	}

	Crafty.c('Ball', {
		_checkPaddleCollision: function() {
			var hit = this.hit('Paddle');

			if (hit) {
				var paddle = hit[0].obj;
				if (_isHorizontalHit(this, paddle)) {
					this.vel.x = (this.centerX - paddle.centerX) / (paddle.w / 2);
					this.vel.y *= - 1;
				} else {
					this.vel.x *= - 1;
				}
			}
		},
		_enterFrame: function() {
			if (!this.active) {
				return;
			}

			var flipXv = false;
			var flipYv = false;

			var prevX = this.x;
			var prevY = this.y;

			this.x += this.vel.x;
			this.y += this.vel.y;

			var hits = this.hit('Brick');
			if (hits) {
				for (var i = 0; i < hits.length; ++i) {
					var hit = hits[i];
					hit.obj.onDeath();
					if (_isVerticalHit(this, hit.obj)) {
						flipXv = true;
					} else {
						flipYv = true;
					}
				}
			}

			if (this.hit('v')) {
				flipXv = true;
			}

			if (this.hit('h')) {
				flipYv = true;
			}

			if (flipXv) {
				this.vel.x *= - 1;
				this.x = prevX;
			}

			if (flipYv) {
				this.vel.y *= - 1;
				this.y = prevY;
			}

			if (this.y > Crafty.stage.elem.clientHeight) {
				this.destroy();
				Crafty.trigger('BallDeath');
			}

			if (!flipXv && ! flipYv) {
				this._checkPaddleCollision();
			}
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
			})
			.animate('spin', 3, 4, 7)
			.animate('spin', 10, -1)
			.bind('EnterFrame', this._enterFrame);
		}
	});
})();

