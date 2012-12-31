Crafty.scene('win', function() {
	breakout.createBackground();

	breakout.logo();

	Crafty.e('2D, DOM, Text')
		.attr({
			x: 0,
			y: Crafty.stage.elem.clientHeight / 2 + 60,
			w: Crafty.stage.elem.clientWidth,
			h: 30
		})
		.text('you are the master!')
		.textColor('#000000')
		.css('text-align', 'center');


	Crafty.e('2D, Canvas, Mouse, Keyboard, Text')
		.attr({
			x: 0,
			y: 0,
			w: 320,
			h: 480
		})
		.bind('MouseDown', function(e) {
			Crafty.scene('menu');
		});

	setTimeout(function() {
		Crafty.scene('menu');
	}, 4000);
});



