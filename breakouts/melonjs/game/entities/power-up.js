EntityPowerUp = me.ObjectEntity.extend({
	init: function(x, y) {
		var settings = {};
		settings.image = "tiles16";
		settings.spritewidth = 16;
		settings.spriteheight = 16;
		this.parent(x, y, settings);
		
		this.addAnimation('idle', [78]);
		this.setCurrentAnimation('idle');
		
		this.collidable = true;
		this.vel.x = 0;
		this.vel.y = 80 / me.sys.fps;
	},

	update: function() {
		this.pos.y += this.vel.y;
		if(this.pos.y > me.game.viewport.height) {
			me.game.remove(this);
			return false;
		}
		
		// check for collision with the paddle
		var res = me.game.collideType(this, 'paddle');
		// just check if res is defined since we have only 1 paddle 
		if (res) {
			this.collidable = false;
			me.audio.play('powerup');
			res.obj.onPowerUp();
			me.game.remove(this);
		}
		return true;
	}
});


