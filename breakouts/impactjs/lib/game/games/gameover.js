ig.module('game.games.gameover')
.requires('impact.game', 'impact.font', 'game.levels.title')
.defines(function() {

	GameOverGame = ig.Game.extend({

		font: new ig.Font('media/font.png'),

		init: function() {
			ig.input.bind(ig.KEY.MOUSE1, 'action');
			this.timer = new ig.Timer(2);
			this.loadLevel(LevelTitle);
		},

		update: function() {
			this.parent();
			if(this.timer.delta() > 0 || ig.input.pressed('action')) {
				ig.resetGame();
			}
		},

		draw: function() {
			this.parent();
			this.font.draw('game over!', ig.system.width / 2, ig.system.height / 2 + 100, ig.Font.ALIGN.CENTER);
		}
	});
});



