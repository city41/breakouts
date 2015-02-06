
/**
 * the player paddle !
 */
EntityPaddle = me.Entity.extend({

	init: function(x, y, settings) {
		// define this here instead of tiled
		settings.image = "tiles16";
		settings.width = 48;
		settings.height = 16;
		settings.spritewidth = 48;
		settings.spriteheight = 16;
        this._super(me.Entity, 'init', [x, y, settings]);

		this.type = "paddle";

		this.renderable.addAnimation("idle", [16]);
		this.renderable.addAnimation("mini", [20]);
		this.renderable.setCurrentAnimation("idle");

		// some "optimization" to avoid traversing
		// these whole objects on each update
		this.mousePos = me.input.mouse.pos;
		this.viewportWidth = me.game.viewport.width;
	},

	update: function(dt) {
		this.pos.x = (this.mousePos.x - this.getBounds().width/2).clamp(0, this.viewportWidth - this.getBounds().width);
        this.updateBounds();
		// return true if we moved
		return true;
	},
});

