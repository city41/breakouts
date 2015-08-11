(function() {
	window.breakout = window.breakout || {};
	breakout.TILE_SIZE = 16;

	breakout.IS_MOBILE = (function() {
		try {
			document.createEvent("TouchEvent");
			return true;
		} catch (e) {
			return false;
		}
	})();


	window.onload = function() {
		Crafty.init(320, 416, document.getElementById('cr-stage'));
		Crafty.canvas.init();
		Crafty.scene('loading');

		setTimeout(function() {
			window.scrollTo(0, 1);
		}, 1);
	};
})();
