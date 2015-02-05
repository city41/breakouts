/**
 * a brick entity
 */
EntityBrick = me.Entity.extend({
	init: function(x, y, settings) {
		// define this here instead of tiled
		settings.image = "tiles16";
		settings.width = 32;
		settings.height = 16;
		settings.spritewidth = 32;
		settings.spriteheight = 16;
        this._super(me.Entity, 'init', [x, y, settings]);

		this.type = "brick";

		this.dying = false;

		// get the brick color
		this.color = settings.color.toLowerCase();
		// Add the animations
		this.renderable.addAnimation('blue', [0]);
		this.renderable.addAnimation('orange', [6]);
		this.renderable.addAnimation('red', [12]);
		this.renderable.addAnimation('green', [18]);
		// set default one
		this.renderable.setCurrentAnimation(this.color);

		// Animate new bricks
		this.renderable.scale(0.01);
		var anim = new me.Tween(this.renderable._scale);
		anim.to({ x : 1.0, y : 1.0 }, 300).start();
	},

	onCollision : function (response, other) {
		if (!this.dying) {
			this.dying = true;
            //avoid further collision and delete it
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
			// play sound + animate brick death
			me.audio.play("brickdeath");
			var anim = new me.Tween(this.renderable._scale);
			anim.to({ x : 0.0, y : 0.0 }, 300).onComplete((function () {
				me.game.world.removeChild(this);
			}).bind(this)).start();

			// add score and decrease brick count
			me.state.current().addScore(this.type);
			me.state.current().countBrick();
		}
	}

});


