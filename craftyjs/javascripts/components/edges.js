Crafty.c('Edges', {
	init: function() {
		Object.defineProperties(this, {
			left: {
				get: function() {
					return this.x;
				}
			},
			right: {
				get: function() {
					return this.x + this.w;
				}
			},
			top: {
				get: function() {
					return this.y;
				}
			},
			bottom: {
				get: function() {
					return this.y + this.h;
				}
			},
			centerX: {
				get: function() {
					return this.x + this.w / 2;
				}
			},
			centerY: {
				get: function() {
					return this.y + this.h / 2;
				}
			},
			center: {
				get: function() {
					return {
						x: this.centerX,
						y: this.centerY
					}
				}
			}
		});
	}
});

