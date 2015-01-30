/*global friGame, Float32Array, mat4 */
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

(function (fg) {
	'use strict';

	var
		overrides = {}
	;

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	overrides.PGradient = fg.pick(fg.PGradient, [
		'remove'
	]);

	fg.extend(fg.PGradient, {
		remove: function () {
			var
				gl = fg.gl
			;

			if (this.vertexColorBuffer) {
				gl.deleteBuffer(this.vertexColorBuffer);
			}

			if (this.gradients) {
				fg.each(this.gradients, function () {
					gl.deleteBuffer(this.vertexPositionBuffer);
				});
			}

			overrides.PGradient.remove.call(this);
		},

		initColorBuffer: function () {
			var
				gl = fg.gl,
				startColor = this.startColor,
				endColor = this.endColor,
				colors,
				vertexColorBuffer
			;

			if (!gl) {
				return;
			}

			vertexColorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
			if (this.type === fg.GRADIENT_HORIZONTAL) {
				colors = [
					(endColor.r / 255), (endColor.g / 255), (endColor.b / 255), endColor.a,
					(startColor.r / 255), (startColor.g / 255), (startColor.b / 255), startColor.a,
					(endColor.r / 255), (endColor.g / 255), (endColor.b / 255), endColor.a,
					(startColor.r / 255), (startColor.g / 255), (startColor.b / 255), startColor.a
				];
			} else {
				colors = [
					(endColor.r / 255), (endColor.g / 255), (endColor.b / 255), endColor.a,
					(endColor.r / 255), (endColor.g / 255), (endColor.b / 255), endColor.a,
					(startColor.r / 255), (startColor.g / 255), (startColor.b / 255), startColor.a,
					(startColor.r / 255), (startColor.g / 255), (startColor.b / 255), startColor.a
				];
			}
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
			vertexColorBuffer.itemSize = 4;
			vertexColorBuffer.numItems = 4;

			this.vertexColorBuffer = vertexColorBuffer;

			this.gradients = {};
			this.gradient_groups = {};

			this.color_buffer_initialized = true;
		},

		addGroup: function (group) {
			var
				gl = fg.gl,
				width = group.width,
				height = group.height,
				dimension = [String(width), 'x', String(height)].join(''),
				name = group.name,
				gradients,
				vertices,
				vertexPositionBuffer
			;

			if (!gl) {
				return;
			}

			if (!this.color_buffer_initialized) {
				this.initColorBuffer();
			}

			gradients = this.gradients;
			if (gradients) {
				if (!gradients[dimension]) {
					// Create a gradient for this dimension
					vertexPositionBuffer = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
					vertices = [
						width, height, 0.0,
						0, height, 0.0,
						width, 0, 0.0,
						0, 0, 0.0
					];
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
					vertexPositionBuffer.itemSize = 3;
					vertexPositionBuffer.numItems = 4;

					gradients[dimension] = {
						vertexPositionBuffer: vertexPositionBuffer,
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
				gl = fg.gl,
				width = group.width,
				height = group.height,
				dimension = [String(width), 'x', String(height)].join(''),
				name = group.name,
				gradients,
				gradient_groups
			;

			if (!gl) {
				return;
			}

			if (!this.color_buffer_initialized) {
				this.initColorBuffer();
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
							if (fg.isEmptyObject(gradient_groups)) {
								// If no groups are using this dimension, delete the gradient
								gl.deleteBuffer(gradients[dimension].vertexPositionBuffer);
								delete gradients[dimension];
							}
						}
					}
				}
			}
		},

		drawBackground: function (gl, group) {
			var
				name = group.name,
				dimension = this.gradient_groups[name],
				vertexPositionBuffer = this.gradients[dimension].vertexPositionBuffer,
				vertexColorBuffer = this.vertexColorBuffer,
				gradientShaderProgram = fg.gradientShaderProgram,
				mvMatrix = fg.mvMatrix,
				pMatrix = fg.pMatrix
			;

			if (fg.lastProgram !== fg.gradientShaderProgram) {
				gl.useProgram(fg.gradientShaderProgram);
				fg.lastProgram = fg.gradientShaderProgram;
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.vertexAttribPointer(gradientShaderProgram.aVertexPosition, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
			gl.vertexAttribPointer(gradientShaderProgram.aVertexColor, vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.uniformMatrix4fv(gradientShaderProgram.uPMatrix, false, pMatrix);
			gl.uniformMatrix4fv(gradientShaderProgram.uMVMatrix, false, mvMatrix);

			gl.uniform1f(gradientShaderProgram.uAlpha, fg.globalAlpha);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionBuffer.numItems);
		}
	});

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	overrides.PAnimation = fg.pick(fg.PAnimation, [
		'remove',
		'onLoad'
	]);

	fg.extend(fg.PAnimation, {
		remove: function () {
			var
				gl = fg.gl
			;

			if (this.vertexPositionBuffer) {
				gl.deleteBuffer(this.vertexPositionBuffer);
			}

			if (this.texture) {
				gl.deleteTexture(this.texture);
			}

			overrides.PAnimation.remove.call(this);
		},

		onLoad: function () {
			var
				options = this.options,
				img = options.img,
				img_width = img.width,
				img_height = img.height
			;

			overrides.PAnimation.onLoad.apply(this, arguments);

			this.textureSize = new Float32Array([options.frameWidth / img_width, options.frameHeight / img_height]);
			options.offsetx /= img_width;
			options.multix /= img_width;
			options.deltax /= img_width;
			options.offsety /= img_height;
			options.multiy /= img_height;
			options.deltay /= img_height;
		},

		initBuffers: function () {
			var
				gl = fg.gl,
				options = this.options,
				halfWidth = options.halfWidth,
				halfHeight = options.halfHeight,
				vertices,
				vertexPositionBuffer
			;

			if (!gl) {
				return;
			}

			vertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			vertices = [
				halfWidth, halfHeight, 0,
				-halfWidth, halfHeight, 0,
				halfWidth, -halfHeight, 0,
				-halfWidth, -halfHeight, 0
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			vertexPositionBuffer.itemSize = 3;
			vertexPositionBuffer.numItems = 4;

			this.vertexPositionBuffer = vertexPositionBuffer;
		},

		initTexture: function () {
			var
				gl = fg.gl,
				options = this.options,
				img = options.img
			;

			if (!gl) {
				return;
			}

			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.bindTexture(gl.TEXTURE_2D, null);
		},

		drawAnimation: function (gl, sprite) {
			var
				options = sprite.options,
				animation_options = sprite.animation_options,
				currentFrame = options.currentFrame,
				vertexPositionBuffer = this.vertexPositionBuffer,
				spriteShaderProgram = fg.spriteShaderProgram,
				mvMatrix = fg.mvMatrix,
				pMatrix = fg.pMatrix
			;

			if (!vertexPositionBuffer) {
				this.initBuffers();
				vertexPositionBuffer = this.vertexPositionBuffer;
			}

			if (!this.texture) {
				this.initTexture();
			}

			if (fg.lastProgram !== fg.spriteShaderProgram) {
				gl.useProgram(fg.spriteShaderProgram);
				fg.lastProgram = fg.spriteShaderProgram;
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.vertexAttribPointer(spriteShaderProgram.aVertexPosition, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, fg.textureCoordBuffer);
			gl.vertexAttribPointer(spriteShaderProgram.aTextureCoord, fg.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.uniform1i(spriteShaderProgram.uSampler, 0);

			gl.uniform2fv(spriteShaderProgram.uTextureSize, this.textureSize);
			gl.uniform2f(
				spriteShaderProgram.uTextureOffset,
				animation_options.offsetx + options.multix + (currentFrame * animation_options.deltax),
				animation_options.offsety + options.multiy + (currentFrame * animation_options.deltay)
			);

			gl.uniformMatrix4fv(spriteShaderProgram.uPMatrix, false, pMatrix);
			gl.uniformMatrix4fv(spriteShaderProgram.uMVMatrix, false, mvMatrix);

			gl.uniform1f(spriteShaderProgram.uAlpha, fg.globalAlpha);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionBuffer.numItems);
		},

		addGroup: function () {
		},

		removeGroup: function () {
		},

		drawBackground: function () {
		}
	});

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	fg.getShader = function (str, id) {
		var
			gl = fg.gl,
			shader
		;

		if (!gl) {
			return;
		}

		shader = gl.createShader(id);

		gl.shaderSource(shader, str);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return null;
		}

		return shader;
	};

	fg.initShaders = function () {
        var
			gl = fg.gl,
			fragmentShader,
			vertexShader,
			spriteShaderProgram,
			gradientShaderProgram
		;

		if (!gl) {
			return;
		}

		// Shader programs for sprites

        fragmentShader = fg.getShader([
			'precision mediump float;',

			'varying vec2 vTextureCoord;',

			'uniform float uAlpha;',

			'uniform sampler2D uSampler;',

			'void main(void) {',
				'vec4 textureColor = texture2D(uSampler, vTextureCoord);',
				'gl_FragColor = vec4(textureColor.rgb, textureColor.a * uAlpha);',
			'}'
		].join('\n'), gl.FRAGMENT_SHADER);

        vertexShader = fg.getShader([
			'attribute vec3 aVertexPosition;',
			'attribute vec2 aTextureCoord;',

			'uniform mat4 uMVMatrix;',
			'uniform mat4 uPMatrix;',

			'varying vec2 vTextureCoord;',

			'uniform vec2 uTextureOffset;',
			'uniform vec2 uTextureSize;',

			'void main(void) {',
				'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',
				'vTextureCoord = uTextureOffset + (uTextureSize * aTextureCoord);',
			'}'
		].join('\n'), gl.VERTEX_SHADER);

		spriteShaderProgram = gl.createProgram();
		gl.attachShader(spriteShaderProgram, vertexShader);
		gl.attachShader(spriteShaderProgram, fragmentShader);
		gl.linkProgram(spriteShaderProgram);

		if (!gl.getProgramParameter(spriteShaderProgram, gl.LINK_STATUS)) {
			return;
		}

		spriteShaderProgram.aVertexPosition = gl.getAttribLocation(spriteShaderProgram, 'aVertexPosition');
		gl.enableVertexAttribArray(spriteShaderProgram.aVertexPosition);

		spriteShaderProgram.aTextureCoord = gl.getAttribLocation(spriteShaderProgram, 'aTextureCoord');
		gl.enableVertexAttribArray(spriteShaderProgram.aTextureCoord);

		spriteShaderProgram.uPMatrix = gl.getUniformLocation(spriteShaderProgram, 'uPMatrix');
		spriteShaderProgram.uMVMatrix = gl.getUniformLocation(spriteShaderProgram, 'uMVMatrix');
		spriteShaderProgram.uSampler = gl.getUniformLocation(spriteShaderProgram, 'uSampler');

		spriteShaderProgram.uTextureSize = gl.getUniformLocation(spriteShaderProgram, 'uTextureSize');
		spriteShaderProgram.uTextureOffset = gl.getUniformLocation(spriteShaderProgram, 'uTextureOffset');

		spriteShaderProgram.uAlpha = gl.getUniformLocation(spriteShaderProgram, 'uAlpha');

		fg.spriteShaderProgram = spriteShaderProgram;

		// Shader programs for gradients

        fragmentShader = fg.getShader([
			'precision mediump float;',

			'varying vec4 vColor;',

			'uniform float uAlpha;',

			'void main(void) {',
				'gl_FragColor = vec4(vColor.rgb, vColor.a * uAlpha);',
			'}'
		].join('\n'), gl.FRAGMENT_SHADER);

        vertexShader = fg.getShader([
			'attribute vec3 aVertexPosition;',
			'attribute vec4 aVertexColor;',

			'uniform mat4 uMVMatrix;',
			'uniform mat4 uPMatrix;',

			'varying vec4 vColor;',

			'void main(void) {',
				'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',
				'vColor = aVertexColor;',
			'}'
		].join('\n'), gl.VERTEX_SHADER);

		gradientShaderProgram = gl.createProgram();
		gl.attachShader(gradientShaderProgram, vertexShader);
		gl.attachShader(gradientShaderProgram, fragmentShader);
		gl.linkProgram(gradientShaderProgram);

		if (!gl.getProgramParameter(gradientShaderProgram, gl.LINK_STATUS)) {
			return;
		}

		gradientShaderProgram.aVertexPosition = gl.getAttribLocation(gradientShaderProgram, 'aVertexPosition');
		gl.enableVertexAttribArray(gradientShaderProgram.aVertexPosition);

		gradientShaderProgram.aVertexColor = gl.getAttribLocation(gradientShaderProgram, 'aVertexColor');
		gl.enableVertexAttribArray(gradientShaderProgram.aVertexColor);

		gradientShaderProgram.uPMatrix = gl.getUniformLocation(gradientShaderProgram, 'uPMatrix');
		gradientShaderProgram.uMVMatrix = gl.getUniformLocation(gradientShaderProgram, 'uMVMatrix');

		gradientShaderProgram.uAlpha = gl.getUniformLocation(gradientShaderProgram, 'uAlpha');

		fg.gradientShaderProgram = gradientShaderProgram;

		fg.lastProgram = null;
	};

	fg.initBuffers = function () {
        var
			gl = fg.gl,
			textureCoords,
			textureCoordBuffer
		;

		if (!gl) {
			return;
		}

		textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
		textureCoords = [
			// Front face
			1, 1,
			0, 1,
			1, 0,
			0, 0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		textureCoordBuffer.itemSize = 2;
		textureCoordBuffer.numItems = 4;

		fg.textureCoordBuffer = textureCoordBuffer;
	};

	fg.mvPushMatrix = function () {
		var
			copy = mat4.create()
		;

		mat4.set(fg.mvMatrix, copy);
		fg.mvMatrixStack.push(copy);
	};

	fg.mvPopMatrix = function () {
		var
			mvMatrixStack = fg.mvMatrixStack
		;

		if (mvMatrixStack.length) {
			fg.mvMatrix = mvMatrixStack.pop();
		}
	};

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	fg.extend(fg.PSprite, {
		draw: function () {
			var
				options = this.options,
				animation = options.animation,
				angle = options.angle,
				scaleh = options.scaleh,
				scalev = options.scalev,
				alpha = options.alpha,
				old_alpha,
				gl = fg.gl,
				mvMatrix = fg.mvMatrix
			;

			if (animation && alpha && !options.hidden) {
				fg.mvPushMatrix();

				mat4.translate(mvMatrix, [this.centerx, this.centery, 0]);

				if (angle) {
					mat4.rotate(mvMatrix, angle, [0, 0, 1]);
				}

				if ((scaleh !== 1) || (scalev !== 1)) {
					mat4.scale(mvMatrix, [scaleh, scalev, 1]);
				}

				old_alpha = fg.globalAlpha;
				fg.globalAlpha *= alpha;

				animation.drawAnimation(gl, this);

				fg.mvPopMatrix();

				fg.globalAlpha = old_alpha;
			}
		}
	});

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	overrides.PSpriteGroup = fg.pick(fg.PSpriteGroup, [
		'init',
		'remove',
		'draw'
	]);

	fg.extend(fg.PSpriteGroup, {
		init: function (name, options, parent) {
			var
				gl,
				dom,
				width,
				height,
				canvas,
				mvMatrix = mat4.create(),
				mvMatrixStack = [],
				pMatrix = mat4.create()
			;

			this.old_options = {};

			if (!parent) {
				dom = options.parentDOM;
				width = options.width;
				height = options.height;

				if (dom.getContext) {
					this.dom = null;

					try {
						// Try to grab the standard context. If it fails, fallback to experimental.
						gl = dom.getContext('webgl', {alpha: false}) || dom.getContext('experimental-webgl', {alpha: false});
					} catch (e) {
						gl = null;
					}

					// Force the width and height of the sprite group the same as the ones defined for the canvas
					options.width = dom.width || 300;
					options.height = dom.height || 150;
				} else {
					canvas = document.createElement('canvas');
					canvas.screencanvas = true;	// Optimization for CocoonJS
					canvas.id = [fg.domPrefix, name].join('');
					canvas.width = width;
					canvas.height = height;
					dom.insertBefore(canvas, dom.firstChild);
					canvas.className = fg.cssClass;	// Reset background properties set by external CSS
					fg.extend(canvas.style, {
						'left': '0px',
						'top': '0px',
						'width': [String(width), 'px'].join(''),
						'height': [String(height), 'px'].join(''),
						'overflow': 'hidden'
					});

					this.dom = canvas;

					try {
						// Try to grab the standard context. If it fails, fallback to experimental.
						gl = canvas.getContext('webgl', {alpha: false}) || canvas.getContext('experimental-webgl', {alpha: false});
					} catch (e) {
						gl = null;
					}
				}

				if (gl) {
					gl.viewportWidth = width;
					gl.viewportHeight = height;

					fg.gl = gl;
					fg.initShaders();
					fg.initBuffers();
					fg.mvMatrix = mvMatrix;
					fg.mvMatrixStack = mvMatrixStack;
					fg.pMatrix = pMatrix;

					gl.clearColor(0, 0, 0, 0);
					gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
					gl.enable(gl.BLEND);
					gl.disable(gl.DEPTH_TEST);

					gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
					gl.clear(gl.COLOR_BUFFER_BIT);

					mat4.ortho(0, gl.viewportWidth, gl.viewportHeight, 0, -1, 1, pMatrix);

					mat4.identity(mvMatrix);
				}
			}

			// Call the overridden function last, in order to have the callbacks called once the object has been fully initialized
			overrides.PSpriteGroup.init.apply(this, arguments);
		},

		// Public functions

		remove: function () {
			var
				background = this.options.background,
				old_background = this.old_options.background,
				dom = this.dom
			;

			overrides.PSpriteGroup.remove.apply(this, arguments);

			if (old_background) {
				old_background.removeGroup(this);
			}

			if (background) {
				background.removeGroup(this);
			}

			if (dom && dom.parentNode) {
				dom.parentNode.removeChild(dom);
			}
		},

		// Implementation details

		draw: function () {
			var
				options = this.options,
				old_options = this.old_options,
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
				old_alpha,
				context_saved,
				gl = fg.gl,
				mvMatrix = fg.mvMatrix
			;

			if (!this.parent) {
				gl.clear(gl.COLOR_BUFFER_BIT);
				fg.globalAlpha = 1;
			}

			if (background !== old_background) {
				if (old_background) {
					old_background.removeGroup(this);
				}

				if (background) {
					background.addGroup(this);
				}

				old_options.width = width;
				old_options.height = height;
				old_options.background = background;
			} else {
				if ((width !== old_options.width) || (height !== old_options.height)) {
					// Reset the background in order to create a new one with the new width and height
					if (background) {
						background.removeGroup(this);
						background.addGroup(this);
					}

					old_options.width = width;
					old_options.height = height;
				}
			}

			if ((this.layers.length || background) && alpha && !options.hidden) {
				if (angle || (scaleh !== 1) || (scalev !== 1)) {
					fg.mvPushMatrix();
					context_saved = true;

					mat4.translate(mvMatrix, [this.centerx, this.centery, 0]);

					if (angle) {
						mat4.rotate(mvMatrix, angle, [0, 0, 1]);
					}

					if ((scaleh !== 1) || (scalev !== 1)) {
						mat4.scale(mvMatrix, [scaleh, scalev, 1]);
					}

					mat4.translate(mvMatrix, [-this.halfWidth, -this.halfHeight, 0]);
				} else if (left || top) {
					fg.mvPushMatrix();
					context_saved = true;

					mat4.translate(mvMatrix, [left, top, 0]);
				} else {
					context_saved = false;
				}

				old_alpha = fg.globalAlpha;
				fg.globalAlpha *= alpha;

				if (background) {
					background.drawBackground(gl, this);
				}

				overrides.PSpriteGroup.draw.apply(this, arguments);

				if (context_saved) {
					fg.mvPopMatrix();
				}

				fg.globalAlpha = old_alpha;
			}
		}
	});
}(friGame));

