(function() {
	goog.provide('breakout.Ball');

	goog.require('goog.math');
	goog.require('lime.Sprite');
	goog.require('lime.fill.Frame');

	function _getCenter(node) {
		var b = node.getBoundingBox();
		var x = (b.left + b.right) / 2;
		var y = (b.top + b.bottom) / 2;
		return new goog.math.Coordinate(x, y);
	}

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

		this.speed = 140/1000;
		this.vel = {
			x: this.speed,
			y: this.speed
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
					this.vel.x = this._determineBounceVelocity(this.paddle);
					pos.x += dx;
					return true;
				}
			}
		},

		_determineBounceVelocity: function(paddle) {
			var paddleCenter = _getCenter(paddle);
			var meCenter = _getCenter(this);

			var distance = goog.math.Coordinate.distance(paddleCenter, meCenter);
			var magnitude = (distance - this.getSize().height / 2 - paddle.getSize().height / 2);
			// using ratio allows us to account for if the paddle changes sizes with powerups
			var ratio = magnitude / (paddle.getSize().width / 2) * 2.5;
			
			if(meCenter.x < paddleCenter.x) {
				// send the ball to the left if hit on the left side of the paddle, and vice versa
				ratio = -ratio;
			}

			return this.speed * ratio;
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

			if(this.getPosition().y > breakout.director.getSize().height) {
				if(this.onDeath) {
					this.onDeath(this);
				}
			}
		}
	});
})();


