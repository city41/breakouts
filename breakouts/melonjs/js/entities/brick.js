/**
 * a brick entity
 */
EntityBrick = me.ObjectEntity.extend({
	init: function(x, y, settings) {
		// define this here instead of tiled
		settings.image = "tiles16";
		settings.spritewidth = 32;
		settings.spriteheight = 16;
		this.parent(x, y, settings);

		this.type = "brick";
		this.collidable = true;

		this.dying = false;

		// get the brick color
		this.color = settings.color.toLowerCase();
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

	onCollision: function(res, obj) {
		if (!this.dying) {
			this.dying = true;
			this.collidable = false;
			// play sound + animate brick death
			me.audio.play("brickdeath");
			var anim = new me.Tween(this.renderable.scale);
			anim.to({ x : 0.0, y : 0.0 }, 300).onComplete((function () {
				me.game.remove(this);
			}).bind(this)).start();

			// add score and decrease brick count
			me.state.current().addScore(this.type);
			me.state.current().countBrick();
			// check for power-up/power-down
			if (this.hasPowerUp) {
				me.game.add(new EntityPowerUp(this.pos.x, this.pos.y), this.z);
				me.game.sort();
			} else if(this.hasPowerDown) {
				me.game.add(new EntityPowerDown(this.pos.x,this.pos.y), this.z);
				me.game.sort();
			}
		}
	}

});


