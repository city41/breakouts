ig.module('game.main').requires('game.games.menu', 'game.games.play', 'game.levels.level', 'game.levels.title').defines(function() {
	ig.resetGame = function() {
		ig.system.setGame(MenuGame);
	};

	function disablePrerendering(level) {
		level.layer.forEach(function(lyr) {
			lyr.preRender = false;
		});
	}

	window.addEventListener("load", function() {
		setTimeout(function() {
			window.scrollTo(0, 1);
		}, 0);

		if(window.location.href.indexOf('usetiles') > -1 && !ig.ua.mobile) {
			disablePrerendering(LevelLevel);
			disablePrerendering(LevelTitle);
		}

		ig.main('#canvas', MenuGame, 60, 320, 416, 1);
	});
});
