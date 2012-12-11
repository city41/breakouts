goog.provide('breakout.scenes.Play');

goog.require('goog.events');

goog.require('lime.Sprite');
goog.require('lime.RoundedRect');
goog.require('lime.parser.TMX');

goog.require('breakout.scenes.BackgroundScene');
goog.require('breakout.Paddle');
goog.require('breakout.Brick');
goog.require('breakout.Ball');
goog.require('breakout.Countdown');
goog.require('breakout.scenes.LevelSetups');

breakout.scenes.Play = function() {
	breakout.scenes.BackgroundScene.call(this);
	this.balls = [];

	this.paddle = new breakout.Paddle();
	this.appendChild(this.paddle);

	lime.scheduleManager.schedule(this.step, this);

	goog.events.listen(this, ['mousemove'], this._onMouseMove, this);

	this._reset(1);
};

goog.inherits(breakout.scenes.Play, breakout.scenes.BackgroundScene);

goog.object.extend(breakout.scenes.Play.prototype, {
	getBricks: function() {
		var bricks = [];
		var numChildren = this.getNumberOfChildren();

		for(var i = 0; i < numChildren; ++i) {
			var child = this.getChildAt(i);
			if(child.isBrick) {
				bricks.push(child);
			}
		}
		return bricks;
	},

	step: function(dt) {
		//this._checkPaddleCollision(this.balls);
		//this._checkBrickCollision(this.balls);
		//this._checkItemCollision(this.items);
	},

	_reset: function(level) {
		this.level = level;

		this._populateLevel(this.level);

		this._addCountdown();
		this._addBall(false);
	},

	_addBall: function(active) {
		var ball = new breakout.Ball();
		ball.active = active;
		ball.setPosition(50, 280);
		ball.paddle = this.paddle;

		this.balls.push(ball);
		this.appendChild(ball);
	},

	_addCountdown: function() {
		if(this.countdown) {
			this.removeChild(this.countdown);
			delete this.countdown;
		}

		this.countdown = new breakout.Countdown(2);
		this.countdown.onFinish = (function() {
			this.removeChild(this.countdown);
			delete this.countdown;
			goog.array.forEach(this.balls, function(b) {
				b.active = true;
			});
		}).bind(this);

		this.appendChild(this.countdown);
	},

	_populateLevel: function(level) {
		var setup = breakout.scenes.LevelSetups[level-1];

		var bricks = setup.bricks;

		var cornerX = breakout.Brick.BRICK_WIDTH * 1.5;
		var cornerY = breakout.Brick.BRICK_HEIGHT * 4;


		for(var y = 0; y < bricks.length; ++y) {
			for(var x = 0; x < bricks[y].length; ++x) {
				var color = bricks[y][x];

				var brick = new breakout.Brick(color);
				var hw = brick.getSize().width / 2;
				var hh = brick.getSize().height / 2;
				brick.setPosition(cornerX + x * brick.getSize().width  + hw, cornerY + y * brick.getSize().height + hh);

				this.appendChild(brick);
			}
		}
	},

	_onMouseMove: function(e) {
		var pos = this.paddle.getPosition();
		pos.x = e.position.x;
		this.paddle.setPosition(pos);
	}
});

