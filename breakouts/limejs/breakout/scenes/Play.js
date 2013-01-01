goog.provide('breakout.scenes.Play');

goog.require('goog.events');
goog.require('goog.events.KeyCodes');

goog.require('lime.Sprite');
goog.require('lime.Label');
goog.require('lime.RoundedRect');
goog.require('lime.parser.TMX');

goog.require('breakout.scenes.BackgroundScene');
goog.require('breakout.Paddle');
goog.require('breakout.Brick');
goog.require('breakout.Ball');
goog.require('breakout.Countdown');
goog.require('breakout.PowerUp');
goog.require('breakout.PowerDown');
goog.require('breakout.scenes.LevelSetups');
goog.require('breakout.scenes.Win');
goog.require('breakout.scenes.GameOver');

breakout.scenes.Play = function() {
	breakout.scenes.BackgroundScene.call(this);

	this.lives = 3;
	this.score = 0;
	this.level = 0;

	this.paddle = new breakout.Paddle();
	this.paddle.onPowerUp = goog.bind(this._onPowerUp, this);

	this.appendChild(this.paddle);

	var s = breakout.director.getSize();
	this.hud = new lime.Label()
		.setAnchorPoint(0.5, 0.5)
		.setFontSize(18)
		.setPosition(s.width / 2, s.height - 20);
	this.appendChild(this.hud);
	this._updateHud();

	this._setupEvents();
	this._reset(1);

	window.p = this;
};

goog.inherits(breakout.scenes.Play, breakout.scenes.BackgroundScene);

goog.object.extend(breakout.scenes.Play.prototype, {
	_setupEvents: function() {
		goog.events.listen(this, ['mousemove', 'touchmove'], this._onMouseMove, false, this);

		goog.events.listen(document, ['keydown'], function(e) {
			if (e.keyCode === goog.events.KeyCodes.LEFT) { 
				this._reset(this.level-1);
			}
			if(e.keyCode === goog.events.KeyCodes.RIGHT) {
				this._reset(this.level+1);
			}
			if(e.keyCode === goog.events.KeyCodes.P) {
				breakout.director.setPaused(!breakout.director.isPaused_);
			}
		}, false, this);
	},

	getBricks: function() {
		return this._getAllOf(breakout.Brick);
	},

	_getAllOf: function(type) {
		var nodes = [];
		var numChildren = this.getNumberOfChildren();

		for(var i = 0; i < numChildren; ++i) {
			var child = this.getChildAt(i);
			if(child instanceof type) {
				nodes.push(child);
			}
		}
		return nodes;
	},

	_removeAllOf: function(type) {
		var nodes = this._getAllOf(type);

		goog.array.forEach(nodes, function(n) {
			this.removeChild(n);
		}, this);
	},

	_reset: function(level) {
		this.level = level;

		if(this.level === 0) {
			breakout.director.replaceScene(new breakout.scenes.Menu());
			return;
		}

		if(this.level > breakout.scenes.LevelSetups.length) {
			breakout.director.replaceScene(new breakout.scenes.Win());
			return;
		}

		this._removeAllOf(breakout.Ball);

		this._populateLevel(this.level);

		this._addCountdown();
		this._addBall(false);
		this._updateHud();
	},

	_updateHud: function() {
		this.hud.setText('lives: ' + this.lives + ' score: ' + this.score + ' level: ' + this.level);
	},

	_addBall: function(active) {
		var ball = new breakout.Ball();
		ball.active = active;
		ball.setPosition(50, 280);
		ball.paddle = this.paddle;
		ball.onDeath = goog.bind(this._onBallDeath, this);

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
			goog.array.forEach(this._getAllOf(breakout.Ball), function(b) {
				b.active = true;
			});
		}).bind(this);

		this.appendChild(this.countdown);
	},

	_populateLevel: function(level) {
		this._removeAllOf(breakout.Brick);

		var setup = breakout.scenes.LevelSetups[level-1];

		var bricks = setup.bricks;

		var cornerX = breakout.BRICK_WIDTH * 1.5;
		var cornerY = breakout.BRICK_HEIGHT * 4;

		var onBrickDeath = goog.bind(this._onBrickDeath, this);

		this.brickCount = 0;

		var powerUpLocations = this._getLocations(bricks, setup.powerUps);
		var powerDownLocations = this._getLocations(bricks, setup.powerDowns);

		for(var y = 0; y < bricks.length; ++y) {
			for(var x = 0; x < bricks[y].length; ++x) {
				var color = bricks[y][x];

				if(color) {
					++this.brickCount;

					var brick = new breakout.Brick(color);
					var hw = brick.getSize().width / 2;
					var hh = brick.getSize().height / 2;
					brick.setPosition(cornerX + x * brick.getSize().width  + hw, cornerY + y * brick.getSize().height + hh);
					brick.onDeath = onBrickDeath;
					brick.hasPowerUp =  this._hasLocation(x, y, powerUpLocations);
					brick.hasPowerDown =  this._hasLocation(x, y, powerDownLocations);

					this.appendChild(brick);
				}
			}
		}
	},

	_getLocations: function(bricks, count) {
		var locations = [];
		for (var i = 0; i < count; ++i) {
			var x, y;
			do {
				y = (Math.random() * bricks.length) | 0;
				x = (Math.random() * bricks[y].length) | 0;
			} while (this._hasLocation(x, y, locations));
			locations.push({
				x: x,
				y: y
			});
		}
		return locations;
	},

	_hasLocation: function(x, y, locations) {
		for (var i = 0; i < locations.length; ++i) {
			if (locations[i].x === x && locations[i].y === y) {
				return true;
			}
		}
		return false;
	},

	_onMouseMove: function(e) {
		var pos = this.paddle.getPosition();
		pos.x = e.position.x;
		this.paddle.setPosition(pos);
	},

	_addPower: function(Type, pos) {
		var power = new Type();
		power.setPosition(pos);
		power.paddle = this.paddle;

		this.appendChild(power);
	},

	_onPowerUp: function() {
		this._addBall(true);
	},

	_onBrickDeath: function(brick) {
		this.score += 100;
		this._updateHud();

		if(brick.hasPowerUp) {
			this._addPower(breakout.PowerUp, brick.getPosition());
		}

		if(brick.hasPowerDown) {
			this._addPower(breakout.PowerDown, brick.getPosition());
		}

		--this.brickCount;

		if(this.brickCount === 0) {
			this._reset(this.level + 1);
		}
	},

	_onBallDeath: function(ball) {
		this.removeChild(ball);

		// are all the balls dead?
		if (!this._getAllOf(breakout.Ball).length) {
			--this.lives;
			if (this.lives) {
				this._setForNextLife();
			} else {
				breakout.director.replaceScene(new breakout.scenes.GameOver());
			}
		}
	},

	_setForNextLife: function() {
		this._addCountdown();
		this._addBall(false);
		this._updateHud();
		//this._killAllOf(EntityPowerUp);
		//this._killAllOf(EntityPowerDown);
	}
});

