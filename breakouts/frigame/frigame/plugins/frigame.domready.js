/*global friGame, self, top */
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
// Based on domready (c) Dustin Diaz 2012 - License MIT

(function (fg) {
	'use strict';

	var
		fns = [],
		fn,
		testEl = document.documentElement,
		hack = testEl.doScroll,
		loadedRegex = hack ? /^loaded|^c/ : /^loaded|c/,
		loaded = loadedRegex.test(document.readyState)
	;

	function flush() {
		var
			f
		;

		loaded = 1;
		while (fns.length) {
			f = fns.shift();
			f();
		}
	}

	if (document.addEventListener) {
		fn = function () {
			document.removeEventListener('DOMContentLoaded', fn, false);
			flush();
		};

		document.addEventListener('DOMContentLoaded', fn, false);
	} else if (document.attachEvent) {
		fn = function () {
			if (/^c/.test(document.readyState)) {
				document.detachEvent('onreadystatechange', fn);
				flush();
			}
		};

		document.attachEvent('onreadystatechange', fn);
	}

	fg.ready = function (callback) {
		if (loaded) {
			callback();
		} else {
			if (hack) {
				if (self !== top) {
					fns.push(callback);
				} else {
					(function () {
						try {
							testEl.doScroll('left');
						} catch (e) {
							return setTimeout(function () { fg.ready(callback); }, 50);
						}

						loaded = 1;
						callback();
					}());
				}
			} else {
				fns.push(callback);
			}
		}
	};
}(friGame));

