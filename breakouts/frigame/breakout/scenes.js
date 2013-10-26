/*global jQuery, friGame, G */
/*jslint sloppy: true, white: true, browser: true */

(function ($, fg) {
	function setupLevel(levelAsset) {
		fg.s.playground
			.clear()
			.clearCallbacks()
		;

		G.setupBlocks(G.LevelSetups[levelAsset]);
		G.balls = {};
		G.addBall(false);
		G.addCountdown();
		G.addPaddle();
	}

	G.Scene = {
		title: function () {
			var
				//verb = Q.touchDevice ? 'Tap' : 'Click'
				verb = 'Click'
			;

			G.level = 0;

			// Clear the hud out
			$('#overlay').empty();

			fg.s.playground
				.clear()
				.clearCallbacks()
				.addSprite('Title', {
					animation: 'logo',
					centerx: fg.s.playground.centerx,
					centery: 150
				})
			;

			$('#playground').one('click', function () {
				G.Scene.level1();
			});

			$('<div class="gameText"></div>')
				.html([verb, ' to start'].join(''))
				.css({
					width: fg.s.playground.width,
					top: 270
				})
				.appendTo('#overlay')
			;

			$('<div class="gameText"></div>')
				.html('during the game: use L/R arrow<br />keys to skip levels')
				.css({
					width: fg.s.playground.width,
					top: 350
				})
				.appendTo('#overlay')
			;
		},

		gameOver: function () {
			fg.s.playground
				.clear()
				.clearCallbacks()
				.addSprite('Title', {
					animation: 'logo',
					centerx: fg.s.playground.centerx,
					centery: 150
				})
			;

			$('#playground').one('click', function () {
				G.Scene.title();
			});

			$('<div class="gameText"></div>')
				.html('Game Over!')
				.css({
					width: fg.s.playground.width,
					top: 290
				})
				.appendTo('#overlay')
			;
		},

		winner: function () {
			G.level = 5;

			fg.s.playground
				.clear()
				.clearCallbacks()
				.addSprite('Title', {
					animation: 'logo',
					centerx: fg.s.playground.centerx,
					centery: 150
				})
			;

			$('#playground').one('click', function () {
				G.Scene.title();
			});

			$('<div class="gameText"></div>')
				.html('A Winner is You!')
				.css({
					width: fg.s.playground.width,
					top: 290
				})
				.appendTo('#overlay')
			;
		},

		hud: function () {
			$('#overlay').empty();

			// Score
			$('<div class="hudText"></div>')
				.html('score: <span id="score"></span>')
				.css({
					width: fg.s.playground.width,
					top: fg.s.playground.height - 20
				})
				.appendTo('#overlay')
			;

			$('#score').html(String(G.score));

			// Lives
			$('<div class="hudText"></div>')
				.html('lives: <span id="lives"></span>')
				.css({
					left: 20,
					top: fg.s.playground.height - 20
				})
				.appendTo('#overlay')
			;

			$('#lives').html(String(G.lives));

			// Level
			$('<div class="hudText"></div>')
				.html('level: <span id="level"></span>')
				.css({
					left: fg.s.playground.width - 80,
					top: fg.s.playground.height - 20
				})
				.appendTo('#overlay')
			;

			$('#level').html(String(G.level));
		},

		level1: function () {
			// Set up the game state
			$.extend(G, {
				score: 0,
				lives: 3,
				level: 1
			});

			// Add the hud in
			G.Scene.hud();

			// Call the helper methods to get the
			// level all set up with blocks, a ball and a paddle
			setupLevel(0);

			// For when the stage is complete
			G.nextScene = 'level2';
		},

		level2: function () {
			G.level = 2;
			G.Scene.hud();
			setupLevel(1);
			G.nextScene = 'level3';
		},

		level3: function () {
			G.level = 3;
			G.Scene.hud();
			setupLevel(2);
			G.nextScene = 'level4';
		},

		level4: function () {
			G.level = 4;
			G.Scene.hud();
			setupLevel(3);
			G.nextScene = 'winner';
		}
	};

	// Level Skipping
	G.initLevelSkipping = function () {
		$(document).on('keydown', function (e) {
			if (fg.keyCodes[e.keyCode] === 'left') {
				if (G.level > 1) {
					G.Scene[['level', String(G.level - 1)].join('')]();
				} else {
					G.Scene.title();
				}
			} else if (fg.keyCodes[e.keyCode] === 'right') {
				if (G.level < 4) {
					G.Scene[['level', String(G.level + 1)].join('')]();
				} else if (G.level === 4) {
					G.Scene.winner();
				}
			} else if (fg.keyCodes[e.keyCode] === 'P') {
				if (G.paused) {
					G.paused = false;
					fg.startGame();
				} else {
					G.paused = true;
					fg.stopGame();
				}
			}
		});
	};
}(jQuery, friGame));

