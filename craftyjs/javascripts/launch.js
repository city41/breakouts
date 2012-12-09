(function() {
	window.breakout = window.breakout || {};
	breakout.TILE_SIZE = 16;

	window.onload = function() {
		Crafty.init(320, 480);
		Crafty.scene("loading");
	};
})();

