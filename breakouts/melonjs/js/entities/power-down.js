EntityPowerDown = me.Entity.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = "tiles16";
        settings.width = 16;
        settings.height = 16;
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.name = 'power-down';
        this._super(me.Entity, 'init', [x, y, settings]);

        this.renderable.addAnimation('idle', [79]);
        this.renderable.setCurrentAnimation('idle');

        this.collidable = true;
        this.body.vel.set(0, 80 / me.timer.fps);
        this.body.addShape(new me.Rect(0, 0, 16, 16));
    },

    shouldCollide: function(a, b) {
        console.log(a, b);
        if (b.type == 'ball') {
            return false;
        }
        return true;
    },

    onCollision: function(res, other) {
        if (other.type == 'paddle') {
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
            other.onPowerDown();
            me.audio.play('powerdown');
            me.game.world.removeChild(this);
        }
        return false;
    },

    update: function(dt) {
        this.pos.y += this.body.vel.y;
        this.updateBounds();
        if(this.pos.y > me.game.viewport.height) {
            me.game.world.removeChild(this);
            return false;
        }

        // check for collision with the paddle
        me.collision.check(this);
        this._super(me.Entity, "update", [dt]);
        return true;
    }
});
