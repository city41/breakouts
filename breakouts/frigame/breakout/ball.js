/*global jQuery, friGame, G */
/*jslint sloppy: true, white: true, browser: true */

(function ($, fg) {
	var
		ballCounter = 0
	;

	G.addBall = function (active) {
		var
			ball_name = ['ball', String(ballCounter)].join('_')
		;

		ballCounter += 1;
		ballCounter %= 100000;

		fg.s.playground
			.addSprite(ball_name, {
				animation: 'ball',
				centerx: 50,
				centery: fg.s.playground.halfHeight
			})
		;

		fg.s[ball_name].userData = G.Ball(ball_name, active);

		G.balls[ball_name] = fg.s[ball_name];

		fg.s[ball_name].registerCallback(function () {
			this.userData.update();
		}, G.REFRESH_RATE);
	};

	G.PBall = {
		init: function (name, active) {
			this.node = fg.s[name];
			this.speed = 170 / G.REFRESH_RATE;
			this.active = active;
			this.vel = {
				x: this.speed,
				y: this.speed
			};

			this.prevX = this.node.centerx;
			this.prevY = this.node.centery;
		},

		update: function () {
			if (!this.active) {
				return;
			}

			this.prevX = this.node.centerx;
			this.prevY = this.node.centery;

			this.node.move({
				centerx: this.node.centerx + this.vel.x,
				centery: this.node.centery + this.vel.y
			});

			// did the ball get past the paddle?
			if (this.node.top >= fg.s.playground.height) {
				delete G.balls[this.node.name];
				this.node.remove();
				this.node = null;
				if ($.isEmptyObject(G.balls)) {
					G.lives -= 1;
					$('#lives').html(String(G.lives));
					if (G.lives <= 0) {
						G.Scene.gameOver();
					} else {
						G.addBall(false);
						G.addCountdown();
					}

				}
				return;
			}

			this.checkWallCollision();
			this.checkBlockCollision();
			this.checkPaddleCollision();
		},

		checkWallCollision: function () {
			// hit a vertical wall?
			if ((this.node.left < 16) || (this.node.right >= (fg.s.playground.width - 16))) {
				this.node.move({
					centerx: this.prevX
				});
				this.vel.x *= - 1;
				return;
			}

			// or the top horizontal wall?
			if (this.node.top < 16) {
				this.node.move({
					centery: this.prevY
				});
				this.vel.y *= - 1;
				return;
			}
		},

		checkBlockCollision: function () {
			var
				ball = this.node,
				ball_data = this
			;

			$.each(G.blocks, function (name, block) {
				if (block.collidePointRect(ball.centerx, ball.top) && (ball_data.vel.y < 0)) {
					G.onBlockDeath(block);
					ball.move({
						centery: ball_data.prevY
					});
					ball_data.vel.y *= -1;
				} else if (block.collidePointRect(ball.centerx, ball.bottom) && (ball_data.vel.y > 0)) {
					G.onBlockDeath(block);
					ball.move({
						centery: ball_data.prevY
					});
					ball_data.vel.y *= -1;
				} else if (block.collidePointRect(ball.left, ball.centery) && (ball_data.vel.x < 0)) {
					G.onBlockDeath(block);
					ball.move({
						centerx: ball_data.prevX
					});
					ball_data.vel.x *= -1;
				} else if (block.collidePointRect(ball.right, ball.centery) && (ball_data.vel.x > 0)) {
					G.onBlockDeath(block);
					ball.move({
						centerx: ball_data.prevX
					});
					ball_data.vel.x *= -1;
				}
			});
		},

		checkPaddleCollision: function () {
			if (this.vel.y > 0) {
				if (fg.s.paddle.collidePointRect(this.node.centerx, this.node.bottom) && (this.vel.y > 0)) {
					this.node.move({
						centery: this.prevY
					});
					this.vel.x = this.determineBounceVelocity();
					this.vel.y *= -1;
				} else if (fg.s.paddle.collidePointRect(this.node.left, this.node.centery) && (this.vel.x < 0)) {
					this.node.move({
						centerx: this.prevX
					});
					this.vel.x *= -1;
				} else if (fg.s.paddle.collidePointRect(this.node.right, this.node.centery) && (this.vel.x > 0)) {
					this.node.move({
						centerx: this.prevX
					});
					this.vel.x *= -1;
				}
			}
		},

		determineBounceVelocity: function () {
			var
				dx = fg.s.paddle.centerx - this.node.centerx,
				dy = fg.s.paddle.centery - this.node.centery,
				distance = Math.sqrt((dx * dx) + (dy * dy)),
				magnitude = distance - this.node.halfHeight - fg.s.paddle.halfHeight,
				ratio = magnitude / fg.s.paddle.halfWidth * 2.5
			;

			if (this.node.centerx < fg.s.paddle.centerx) {
				ratio *= -1;
			}

			return this.speed * ratio;
		}
	};

	G.Ball = fg.Maker(G.PBall);
}(jQuery, friGame));

