window.onload = function() {
	Crafty.init(700, 400);
	Crafty.canvas.init(700, 400);
	Crafty.background('rgb(127,127,127)');

	//Paddles
	Crafty.e("Paddle, 2D, DOM, Color, Multiway")
		.color('rgb(255,0,0)')
		.attr({x:20, y:200, w:10, h:150})
		.multiway(4, {W:-90, S:90});
	Crafty.e("Paddle, 2D, DOM, Color, Multiway")
		.color('rgb(0,255,0)')
		.attr({x:680, y:200, w:10, h:150})
		.multiway(4, {UP_ARROW:-90, DOWN_ARROW:90});

	//Ball
	Crafty.e("2D, DOM, Color, Collision")
		.color('rgb(0,0,255)')
		.attr({x:350, y: 200, w:10, h:10, dX: Crafty.math.randomInt(1,5), dY: Crafty.math.randomInt(1,5)})
		.bind('EnterFrame', function() {
			//hit floor or roof
			if(this.y <= 0 || this.y >= 390)
				this.dY *= -1;

			if(this.x > 700) {
				this.x = 350;
				Crafty("LeftPaddle").each(function() { this.text(++this.points + " Points") });
			}
			if(this.x < 10) {
				this.x = 350;
				Crafty("RightPaddle").each(function() { this.text(++this.points + " Points") });
			}

			this.x += this.dX;
			this.y += this.dY;
		})
		.onHit('Paddle', function() {
			this.dX *= -1;
		})

	//Score boards
	Crafty.e("LeftPaddle, DOM, 2D, Text")
		.attr({ x: 20, y: 20, w: 100, h: 20, points: 0})
		.text("0 Points");
	Crafty.e("RightPaddle, DOM, 2D, Text")
		.attr({ x: 580, y: 20, w: 100, h: 20, points: 0})
		.text("0 Points");
}
