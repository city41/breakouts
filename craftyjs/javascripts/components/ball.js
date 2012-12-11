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

	function _inVerticalQuadrant(obj, x, y) {
		return (y < obj.top || y > obj.bottom)
			&& x >= obj.left && x <= obj.right;
	}

	function _inHorizontalQuadrant(obj, x, y) {
		return (x < obj.left || x > obj.right)
			&& y >= obj.top && y <= obj.bottom;
	}

	Crafty.c('Ball', {
		_checkPaddleCollision: function() {
			if(this.vel.y > 0) {
				var hit = this.hit('Paddle')[0];

				if (hit) {
					this.vel.x = (this.centerX - hit.obj.centerX) / (hit.obj.w / 2);
					this.vel.y *= -1;
				}
			}
		},
		_enterFrame: function() {
			if (!this.active) {
				return;
			}

			var prevX = this.x;
			var prevY = this.y;
			var prevCx = this.centerX;
			var prevCy = this.centerY;

			this.x += this.vel.x;
			this.y += this.vel.y;

			if(this.y > Crafty.stage.elem.clientHeight) {
				this.destroy();
				Crafty.trigger('BallDeath');
				return;
			}

			if(this.hit('v')) {
				this.x = prevX;
				this.vel.x *= -1;
				return;
			}

			if(this.hit('h')) {
				this.y = prevY;
				this.vel.y *= -1;
				return;
			}

			var hit = this.hit('Brick')[0];

			if(hit) {
				hit.obj.onDeath();
				if(_inVerticalQuadrant(hit.obj, prevCx, prevCy)) {
					this.y = prevY;
					this.vel.y *= -1;
				}
				else if(_inHorizontalQuadrant(hit.obj, prevCx, prevCy)) {
					this.x = prevX;
					this.vel.x *= -1;
				}
				else {
					// in diagonal quadrant
					this.x = prevX;
					this.y = prevY;
					this.vel.x *= -1;
					this.vel.y *= -1;
				}
			}

			if(this.y > Crafty.stage.elem.clientHeight * 2 /3) {
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

