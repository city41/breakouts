ig.module('game.games.play').requires('impact.game', 'impact.font',

'game.games.level-setups', 'game.games.gameover', 'game.games.win',

'game.entities.brick', 'game.entities.ball', 'game.entities.paddle', 'game.entities.power-up', 'game.entities.power-down', 'game.entities.countdown',

'game.levels.level')

.defines(function() {

	PlayGame = ig.Game.extend({

		font: new ig.Font('media/font.png'),

		init: function() {
			ig.input.bind(ig.KEY.LEFT_ARROW, 'previous');
			ig.input.bind(ig.KEY.RIGHT_ARROW, 'next');
			ig.input.bind(ig.KEY.P, 'pause');

			this.lives = 3;
			this.score = 0;
			this.level = 0;
			this.paused = false;

			this.loadLevel(LevelLevel);

			this.paddle = this.getEntitiesByType(EntityPaddle)[0];

			this.paddle.onPowerUp = (function() {
				this._addBall(true);
			}).bind(this);

			this._reset(1);
		},

		_addBall: function(active) {
			var ball = this.spawnEntity(EntityBall, 50, 280, {
				active: active,
				onDeath: this._onBallDeath.bind(this)
			});
		},

		_reset: function(level) {
			this.level = level;

			if(level === 0) {
				ig.resetGame();
				return;
			}
			if (level > ig.LevelSetups.length) {
				ig.system.setGame(YouWinGame);
				return;
			}

			this._killAllOf(EntityCountdown);
			this._killAllOf(EntityPowerUp);
			this._killAllOf(EntityPowerDown);
			this._killAllOf(EntityBall);

			this._populateLevel(this.level);
			this._addCountdown();
			this._addBall(false);
		},

		update: function() {
			if (ig.input.pressed('pause')) {
				this.paused = !this.paused;
			}

			if (this.paused) {
				return;
			}

			this.parent();

			if (ig.input.pressed('next')) {
				this._reset(this.level + 1);
			} else if (ig.input.pressed('previous')) {
				this._reset(this.level - 1);
			}

		},

		draw: function() {
			this.parent();

			if (this.paused) {
				this.font.draw('paused', 30, 50);
			}

			var y = ig.system.height - 20;
			this.font.draw('lives: ' + this.lives, 24, y);
			this.font.draw('score: ' + this.score, 100, y);
			this.font.draw('level: ' + this.level, 220, y);
		},

		_addCountdown: function() {
			this._killAllOf(EntityCountdown);

			this.spawnEntity(EntityCountdown, 0, 0, {
				duration: 2,
				onDeath: this._activateAllBalls.bind(this)
			});
		},

		_populateLevel: function(level) {
			this._killAllOf(EntityBrick);
			var setup = ig.LevelSetups[level - 1];

			var onDeath = this._onBrickDeath.bind(this);
			this.brickCount = 0;

			var brickWidth = EntityBrick.prototype.size.x;
			var brickHeight = EntityBrick.prototype.size.y;

			var cornerX = brickWidth * 1.5;
			var cornerY = brickHeight * 4;

			var bricks = setup.bricks;
			this.brickCount = 0;

			var powerUpLocations = this._getLocations(bricks, setup.powerUps);
			var powerDownLocations = this._getLocations(bricks, setup.powerDowns);

			for (var y = 0; y < bricks.length; ++y) {
				for (var x = 0; x < bricks[y].length; ++x) {
					var color = bricks[y][x];
					if (color) {
						var brick = this.spawnEntity(EntityBrick, x * brickWidth + cornerX, y * brickHeight + cornerY, {
							color: color,
							onDeath: onDeath,
							hasPowerUp: this._hasLocation(x, y, powerUpLocations),
							hasPowerDown: this._hasLocation(x, y, powerDownLocations)
						});

						++this.brickCount;
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

		_onBrickDeath: function(brick) {
			this.score += 100;

			if (brick.hasPowerUp) {
				this.spawnEntity(EntityPowerUp, brick.pos.x, brick.pos.y);
			}
			else if(brick.hasPowerDown) {
				this.spawnEntity(EntityPowerDown, brick.pos.x, brick.pos.y);
			}

			--this.brickCount;
			if (this.brickCount === 0) {
				this._reset(this.level + 1);
			}
		},

		_killAllOf: function(entityType) {
			var entities = this.getEntitiesByType(entityType);

			for(var i = 0; i < entities.length; ++i) {
				entities[i].kill();
			}
		},

		_activateAllBalls: function() {
			var balls = this.getEntitiesByType(EntityBall);

			for(var i = 0; i < balls.length; ++i) {
				balls[i].active = true;
			}
		},

		_setForNextLife: function() {
			this._addCountdown();
			this._addBall(false);
			this._killAllOf(EntityPowerUp);
			this._killAllOf(EntityPowerDown);
		},

		_onBallDeath: function(ball) {
			ball.kill();

			// are all the balls dead?
			if (!this.getEntitiesByType(EntityBall).length) {
				--this.lives;
				if (this.lives) {
					this._setForNextLife();
				} else {
					ig.system.setGame(GameOverGame);
				}
			}
		}
	});
});

