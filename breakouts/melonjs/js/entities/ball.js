/**
 * a ball entity
 */
EntityBall = me.Entity.extend({
    init: function(x, y) {
        var settings = {};
        // define this here instead of tiled
        settings.image = "tiles16";
        settings.width = 16;
        settings.height = 16;
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this._super(me.Entity, 'init', [x, y, settings]);

        // ensure the 'name' property is defined
        // since ball entities can also be added manually
        this.name = 'ball';

        this.renderable.addAnimation('idle', [51, 52, 53, 54, 55]);
        this.renderable.setCurrentAnimation('idle');

        this.speed = 3;

        this.type = "ball";

        this.active = false;

        this.body.vel.set(this.speed, this.speed);
        this.prevVel = this.body.vel.clone();
        this.prev = this.body.pos.clone();

        // some "optimization" to avoid traversing
        // the whole object on each update
        this.viewportHeight = me.game.viewport.height - this.renderable.height;

        // add a circle collision shape as balls are created manually
        this.body.addShape(new me.Ellipse(0, 0, 16, 16));
    },

    update: function(dt) {
        if (!this.active) {
            return false;
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // this is workaround for
        // the engine not implementing
        // bounciness
        this.prevVel.setV(this.body.vel);
        this.prev.setV(this.pos);

        // check if we miss the paddle and went out
        if (this.pos.y > this.viewportHeight) {
            // force immediate object destruction (true parameter)
            me.game.world.removeChildNow(this);
            me.state.current().onBallDeath();
            return true;
        }
        // handle collisions against other shapes
        me.collision.check(this);

        return true;
    },

     /**
     * colision handler
     */
    onCollision : function (response, other) {
        switch (other.type) {
            // hit the walls
            case '':
            case 'brick':
                if (response.overlapV.y !== 0) {
                    this.body.vel.y *= -1;
                } else if (response.overlapV.x !== 0) {
                    this.body.vel.x *= -1;
                }
                return false;
                break;

            case 'paddle':
                if (response.overlapV.y !== 0 && (~~this.body.vel.y >= ~~response.overlapV.y)) {
                    this.body.vel.y *= -1;
                } else if (response.overlapV.x !== 0) {
                    this.body.vel.x *= -1;
                }

                return false;
                break;
            default:
                // Do not respond to other objects
                return false;
        }

        // Make the object solid
        return true;
    }
});
