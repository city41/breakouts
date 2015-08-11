(function() {
	goog.provide('breakout.Ball');

	goog.require('goog.math');
	goog.require('lime.Sprite');
	goog.require('lime.fill.Frame');

	function _getCenterFromBoundingBox(box) {
		var x = (box.left + box.right) / 2;
		var y = (box.top + box.bottom) / 2;
		return new goog.math.Coordinate(x, y);
	}

	breakout.Ball = function() {
		lime.Sprite.call(this);
		this.setSize(breakout.TILE_SIZE, breakout.TILE_SIZE);
		this.setAnchorPoint(0, 0);

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

		_checkWallCollision: function() {
			if(this._hasHitVerticalWall()) {
				this.vel.x *= -1;
				this.setPosition(this.prev.x, this.getPosition().y);
			} else if(this._hasHitHorizontalWall()) {
				this.vel.y *= -1;
				this.setPosition(this.getPosition().x, this.prev.y);
			}
		},

		_hasHitVerticalWall: function() {
			var x = this.getPosition().x;
			return x <= breakout.TILE_SIZE 
				|| (x + this.getSize().width) >= breakout.director.getSize().width - breakout.TILE_SIZE;
		},

		_hasHitHorizontalWall: function() {
			return this.getPosition().y < breakout.TILE_SIZE;
		},

		_bounceOffBrick: function(brick) {
			var ballBox = this.getBoundingBox();
			var brickBox = brick.getBoundingBox();

			var ballSize = this.getSize();
			var brickSize = brick.getSize();

			var ballCenter = _getCenterFromBoundingBox(ballBox);
			var brickCenter = _getCenterFromBoundingBox(brickBox);

			var dx = brickBox.left - ballBox.left;
			if(ballCenter.x < brickCenter.x) {
				dx -= ballSize.width;
			} else {
				dx += brickSize.width;
			}

			var dy = brickBox.top - ballBox.top;
			if(ballCenter.y < brickCenter.y) {
				dy -= ballSize.height;
			} else {
				dy += brickSize.height;
			}

			if(Math.abs(dx) < Math.abs(dy)) {
				this.setPosition(this.prev.x, this.getPosition().y);
				this.vel.x *= -1;
			} else {
				this.setPosition(this.getPosition().x, this.prev.y);
				this.vel.y *= -1;
			}
		},

		_checkBrickCollision: function(pos, dx, dy) {
			var ballBox = this.getBoundingBox();

			var bricks = this.getParent().getBricks();

			for(var i = 0; i < bricks.length; ++i) {
				var brick = bricks[i];
				var brickBox = brick.getBoundingBox();
				if(goog.math.Box.intersects(ballBox, brickBox)) {
					this._bounceOffBrick(brick);
					brick.die();
					return;
				}
			}
		},

		_checkPaddleCollision: function() {
			if(this.vel.y > 0) {
				var paddleBox = this.paddle.getBoundingBox();
				var ballBox = this.getBoundingBox();

				if(goog.math.Box.intersects(paddleBox, ballBox)) {
					this.vel.y *= -1;
					this.vel.x = this._determineBounceVelocity(this.paddle);
					this.setPosition(this.prev.x, this.getPosition().y);
				}
			}
		},

		_determineBounceVelocity: function(paddle) {
			var paddleCenter = _getCenterFromBoundingBox(paddle.getBoundingBox());
			var meCenter = _getCenterFromBoundingBox(this.getBoundingBox());

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

			this.prev = pos;

			var x = pos.x + this.vel.x * dt;
			var y = pos.y + this.vel.y * dt;
			this.setPosition(x, y);

			if(this.getPosition().y > breakout.director.getSize().height) {
				if(this.onDeath) {
					this.onDeath(this);
				}
				return;
			}

			this._checkWallCollision();
			this._checkBrickCollision();
			this._checkPaddleCollision();
		}
	});
})();


