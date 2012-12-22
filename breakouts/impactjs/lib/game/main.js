ig.module('game.main').requires('game.games.menu', 'game.games.play').defines(function() {
	ig.resetGame = function() {
		ig.system.setGame(MenuGame);
	};

	window.addEventListener("load", function() {
		setTimeout(function() {
			window.scrollTo(0, 1);

		}, 0);

		if (ig.ua.mobile) {
			ig.Sound.enabled = false;
		}

		ig.main('#canvas', MenuGame, 60, 320, 416, 1);
	});
});

