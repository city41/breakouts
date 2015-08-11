ig.module('game.games.win')
.requires('impact.game', 'impact.font', 'game.levels.title')
.defines(function() {

	YouWinGame = ig.Game.extend({
		font: new ig.Font('media/font.png'),

		init: function() {
			this.timer = new ig.Timer(6);
			this.loadLevel(LevelTitle);
		},

		update: function() {
			this.parent();
			if(this.timer.delta() > 0) {
				ig.resetGame();
			}
		},

		draw: function() {
			this.parent();
			this.font.draw('you are the master!', ig.system.width / 2, ig.system.height / 2 + 100, ig.Font.ALIGN.CENTER);
		}
	});
});




