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

	fg.mouseTracker = {
		x: 0,
		y: 0
	};

	// mouseTracker inside a playgroundCallback in order to have the playground DOM
	fg.playgroundCallback(function (dom) {
		var
			element = $(dom)
		;

		$(document).mousemove(function (e) {
			var
				mouseTracker = fg.mouseTracker,
				offset = element.offset()
			;

			mouseTracker.x = e.pageX - offset.left;
			mouseTracker.y = e.pageY - offset.top;
		});

		$(document).mousedown(function (e) {
			fg.mouseTracker[e.which] = true;
		});

		$(document).mouseup(function (e) {
			fg.mouseTracker[e.which] = false;
		});
	});
}(jQuery, friGame));

