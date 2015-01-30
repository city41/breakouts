EntityCountdown = me.Entity.extend({
	init: function(x, y, settings) {
		// define this here instead of tiled
		settings.image = "tiles16";
		settings.width = 32;
		settings.height = 48;
		settings.spritewidth = 32;
		settings.spriteheight = 48;
		settings.name = 'countdown';
        this._super(me.Entity, 'init', [x, y, settings]);

		this.lastFrame = -1;

		// sync the animation with the fps (1 sec)
		this.renderable.addAnimation('idle', [12, 13, 14], 1000);
		this.renderable.setCurrentAnimation('idle', (function(){
			me.game.world.removeChildNow(this);
		}).bind(this));

		// center it
        this.pos.set(
            me.game.viewport.width / 2 - this.width / 2,
            me.game.viewport.height / 2 - this.height / 2
        );
        this.updateBounds();

	},

	update: function(dt) {
        this._super(me.Entity, 'update', [dt]);
		if (this.renderable) {
			if(this.renderable.getCurrentAnimationFrame() != this.lastFrame) {
				me.audio.play('countdownblip', false, null, 0.3);
			}
			this.lastFrame = this.renderable.getCurrentAnimationFrame();
		}
		return true;
	},

	onDeactivateEvent: function() {
		// launch the ball !
		if (game.ball) {
			game.ball.active = true;
		}
	}
});

