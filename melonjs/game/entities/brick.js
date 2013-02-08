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
		this.addAnimation('blue', [0]);
		this.addAnimation('bluedeath', [1, 2, 3, 4], me.sys.fps/30);
		this.addAnimation('bluebirth', [4, 3, 2, 1, 0]);
		this.addAnimation('orange', [6]);
		this.addAnimation('orangedeath', [7, 8, 9, 10], me.sys.fps/30);
		this.addAnimation('orangebirth', [10, 9, 8, 7, 6]);
		this.addAnimation('red', [12]);
		this.addAnimation('reddeath', [13,14, 15, 16], me.sys.fps/30);
		this.addAnimation('redbirth', [16, 15, 14, 13, 12]);
		this.addAnimation('green', [18]);
		this.addAnimation('greendeath', [19, 20, 21, 22], me.sys.fps/30);
		this.addAnimation('greenbirth', [22, 21, 20, 19, 18]);
		// set default one
		this.setCurrentAnimation(this.color + 'birth', this.color);
	},

	onCollision: function(res, obj) {
		if (!this.dying) {
			this.dying = true;
			this.collidable = false;
			// play sound + change animation
			me.audio.play("brickdeath");
			this.setCurrentAnimation(this.color + 'death', function(){me.game.remove(this)});
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


