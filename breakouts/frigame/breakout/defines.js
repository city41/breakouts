/*global jQuery, friGame, G */
/*jslint sloppy: true, white: true, browser: true */

(function ($, fg) {
	// The global game object
	window.G = {
		REFRESH_RATE: 1000 / 30,

		paused: false,

		score: 0,
		lives: 3,
		level: 0
	};
}(jQuery, friGame));

