(function() {
	window.breakout = window.breakout || {};

	breakout.logo = function() {
		Crafty.sprite(1, 'media/logo.png', {
			logo: [0, 0, 131, 175]
		});

		Crafty.e('2D, DOM, logo')
			.attr({
				x: Crafty.stage.elem.clientWidth / 2 - 131 / 2,
				y: Crafty.stage.elem.clientHeight / 2 - 170
			});

		Crafty.e('2D, DOM, Text')
			.attr({
				x: 0,
				y: Crafty.stage.elem.clientHeight / 2 + 5,
				w: Crafty.stage.elem.clientWidth
			})
			.textColor('#000000')
			.text('Breakout')
			.css('font-weight', 'bold')
			.css('font-size', '30px')
			.css('text-align', 'center');
	};

	// this drops the background into any scene that calls this function
	// the background will either be a prerendered image (the default) or
	// tile based if the "usetiles" query parameter is on the URL
	breakout.createBackground = function() {
		if(window.location.href.indexOf('usetiles') > -1 && !breakout.IS_MOBILE) {
			this._createBackgroundViaTiles();
		} else {
			this._createBackgroundViaImage();
		}
	};

	breakout._createBackgroundViaImage = function() {
		var width = Crafty.stage.elem.clientWidth;
		var height = Crafty.stage.elem.clientHeight;

		Crafty.sprite(1, 'media/bg_prerendered.png', {
			bg: [0, 0, width, height]
		});

		// drop the background in
		Crafty.e('2D, Canvas, bg').attr({ x: 0, y: 0 });

		// now add in some "dummy" wall entities so collision detection still works
		// top wall
		Crafty.e('2D, Canvas, background, h')
			.attr({
				x: 0,
				y: 0,
				w: width,
				h: breakout.TILE_SIZE
			});

		// left wall
		Crafty.e('2D, Canvas, background, v')
			.attr({
				x: 0,
				y: 0,
				w: breakout.TILE_SIZE,
				h: height
			});

		// right wall
		Crafty.e('2D, Canvas, background, v')
			.attr({
				x: width - breakout.TILE_SIZE,
				y: 0,
				w: breakout.TILE_SIZE,
				h: height
			});
	};

	breakout._createBackgroundViaTiles = function() {
		Crafty.sprite(16, 'media/tiles.png', {
			r: [11, 3],
			l: [11, 4],
			v: [11, 5],
			h: [11, 6],
			b: [11, 7],
			t: [11, 8],
			g: [11, 1]
		});

		var r = 'r';
		var l = 'l';
		var v = 'v';
		var h = 'h';
		var b = 'b';
		var t = 't';
		var g = 'g';
		
		var bg = [
			[l,h,h,h,h,h,h,h,h,h,h,h,h,h,h,h,h,h,h,r],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[v,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,v],
			[b,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,b],
			[g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g],
			[t,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,t],
			[b,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,b]
		];

		for(var y = 0; y < bg.length; ++y) {
			for(var x = 0; x < bg[y].length; ++x) {
				Crafty.e('2D, Canvas, background, ' + bg[y][x])
					.attr({
						x: x* breakout.TILE_SIZE,
						y: y* breakout.TILE_SIZE
					});
			}
		}
	};

})();

