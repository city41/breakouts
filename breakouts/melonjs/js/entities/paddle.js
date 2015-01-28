
/**
 * the player paddle !
 */
EntityPaddle = me.Entity.extend({

	init: function(x, y, settings) {
		// define this here instead of tiled
		settings.image = me.loader.getImage("tiles16");
		settings.width = 48;
		settings.height = 16;
		settings.spritewidth = 48;
		settings.spriteheight = 16;
		this._super(me.Entity, "init", [x, y, settings]);

		this.fullSize = {
			x: 0,
			w: 48,
			y: 0,
			h: 16
		};

		this.miniSize = {
			x: 8,
			w: 40,
			y: 0,
			h: 16
		};

		// to cancel the power down
		this.timer = -1;
		this.isPaddle = true;
		this.powerDownLength = 10; // sec

		this.type = "paddle";

		this.renderable.addAnimation("idle", [16]);
		this.renderable.addAnimation("mini", [20]);
		this.renderable.setCurrentAnimation("idle");

		this.collidable = true;
        this.body.addShape(new me.Rect(0 ,0, settings.width, settings.height));

		// some "optimization" to avoid traversing
		// these whole objects on each update
		this.mousePos = me.input.mouse.pos;
		this.viewportWidth = me.game.viewport.width;
	},

	update: function(dt) {
		this.pos.x = (this.mousePos.x - this.body.getShape(0).hWidth).clamp(0, this.viewportWidth - this.body.getShape(0).width);

		// check if we have a timer active
		if (this.timer > 0) {
			this.timer -= dt;
			if (this.timer < 0) {
				// restore the normal paddle
				this.onPowerDownEnd();
			}
		}
        this.updateBounds();
        this._super(me.Entity, "update", [dt]);
		return true;
	},

	onPowerUp: function() {
		// add a new ball
		var ball = me.pool.pull("ball", 50, me.game.viewport.height/2);
		ball.active = true;
		me.game.world.addChild(ball, this.z);
	},

	onPowerDown: function() {
		if (this.renderable.isCurrentAnimation('idle')) {
			this.renderable.setCurrentAnimation("mini");
			// adjust the bounding box
			this.body.getShape(0).pos.set(this.miniSize.x, this.miniSize.y);
			this.body.getShape(0).resize(this.miniSize.w,this.miniSize.h);
			this.timer = this.powerDownLength * 1000;
		}
	},

	onPowerDownEnd: function() {
		if (this.renderable.isCurrentAnimation('mini')) {
			this.timer = -1;
			this.renderable.setCurrentAnimation("idle");
			// adjust the bounding box
			this.body.getShape(0).pos.set(this.fullSize.x, this.fullSize.y);
			this.body.getShape(0).resize(this.fullSize.w,this.fullSize.h);
			me.audio.play('recover');
		}
	}
});
