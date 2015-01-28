EntityPowerDown = me.Entity.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = "tiles16";
        settings.width = 16;
        settings.height = 16;
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.name = 'power-down';
        this._super(me.Entity, "init", [x, y, settings]);

        this.renderable.addAnimation('idle', [79]);
        this.renderable.setCurrentAnimation('idle');

        this.collidable = true;
        this.body.addShape(new me.Rect(0 ,0, settings.width, settings.height));
        this.body.vel.x = 0;
        this.body.vel.y = 80 / me.sys.fps;
    },

    onCollision: function(response) {
        var obj = response.b;
        if (obj.type === 'paddle') {
            this.collidable = false;
            me.audio.play('powerdown');
            obj.onPowerDown();
            me.game.world.removeChild(this);
        }
    },

    update: function(dt) {
        this.pos.y += this.body.vel.y;
        if(this.pos.y > me.game.viewport.height) {
            me.game.world.removeChild(this);
            return false;
        }
        me.collision.check(this);
        this.updateBounds();
        this._super(me.Entity, "update", [dt]);
        return true;
    }
});
