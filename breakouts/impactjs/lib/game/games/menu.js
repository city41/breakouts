ig.module('game.games.menu')
.requires('impact.game', 'impact.font', 'game.games.play', 'game.levels.title')
.defines(function() {

	MenuGame = ig.Game.extend({

		font: new ig.Font('media/font.png'),

		init: function() {
			ig.input.bind(ig.KEY.MOUSE1, 'action');

			this.loadLevel(LevelTitle);
		},

		update: function() {
			this.parent();

			if(ig.input.pressed('action')) {
				ig.system.setGame(PlayGame);
			}
		},

		draw: function() {
			this.parent();
			this.font.draw('click mouse to start', ig.system.width / 2, ig.system.height / 2 + 60, ig.Font.ALIGN.CENTER);
			this.font.draw('during the game: \nuse L/R arrow keys to skip levels', ig.system.width / 2, ig.system.height / 2 + 140, ig.Font.ALIGN.CENTER);
		}
	});
});


