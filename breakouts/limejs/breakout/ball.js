(function() {
	goog.provide('breakout.Ball');

	goog.require('goog.math');
	goog.require('lime.Sprite');
	goog.require('lime.fill.Frame');

	function _inVerticalQuadrant(src, obj) {
		var y = (src.top + src.bottom) / 2;
		var x = (src.left + src.top) / 2;
		return (y < obj.top || y > obj.bottom)
			&& x >= obj.left && x <= obj.right;
	}

	function _inHorizontalQuadrant(src, obj) {
		var y = (src.top + src.bottom) / 2;
		var x = (src.left + src.top) / 2;
		return (x < obj.left || x > obj.right)
			&& y >= obj.top && y <= obj.bottom;
	}

	breakout.Ball = function() {
		lime.Sprite.call(this);
		this.setSize(breakout.TILE_SIZE, breakout.TILE_SIZE);

		this.vel = {
			x: 140/1000,
			y: 140/1000
		};
		
		this.runAction(this._createAnimation());

		lime.scheduleManager.schedule(this.step, this);
	};

	goog.inherits(breakout.Ball, lime.Sprite);

	goog.object.extend(breakout.Ball.prototype, {
		wasRemovedFromTree: function() {
			lime.scheduleManager.unschedule(this.step, this);
		},

		_getFrames: function() {
			var frames = [];

			var w = this.getSize().width;
			var h = this.getSize().height;
			
			var offsetX = breakout.TILE_SIZE * 3;
			var offsetY = breakout.TILE_SIZE * 4;

			for(var i = 0; i < 5; ++i) {
				var frame = new lime.fill.Frame('media/tiles.png', offsetX + i * w, offsetY, w, h);
				frames.push(frame);
			}

			return frames;
		},
		_createAnimation: function() {
			var frames = this._getFrames();

			var animation = new lime.animation.KeyframeAnimation().
				setFrames(frames).
				setDelay(0.2).
				setLooping(true);

			return animation;
		},

		_hasHitVerticalWall: function(x) {
			return x <= breakout.TILE_SIZE 
				|| x + this.getSize().width >= breakout.director.getSize().width;
		},

		_hasHitHorizontalWall: function(y) {
			return y < breakout.TILE_SIZE;
		},

		_checkBrickCollision: function(pos, dx, dy) {
			var ballBox = this._getPotentialBoundingBox(dx, dy);

			var bricks = this.getParent().getBricks();

			for(var i = 0; i < bricks.length; ++i) {
				var brick = bricks[i];
				var brickBox = brick.getBoundingBox();
				if(goog.math.Box.intersects(ballBox, brickBox)) {
					brick.die();
					if(_inVerticalQuadrant(brickBox, ballBox)) {
						this.vel.y *= -1;
						pos.x += dx;
					}
					else if(_inHorizontalQuadrant(brickBox, ballBox)) {
						this.vel.x *= -1;
						pos.y += dy;
					}
					else {
						this.vel.x *= -1;
						this.vel.y *= -1;
						pos.x += dx;
						pos.y += dy;
					}
					return true;
				}
			}
		},

		_getPotentialBoundingBox: function(dx, dy) {
			var ballBox = this.getBoundingBox();

			ballBox.left += dx;
			ballBox.right += dx;
			ballBox.top += dy;
			ballBox.bottom += dy;
			return ballBox;
		},

		_checkPaddleCollision: function(pos, dx, dy) {
			if(this.vel.y > 0) {
				var paddleBox = this.paddle.getBoundingBox();
				var ballBox = this._getPotentialBoundingBox(dx, dy);

				if(goog.math.Box.intersects(paddleBox, ballBox)) {
					this.vel.y *= -1;
					pos.x += dx;
					return true;
				}
			}
		},
		
		step: function(dt) {
			if(!this.active) {
				return;
			}
			var pos = this.getPosition();

			var dx = this.vel.x * dt;
			var dy = this.vel.y * dt;

			if(this._hasHitVerticalWall(pos.x + dx)) {
				pos.y += dy;
				this.vel.x *= -1;
			}
			else if(this._hasHitHorizontalWall(pos.y + dy)) {
				pos.x += dx;
				this.vel.y *= -1;
			}
			else {
				var hitBrick = this._checkBrickCollision(pos, dx, dy);
				if(!hitBrick) {
					if(!this._checkPaddleCollision(pos, dx, dy)) {
						pos.x += dx;
						pos.y += dy;
					}
				}
			}

			this.setPosition(pos);
		}
	});
})();


