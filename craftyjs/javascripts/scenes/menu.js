Crafty.scene('menu', function() {
	breakout.createBackground();

	breakout.logo();

	var verb = breakout.IS_MOBILE ? 'tap' : 'click';

	Crafty.e('2D, DOM, Text')
		.attr({
			x: 0,
			y: Crafty.stage.elem.clientHeight / 2 + 60,
			w: Crafty.stage.elem.clientWidth,
			h: 30
		})
		.text(verb + ' to start')
		.textColor('#000000')
		.css('text-align', 'center');

	Crafty.e('2D, DOM, Text')
		.attr({
			x: 0,
			y: Crafty.stage.elem.clientHeight / 2 + 140,
			w: Crafty.stage.elem.clientWidth,
			h: 30
		})
		.text('during the game: \nuse L/R arrow keys to skip levels')
		.textColor('#000000')
		.css('text-align', 'center');


	Crafty.e('2D, DOM, Mouse, Text')
		.attr({
			x: 0,
			y: 0,
			w: 320,
			h: 480
		})
		.bind('MouseDown', function(e) {
			Crafty.scene('play');
		});
});

