
/** 
 * the player paddle !
 */
EntityPaddle = me.ObjectEntity.extend({

	init: function(x, y, settings) {
		// define this here instead of tiled
		settings.image = "tiles16";
		settings.spritewidth = 48;
		settings.spriteheight = 16;
		this.parent(x, y, settings);
		
		this.fullSize = {
			x: 0,
			w: 48,
			y: 0,
			h: 16
		};
		
		this.miniSize = {
			x: 0,
			w: 32,
			y: 0,
			h: 16
		};
		
		// to cancel the power down
		this.timer = -1;
		this.isPaddle = true;
		this.powerDownLength = 10; // sec

		this.type = "paddle";
		
		this.addAnimation("idle", [16]);
		this.addAnimation("mini", [20]);
		this.setCurrentAnimation("idle");
				
		this.collidable = true;
		
		// some "optimization" to avoid traversing 
		// these whole objects on each update
		this.mousePos = me.input.mouse.pos;
		this.viewportWidth = me.game.viewport.width;
	},

	update: function() {
		this.pos.x = (this.mousePos.x - this.collisionBox.hWidth).clamp(0, this.viewportWidth - this.collisionBox.width);
		
		// check if we have a timer active
		if (this.timer!==-1 && (me.timer.getTime() - this.timer) >= (this.powerDownLength * 1000)) {
			// restore the normal paddle
			this.onPowerDownEnd();
		}
		
		// return true if we moved
		return true;
	},
	
	onPowerUp: function() {
		// add a new ball
		var ball = new EntityBall(50, me.game.viewport.height/2, {});
		ball.active = true;
		me.game.add(ball, this.z);
		me.game.sort();
	},
	
	
	onPowerDown: function() {
		if (this.isCurrentAnimation('idle')) {
			this.setCurrentAnimation("mini");
			// adjust the bounding box
			this.updateColRect(this.miniSize.x,this.miniSize.w,this.miniSize.y,this.miniSize.h);
			this.timer = me.timer.getTime()
		}
	},
	
	onPowerDownEnd: function() {
		if (this.isCurrentAnimation('mini')) {
			this.timer = -1;
			this.setCurrentAnimation("idle");
			// adjust the bounding box
			this.updateColRect(this.fullSize.x,this.fullSize.w,this.fullSize.y,this.fullSize.h);
			me.audio.play('recover');
		}
	}
});

