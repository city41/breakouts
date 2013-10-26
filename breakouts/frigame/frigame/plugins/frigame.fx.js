/*global jQuery, friGame */
/*jslint nomen: true, sloppy: true, white: true, browser: true */

// Copyright (c) 2011-2012 Franco Bugnano

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
	var
		speeds = {
			slow: 600,
			fast: 200,
			_default: 400
		},

		opacityStep = function () {
			var
				fx = this.fx.opacity
			;

			if (fx.current_step >= fx.num_step) {
				this.opacity(fx.target);
				if (fx.callback) {
					fx.callback.call(this);
				}

				delete this.fx.opacity;

				// return true in order to stop the callback
				return true;
			}

			this.opacity(this.opacity() + fx.step);
			fx.current_step += 1;
		}
	;

	$.extend(fg.PBaseSprite, {
		fadeIn: function (duration, callback) {
			return this.fadeTo(duration, 1, callback);
		},

		fadeOut: function (duration, callback) {
			return this.fadeTo(duration, 0, callback);
		},

		fadeTo: function (duration, opacity, callback) {
			var
				speed,
				num_step
			;

			if (typeof duration === 'number') {
				speed = duration;
			} else if (speeds[duration]) {
				speed = speeds[duration];
			} else {
				speed = speeds._default;
			}

			num_step = Math.floor(speed / fg.refreshRate) || 1;

			this.fx = this.fx || {};
			this.fx.opacity = {
				target: opacity,
				current_step: 0,
				num_step: num_step,
				step: (opacity - this.opacity()) / num_step,
				callback: callback
			};

			this.registerCallback(opacityStep, fg.refreshRate);

			return this;
		}
	});
}(jQuery, friGame));

