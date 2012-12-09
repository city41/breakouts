ig.module('game.main')
.requires('game.games.menu', 'game.games.play')
.defines(function() {
	ig.resetGame = function() {
		ig.system.setGame(MenuGame);
	};
	
	ig.main('#canvas', MenuGame, 60, 320, 480, 1);
});


