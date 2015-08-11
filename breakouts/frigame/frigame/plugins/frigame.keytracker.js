/*global jQuery, friGame */
/*jslint white: true, browser: true */

// Copyright (c) 2011-2014 Franco Bugnano

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Uses ideas and APIs inspired by:
// gameQuery Copyright (c) 2008 Selim Arsever (gamequery.onaluf.org), licensed under the MIT

(function ($, fg) {
	'use strict';

	// Some constants that map to the keyCode
	fg.keyCodes = {
		8: 'backspace',
		9: 'tab',
		13: 'enter',
		16: 'shift',
		17: 'ctrl',
		18: 'alt',
		19: 'pause',
		20: 'caps',
		27: 'escape',
		32: 'space',
		33: 'pageup',
		34: 'pagedown',
		35: 'end',
		36: 'home',
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		45: 'insert',
		46: 'del'
	};

	(function () {
		var
			i,
			keycodes = fg.keyCodes
		;

		for (i = 48; i <= 57; i += 1){
			keycodes[i] = String.fromCharCode(i);
		}

		for (i = 65; i <= 90; i += 1){
			keycodes[i] = String.fromCharCode(i);
		}

		for (i = 0; i <= 9; i += 1){
			keycodes[i + 96] = ['num', String(i)].join ('');
		}

		for (i = 1; i <= 12; i += 1){
			keycodes[i + 111] = ['f', String(i)].join ('');
		}
	}());

	fg.keyTracker = {};

	// keyTracker inside a startCallback in order to have effect only after startGame
	fg.startCallback(function () {
		$(document).keydown(function (e) {
			var
				key = e.keyCode,
				keycodes = fg.keyCodes
			;

			if (keycodes[key] !== undefined) {
				key = keycodes[key];
			}

			fg.keyTracker[key] = true;
		});

		$(document).keyup(function (e) {
			var
				key = e.keyCode,
				keycodes = fg.keyCodes
			;

			if (keycodes[key] !== undefined) {
				key = keycodes[key];
			}

			fg.keyTracker[key] = false;
		});
	});
}(jQuery, friGame));

