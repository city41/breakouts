/*global jQuery, friGame */
/*jslint sloppy: true, white: true, browser: true */

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
// Uses the safeDrawImage function taken from:
// Akihabara Copyright (c) 2010 Francesco Cottone, http://www.kesiev.com/, licensed under the MIT

(function ($, fg) {
	var
		baseSprite = fg.PSprite,
		baseSpriteGroup = fg.PSpriteGroup
	;

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	$.extend(fg.PGradient, {
		initCanvas: function () {
			var
				startColor = this.startColor,
				endColor = this.endColor
			;

			if (startColor === endColor) {
				// Solid color
				this.fillStyle = this.startColorStr;
			} else {
				// Gradient
				this.gradients = {};
				this.gradient_groups = {};
			}

			this.canvas_initialized = true;
		},

		addGroup: function (group) {
			var
				ctx = fg.ctx,
				width = group.width,
				height = group.height,
				dimension,
				name = group.name,
				gradients,
				gradient
			;

			if (!this.canvas_initialized) {
				this.initCanvas();
			}

			gradients = this.gradients;
			if (gradients) {
				if (this.type === fg.GRADIENT_HORIZONTAL) {
					dimension = width;
					height = 0;
				} else {
					dimension = height;
					width = 0;
				}

				if (!gradients[dimension]) {
					// Create a gradient for this dimension
					gradient = ctx.createLinearGradient(0, 0, width, height);
					gradient.addColorStop(0, this.startColorStr);
					gradient.addColorStop(1, this.endColorStr);

					gradients[dimension] = {
						fillStyle: gradient,
						groups: {}
					};
				}

				// Memorize the groups that have this dimension
				gradients[dimension].groups[name] = true;
				this.gradient_groups[name] = dimension;
			}
		},

		removeGroup: function (group) {
			var
				dimension,
				name = group.name,
				gradients,
				gradient_groups
			;

			if (!this.canvas_initialized) {
				this.initCanvas();
			}

			gradients = this.gradients;
			if (gradients) {
				gradient_groups = this.gradient_groups;
				if (gradient_groups[name] !== undefined) {
					// Get the gradient dimension according to the group name
					dimension = gradient_groups[name];
					delete gradient_groups[name];

					if (gradients[dimension]) {
						gradient_groups = gradients[dimension].groups;
						if (gradient_groups[name]) {
							// Remove the group from the dimension
							delete gradient_groups[name];
							if ($.isEmptyObject(gradient_groups)) {
								// If no groups are using this dimension, delete the gradient
								delete gradients[dimension];
							}
						}
					}
				}
			}
		},

		drawBackground: function (ctx, group) {
			var
				width = group.width,
				height = group.height,
				dimension
			;

			if (this.fillStyle) {
				// Solid color
				ctx.fillStyle = this.fillStyle;
			} else {
				// Gradient
				if (this.type === fg.GRADIENT_HORIZONTAL) {
					dimension = width;
				} else {
					dimension = height;
				}

				ctx.fillStyle = this.gradients[dimension].fillStyle;
			}

			ctx.fill();
		}
	});
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	$.extend(fg.PAnimation, {
		drawBackground: function (ctx, group) {
			var
				img = this.options.img,
				fillStyle = this.fillStyle
			;

			if (group.options.backgroundType === fg.BACKGROUND_STRETCHED) {
				// Stretched background
				fg.safeDrawImage(
					ctx,
					img,
					0,
					0,
					img.width,
					img.height,
					0,
					0,
					group.width,
					group.height
				);
			} else {
				// Tiled background
				if (!fillStyle) {
					fillStyle = ctx.createPattern(img, 'repeat');
					this.fillStyle = fillStyle;
				}

				ctx.fillStyle = fillStyle;
				ctx.fill();
			}
		}
	});

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	fg.PSprite = Object.create(baseSprite);
	$.extend(fg.PSprite, {
		draw: function () {
			var
				options = this.options,
				animation = options.animation,
				angle = options.angle,
				scaleh = options.scaleh,
				scalev = options.scalev,
				alpha = options.alpha,
				old_alpha,
				animation_options = this.animation_options,
				width = this.width,
				height = this.height,
				currentFrame = options.currentFrame,
				ctx = fg.ctx
			;

			if (animation && alpha && !options.hidden) {
				ctx.save();

				ctx.translate(this.centerx, this.centery);

				if (angle) {
					ctx.rotate(angle);
				}

				if ((scaleh !== 1) || (scalev !== 1)) {
					ctx.scale(scaleh, scalev);
				}

				old_alpha = fg.globalAlpha;
				if (alpha !== 1) {
					fg.globalAlpha *= alpha;
					ctx.globalAlpha = fg.globalAlpha;
				}

				fg.safeDrawImage(
					ctx,
					animation_options.img,
					animation_options.offsetx + options.multix + (currentFrame * animation_options.deltax),
					animation_options.offsety + options.multiy + (currentFrame * animation_options.deltay),
					width,
					height,
					-(this.halfWidth),
					-(this.halfHeight),
					width,
					height
				);

				ctx.restore();

				fg.globalAlpha = old_alpha;
			}
		}
	});

	fg.Sprite = fg.Maker(fg.PSprite);

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	fg.PSpriteGroup = Object.create(baseSpriteGroup);
	$.extend(fg.PSpriteGroup, {
		init: function (name, options, parent) {
			var
				dom,
				width,
				height
			;

			baseSpriteGroup.init.apply(this, arguments);

			this.old_options = {};

			if (!parent) {
				width = String(options.width);
				height = String(options.height);

				dom = $(['<canvas id="', fg.domPrefix, name, '" width ="', width, '" height="', height, '"></canvas>'].join('')).prependTo(options.parentDOM);
				dom.addClass(fg.cssClass);	// Reset background properties set by external CSS
				dom.css({
					'left': '0px',
					'top': '0px',
					'width': [width, 'px'].join(''),
					'height': [height, 'px'].join(''),
					'overflow': 'hidden'
				});

				this.dom = dom;

				fg.ctx = dom.get(0).getContext('2d');
			}
		},

		// Public functions

		remove: function () {
			var
				background = this.options.background,
				old_background = this.old_options.background
			;

			baseSpriteGroup.remove.apply(this, arguments);

			if (old_background && old_background.removeGroup) {
				old_background.removeGroup(this);
			}

			if (background && background.removeGroup) {
				background.removeGroup(this);
			}

			if (this.dom) {
				this.dom.remove();
			}
		},

		// Implementation details

		draw: function () {
			var
				options = this.options,
				old_options = this.old_options,
				parent = this.parent,
				left = this.left,
				top = this.top,
				width = this.width,
				height = this.height,
				background = options.background,
				old_background = old_options.background,
				angle = options.angle,
				scaleh = options.scaleh,
				scalev = options.scalev,
				alpha = options.alpha,
				crop = options.crop,
				old_alpha,
				alpha_changed,
				context_saved,
				ctx = fg.ctx
			;

			if (!parent) {
				fg.ctx.clearRect(0, 0, width, height);
				fg.globalAlpha = 1;
			}

			if (background !== old_background) {
				if (old_background && old_background.removeGroup) {
					old_background.removeGroup(this);
				}

				if (background && background.addGroup) {
					background.addGroup(this);
				}

				old_options.width = width;
				old_options.height = height;
				old_options.background = background;
			} else {
				if ((width !== old_options.width) || (height !== old_options.height)) {
					// Reset the background in order to create a new one with the new width and height
					if (background) {
						if (background.removeGroup) {
							background.removeGroup(this);
						}

						if (background.addGroup) {
							background.addGroup(this);
						}
					}

					old_options.width = width;
					old_options.height = height;
				}
			}

			if ((this.layers.length || background) && alpha && !options.hidden) {
				if ((angle) || (scaleh !== 1) || (scalev !== 1)) {
					ctx.save();
					context_saved = true;

					ctx.translate(this.centerx, this.centery);

					if (angle) {
						ctx.rotate(angle);
					}

					if ((scaleh !== 1) || (scalev !== 1)) {
						ctx.scale(scaleh, scalev);
					}

					ctx.translate(-this.halfWidth, -this.halfHeight);
				} else if (left || top) {
					ctx.save();
					context_saved = true;

					ctx.translate(left, top);
				} else {
					context_saved = false;
				}

				old_alpha = fg.globalAlpha;
				if (alpha !== 1) {
					// Don't save the entire context only for alpha changes
					fg.globalAlpha *= alpha;
					ctx.globalAlpha = fg.globalAlpha;
					alpha_changed = true;
				} else {
					alpha_changed = false;
				}

				if (background || crop) {
					// Prepare a rect path for the background and the clipping region
					ctx.beginPath();
					ctx.rect(0, 0, width, height);
				}

				if (background) {
					background.drawBackground(ctx, this);
				}

				if (crop) {
					if (!context_saved) {
						ctx.save();
						context_saved = true;
					}

					ctx.clip();
				}

				baseSpriteGroup.draw.apply(this, arguments);

				if (context_saved) {
					// ctx.restore restores also the globalAlpha value
					ctx.restore();
				} else {
					if (alpha_changed) {
						ctx.globalAlpha = old_alpha;
					}
				}

				fg.globalAlpha = old_alpha;
			}
		}
	});

	fg.SpriteGroup = fg.Maker(fg.PSpriteGroup);

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	fg.safeDrawImage = function (tox, img, sx, sy, sw, sh, dx, dy, dw, dh) {
		if ((!img) || (!tox)) {
			return;
		}

		if (sx < 0) {
			dx -= (dw / sw) * sx;
			sw += sx;
			sx = 0;
		}

		if (sy < 0) {
			dy -= (dh / sh) * sy;
			sh += sy;
			sy = 0;
		}

		if (sx + sw > img.width) {
			dw = (dw / sw) * (img.width - sx);
			sw = img.width - sx;
		}

		if (sy + sh > img.height) {
			dh = (dh / sh) * (img.height - sy);
			sh = img.height - sy;
		}

		if ((sh > 0) && (sw > 0) && (sx < img.width) && (sy < img.height)) {
			tox.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
		}
	};
}(jQuery, friGame));

