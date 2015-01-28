/**
 * a ball entity
 */
EntityBall = me.Entity.extend({
    init: function(x, y) {
        var settings = {};
        // define this here instead of tiled
        settings.image = me.loader.getImage("tiles16");
        settings.width = 16;
        settings.height = 16;
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this._super(me.Entity, "init", [x, y, settings]);

        // ensure the 'name' property is defined
        // since ball entities can also be added manually
        this.name = 'ball';
        this.renderable.addAnimation('idle', [51, 52, 53, 54, 55]);
        this.renderable.setCurrentAnimation('idle');
        this.speed = Math.round(170 / me.sys.fps);
        this.type = "ball";
        this.active = false;

        this.body.setVelocity(this.speed, this.speed);
        this.prevVel = this.body.vel.clone();
        this.prev = this.pos.clone();

        // some "optimization" to avoid traversing
        // the whole object on each update
        this.viewportHeight = me.game.viewport.height - this.renderable.height;

        // a cache rectangle for the paddle bounds
        this.cacheBounds = new me.Rect(0, 0, 0 ,0);

    },

    onCollision: function(res, other) {
        var obj = res.b;
        if (res) {
            if (res.y !== 0) {
                this.pos.y = this.prev.y;
                this.body.vel.y = -this.prevVel.y;
            }
            if (res.x !== 0) {
                this.pos.x = this.prev.x;
                this.body.vel.x = -this.prevVel.x;
            }
            if (obj.isPaddle) {
                if (res.y !== 0) {
                    this.body.vel.x = this._determineBounceVelocity(obj);
                    this.body.vel.y *= - 1;
                } else if (res.x !== 0) {
                    this.body.vel.x *= - 1;
                }
            } else if (obj.type === 'brick') {

                var dx = obj.pos.x - this.pos.x;
                if (this.hWidth < obj.hWidth) {
                    dx -= this.width;
                } else {
                    dx += obj.width;
                }

                var dy = obj.pos.y - this.pos.y;
                if (this.hHeight < obj.hHeight) {
                    dy -= this.height;
                } else {
                    dy += obj.height;
                }

                if (Math.abs(dx) < Math.abs(dy)) {
                    this.pos.x = this.prev.x;
                    this.body.vel.x *= -1;
                } else {
                    this.pos.y = this.prev.y;
                    this.body.vel.y *= -1;
                }
            }
        }
    },

    update: function(dt) {

        if (!this.active) {
            return false;
        }

        // update the ball animation
        this.updateBounds();
        this._super(me.Entity, "update", [dt]);
        this.body.update(dt);
        // this is workaround for
        // the engine not implementing
        // bounciness
        this.prevVel.setV(this.body.vel);
        this.prev.setV(this.pos);

        me.collision.check(this);
        // check for collision with the wall
        // check if we miss the paddle and went out
        if (this.pos.y > this.viewportHeight) {
            // force immediate object destruction (true parameter)
            me.game.world.removeChildNow(this);
            me.state.current().onBallDeath();
            return true;
        }
        return true;
    },

    _determineBounceVelocity: function(paddle) {
        // check for distance to the paddle

        this.cacheBounds = paddle.getBounds(this.cacheBounds).translateV(paddle.pos);
        var distance = this.distanceTo(paddle) - this.hHeight - this.cacheBounds.hHeight;
        var ratio = distance / this.cacheBounds.hWidth * 2.5;

        if((this.pos.x + this.hWidth) < (this.cacheBounds.pos.x + this.cacheBounds.hWidth)) {
            // send the ball to the left if hit on the left side of the paddle, and vice versa
            ratio = -ratio;
        }
        return (this.speed * ratio);
    }
});

