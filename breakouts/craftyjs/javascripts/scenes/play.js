Crafty.scene('play', function() {
	var _level;
	var _score = 0;
	var _lives = 3;
	var _paddle;
	var _hud;

	function _reset(level) {
		_level = level;
		
		if(_level >= breakout.LevelSetups.length) {
			Crafty.scene('win');
			return;
		}

		_populateLevel(level);
		Crafty('Ball').destroy();
		_addBall(false);
		_addCountdown();
		_updateHud();
	}

	function _addCountdown() {
		Crafty('Countdown').destroy();
		Crafty.e('2D, DOM, Countdown, Center')
			.countdown(100, function() {
				Crafty('Ball').attr({active: true});
			});
	}

	function _addBall(active) {
		Crafty.e('2D, DOM, Ball')
			.attr({
				x: 50,
				y: Crafty.stage.elem.clientHeight / 2
			})
			.ball(active);
	}

	function _populateLevel(level) {
		Crafty('Brick').destroy();

		var setup = breakout.LevelSetups[level-1];
		var bricks = setup.bricks;

		var cornerX = breakout.brick.WIDTH * 1.5;
		var cornerY = breakout.brick.HEIGHT * 4;

		for(var y = 0; y < bricks.length; ++y) {
			for(var x = 0; x < bricks[y].length; ++x) {
				var color = bricks[y][x];

				if(color) {
					var bx = cornerX + x * breakout.brick.WIDTH;
					var by = cornerY + y * breakout.brick.HEIGHT;

					Crafty.e('2D, DOM, Brick, ' + color)
						.attr({
							x: bx,
							y: by
						})
						.brick(color);
				}
			}
		}
	}

	function _updateHud() {
		_hud.text('lives: ' + _lives + ' score: ' + _score + ' level: ' + _level);
	}

	Crafty.bind('BrickDeath', function() {
		_score += 100;

		if(!Crafty('Brick').length) {
			_reset(_level + 1);
		} else {
			_updateHud();
		}
	});

	Crafty.bind('BallDeath', function() {
		_lives -= 1;

		if(_lives === 0) {
			Crafty.scene('gameover');
		} else {
			_addBall(false);
			_addCountdown();
			_updateHud();
		}
	});

	breakout.createBackground();

	_paddle = Crafty.e('2D, DOM, Paddle')
		.attr({
			x: 160,
			y: 432
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
		.css('text-align', 'center');

	Crafty.e('2D, DOM, Mouse, Keyboard, Text')
		.attr({
			x: 0,
			y: 0,
			w: Crafty.stage.elem.clientWidth,
			h: Crafty.stage.elem.clientHeight
		})
		.bind('MouseMove', function(e) {
			// TODO: crap, this is a native MouseEvent
			// need to make sure this is cross browser compatible
			_paddle.x = e.offsetX;
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

