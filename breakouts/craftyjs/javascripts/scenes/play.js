Crafty.scene('play', function() {
	var _level;
	var _score = 0;
	var _lives = 3;
	var _paddle;
	var _hud;

	function _reset(level) {
		_level = level;

		Crafty('Ball').destroy();
		Crafty('Countdown').destroy();

		if(_level === 0) {
			Crafty.scene('menu');
			return;
		}

		if(_level > breakout.LevelSetups.length) {
			Crafty.scene('win');
			return;
		}

		_populateLevel(level);
		_addBall(false);
		_addCountdown();
		_updateHud();
	}

	function _addCountdown() {
		Crafty('Countdown').destroy();
		Crafty.e('2D, Canvas, Countdown, Center')
			.countdown(2500, function() {
				Crafty('Ball').attr({active: true});
			});
	}

	function _addBall(active) {
		Crafty.e('2D, Canvas, Ball')
			.attr({
				x: 50,
				y: Crafty.stage.elem.clientHeight / 2
			})
			.ball(active);
	}

	function _getLocations(bricks, count) {
		var locations = [];
		for (var i = 0; i < count; ++i) {
			var x, y;
			do {
				y = (Math.random() * bricks.length) | 0;
				x = (Math.random() * bricks[y].length) | 0;
			} while (_hasLocation(x, y, locations));
			locations.push({
				x: x,
				y: y
			});
		}
		return locations;
	}

	function _hasLocation(x, y, locations) {
		for (var i = 0; i < locations.length; ++i) {
			if (locations[i].x === x && locations[i].y === y) {
				return true;
			}
		}
		return false;
	}

	function _populateLevel(level) {
		Crafty('Brick').destroy();

		var setup = breakout.LevelSetups[level-1];
		var bricks = setup.bricks;

		var cornerX = breakout.brick.WIDTH * 1.5;
		var cornerY = breakout.brick.HEIGHT * 4;

		var powerUpLocations = _getLocations(bricks, setup.powerUps);
		var powerDownLocations = _getLocations(bricks, setup.powerDowns);

		for(var y = 0; y < bricks.length; ++y) {
			for(var x = 0; x < bricks[y].length; ++x) {
				var color = bricks[y][x];

				if(color) {
					var bx = cornerX + x * breakout.brick.WIDTH;
					var by = cornerY + y * breakout.brick.HEIGHT;

					Crafty.e('2D, Canvas, Brick, ' + color)
						.attr({
							x: bx,
							y: by,
							hasPowerUp: _hasLocation(x, y, powerUpLocations),
							hasPowerDown: _hasLocation(x, y, powerDownLocations)
						})
						.brick(color);
				}
			}
		}
	}

	function _updateHud() {
		_hud.text('lives: ' + _lives + ' score: ' + _score + ' level: ' + _level);
	}

	Crafty.bind('BrickDeath', function(brick) {
		_score += 100;

		if(brick.hasPowerUp) {
			Crafty.e('2D, Canvas, PowerUp')
				.attr({
					x: brick.attr('x'),
					y: brick.attr('y')
				});
		}

		if(brick.hasPowerDown) {
			Crafty.e('2D, Canvas, PowerDown')
				.attr({
					x: brick.attr('x'),
					y: brick.attr('y')
				});
		}

		if(!Crafty('Brick').length) {
			_reset(_level + 1);
		} else {
			_updateHud();
		}
	});

	Crafty.bind('BallDeath', function() {
		if(Crafty('Ball').length === 0) {
			_lives -= 1;

			if(_lives === 0) {
				Crafty.scene('gameover');
			} else {
				_addBall(false);
				_addCountdown();
				_updateHud();
			}
		}
	});

	breakout.createBackground();

	_paddle = Crafty.e('2D, Canvas, Paddle')
		.attr({
			x: 160,
			y: 368,
			onPowerUp: function() {
				_addBall(true);
				Crafty.audio.play('powerup');
			}
		});

	_hud = Crafty.e('2D, DOM, Text')
		.attr({
			x: 20,
			y: Crafty.stage.elem.clientHeight - 24,
			w: Crafty.stage.elem.clientWidth - 40,
			h: 20
		})
		.textColor('#000000')
		.text('lives: ' + _lives + ' score: ' + _score + ' level: ' + _level)
		.textFont({size: '20px'})
		.css('text-align', 'center');

	Crafty.e('2D, DOM, Mouse, Keyboard, Text')
		.attr({
			x: 0,
			y: 0,
			w: Crafty.stage.elem.clientWidth,
			h: Crafty.stage.elem.clientHeight
		})
		.bind('MouseMove', function(e) {
			_paddle.x = e.offsetX || e.layerX;
		})
		//.textColor('#000000')
		.bind('KeyDown', function(e) {
			if(this.isDown(Crafty.keys.RIGHT_ARROW)) {
				_reset(_level+1);
			} else if(this.isDown(Crafty.keys.LEFT_ARROW)) {
				_reset(_level-1);
			}
			if(this.isDown(Crafty.keys.P)) {
				Crafty.pause();
			}
		})
		.bind('Pause', function() {
			this._element.innerHTML = 'paused';
		})
		.bind('Unpause', function() {
			this._element.innerHTML = '';
		});

	_reset(1);
});
