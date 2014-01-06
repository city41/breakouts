/*global jQuery, friGame, G */
/*jslint white: true, browser: true */

(function ($, fg) {
	'use strict';

	var
		animationFromBlock,
		powerUpCounter = 0
	;

	function hasLocation(row, col, locations) {
		var
			i
		;

		for (i = 0; i < locations.length; i += 1) {
			if ((locations[i].row === row) && (locations[i].col === col)) {
				return true;
			}
		}

		return false;
	}

	function getLocations(bricks, count) {
		var
			locations = [],
			row,
			col
		;

		while (true) {
			row = fg.truncate(Math.random() * bricks.length);
			col = fg.truncate(Math.random() * bricks[row].length);
			if ((bricks[row][col]) && (!hasLocation(row, col, locations))) {
				locations.push({
					row: row,
					col: col
				});
				if (locations.length >= count) {
					break;
				}
			}
		}

		return locations;
	}

	animationFromBlock = {
		red: 'block3',
		blue: 'block1',
		orange: 'block2',
		green: 'block4'
	};

	G.setupBlocks = function (data) {
		var
			cornerX = fg.r.block1.width * 1.5,
			cornerY = fg.r.block1.height * 4,
			row,
			col,
			row_data,
			block,
			block_name,
			powerUpLocations = getLocations(data.bricks, data.powerUps),
			powerDownLocations = getLocations(data.bricks, data.powerDowns)
		;

		G.blocks = {};

		fg.s.playground
			.addGroup('blocks', {height: fg.s.playground.halfHeight})
			.end()
		;

		fg.s.blocks.scale(0);

		for (row = 0; row < data.bricks.length; row += 1) {
			row_data = data.bricks[row];
			for (col = 0; col < row_data.length; col += 1) {
				block = row_data[col];
				if (block) {
					block_name = [block, String(row), String(col)].join('_');

					// Add onto the stage, with the blocks sprite group as the container
					fg.s.blocks
						.addSprite(block_name, {
							animation: animationFromBlock[block],
							left: cornerX + (32 * col),
							top: cornerY + (16 * row)
						})
					;

					fg.s[block_name].userData = {
						hasPowerUp: hasLocation(row, col, powerUpLocations),
						hasPowerDown: hasLocation(row, col, powerDownLocations)
					};

					G.blocks[block_name] = fg.s[block_name];
				}
			}
		}

		fg.s.blocks.tween({scale: 1}, {
			duration: 1500,
			easing: 'easeOutElastic'
		});
	};

	G.onBlockDeath = function (block) {
		G.score += 100;
		$('#score').html(String(G.score));

		fg.r.brickDeath.play();

		delete G.blocks[block.name];
		if ($.isEmptyObject(G.blocks)) {
			G.Scene[G.nextScene]();
			return;
		}

		if (block.userData.hasPowerUp) {
			G.addPowerup(block.centerx, block.centery);
		}

		if (block.userData.hasPowerDown) {
			G.addPowerdown(block.centerx, block.centery);
		}

		block.tween({scale: 0}, {
			duration: 300,
			callback: function() {
				this.remove();
			}
		});
	};

	G.addPaddle = function () {
		fg.s.playground
			.addSprite('paddle', {
				animation: 'paddlelg',
				centerx: 0,
				centery: 376
			})
		;

		fg.s.paddle.userData = {
			small: false
		};

		fg.s.paddle.registerCallback(function () {
			this.move({centerx: fg.clamp(fg.mouseTracker.x, this.halfWidth, fg.s.playground.width - this.halfWidth)});
			if (this.userData.small && ((Date.now() - this.userData.smallTime) >= 10000)) {
				this.userData.small = false;
				this.setAnimation({animation: 'paddlelg'});
				fg.r.recover.play();
			}
		});
	};

	G.addPowerdown = function (x, y) {
		var
			name
		;

		name = ['powerDown', String(powerUpCounter)].join('_');

		powerUpCounter += 1;
		powerUpCounter %= 100000;

		fg.s.playground
			.addSprite(name, {
				animation: 'powerdown',
				centerx: x,
				centery: y
			})
		;

		fg.s[name].registerCallback(function () {
			this.move({centery: this.centery + (80 / (fg.REFRESH_RATE * 2))});

			if (this.collideRect(fg.s.paddle)) {
				fg.r.sndPowerdown.play();
				fg.s.paddle.setAnimation({animation: 'paddlesm'});
				$.extend(fg.s.paddle.userData, {
					small: true,
					smallTime: Date.now()
				});
				this.remove();
			} else if (this.top >= fg.s.playground.height) {
				this.remove();
			}
		});
	};

	G.addPowerup = function (x, y) {
		var
			name
		;

		name = ['powerUp', String(powerUpCounter)].join('_');

		powerUpCounter += 1;
		powerUpCounter %= 100000;

		fg.s.playground
			.addSprite(name, {
				animation: 'powerup',
				centerx: x,
				centery: y
			})
		;

		fg.s[name].registerCallback(function () {
			this.move({centery: this.centery + (80 / (fg.REFRESH_RATE * 2))});

			if (this.collideRect(fg.s.paddle)) {
				fg.r.sndPowerup.play();
				G.addBall(true);
				this.remove();
			} else if (this.top >= fg.s.playground.height) {
				this.remove();
			}
		});
	};

	function countdownCallback() {
		this.userData.index += 1;
		if (this.userData.index >= 3) {
			this.remove();
			$.each(G.balls, function (name, ball) {
				ball.userData.active = true;
			});
			return;
		}

		this.setAnimation({animationIndex: this.userData.index});
		fg.r.countdownBlip.play({muted: false});
	}

	G.addCountdown = function () {
		fg.s.playground
			.addSprite('countdown', {
				animation: 'count',
				callback: countdownCallback,
				centerx: fg.s.playground.halfWidth,
				centery: 200
			})
		;

		fg.r.countdownBlip.play({muted: false});

		fg.s.countdown.userData = {
			index: 0
		};
	};
}(jQuery, friGame));

