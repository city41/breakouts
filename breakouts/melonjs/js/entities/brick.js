/**
 * a brick entity
 */
EntityBrick = me.Entity.extend({
	init: function(x, y, settings) {
        var settings = {};
		// define this here instead of tiled
		settings.image = me.loader.getImage("tiles16");
		settings.width = 32;
		settings.height = 16;
		settings.spritewidth = 32;
		settings.spriteheight = 16;
		this._super(me.Entity, "init", [x, y, settings]);

		this.type = "brick";
		this.collidable = true;
		this.dying = false;

		// get the brick color
		this.color = "blue";//settings.color.toLowerCase();
		// and power down/up flags
		this.hasPowerUp   = settings.hasPowerUp===true;
		this.hasPowerDown = settings.hasPowerDown===true;

		// Add the animations
		this.renderable.addAnimation('blue', [0]);
		this.renderable.addAnimation('orange', [6]);
		this.renderable.addAnimation('red', [12]);
		this.renderable.addAnimation('green', [18]);
		// set default one
		this.renderable.setCurrentAnimation(this.color);

		// Animate new bricks
		this.renderable.resize(0.01);
		var anim = new me.Tween(this.renderable.scale);
		anim.to({ x : 1.0, y : 1.0 }, 300).start();
	},

	onCollision: function(response) {
        var obj = response.b;
		if (!this.dying) {
			this.dying = true;
			this.collidable = false;
			// play sound + animate brick death
			me.audio.play("brickdeath");
			var anim = new me.Tween(this.renderable.scale);
			anim.to({ x : 0.0, y : 0.0 }, 300).onComplete((function () {
				me.game.world.removeChild(this);
			}).bind(this)).start();

			// add score and decrease brick count
			me.state.current().addScore(this.type);
			me.state.current().countBrick();
			// check for power-up/power-down
			if (this.hasPowerUp) {
				me.game.world.addChild(new EntityPowerUp(this.pos.x, this.pos.y), this.z);
			} else if(this.hasPowerDown) {
				me.game.world.addChild(new EntityPowerDown(this.pos.x,this.pos.y), this.z);
			}
		}
	}

});


