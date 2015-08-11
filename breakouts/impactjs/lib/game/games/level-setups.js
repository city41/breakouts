ig.module('game.games.level-setups').defines(function() {
	var r = 'red';
	var b = 'blue';
	var o = 'orange';
	var g = 'green';
	var X = null;

	ig.LevelSetups = [
		{
			bricks: [
				[X,X,g,o,g,X,X],
				[o,b,g,g,g,b,o],
				[X,b,b,b,b,b,X]
			]
		},
		{
			bricks: [
				[X,g,o,g,o,g,X],
				[X,b,b,b,b,b,X],
				[g,b,r,b,r,b,g],
				[g,b,b,b,b,b,g],
				[g,b,X,X,X,b,g],
				[X,b,b,b,b,b,X]
			]
		}
	];


});
