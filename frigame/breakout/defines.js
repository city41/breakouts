/*global jQuery, friGame, G */
/*jslint white: true, browser: true */

(function ($, fg) {
	'use strict';

	// The global game object
	window.G = {
		paused: false,

		score: 0,
		lives: 3,
		level: 0
	};
}(jQuery, friGame));

