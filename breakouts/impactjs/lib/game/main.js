ig.module('game.main')
.requires('game.games.menu', 'game.games.play')
.defines(function() {
	ig.resetGame = function() {
		ig.system.setGame(MenuGame);
	};
	
	window.onload = function() {
		window.scrollTo(0, 1);
	};

	if(ig.ua.mobile) {
    ig.Sound.enabled = false;
	}

	ig.main('#canvas', MenuGame, 60, 320, 480, 1);
});


