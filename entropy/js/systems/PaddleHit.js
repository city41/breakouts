 Entropy.System({
    name: "PaddleHit",
    initialize: function () {
        this.game.world.on('beginContact', this.handlePaddleHit);
    },
    handlePaddleHit: function (e) {
        if (e.bodyA.entId === 'ball' && e.bodyB.entId === 'paddle') {
            var ball = e.bodyA;
            var paddle = e.bodyB;
        } else if(e.bodyA.entId === 'paddle' && e.bodyB.entId === 'ball') {
            var ball = e.bodyB;
            var paddle = e.bodyA;
        } else {
            return;
        }

        if (e.contactEquations[0].normalA[1] !== -1) {
            return;
        }

        var currentVelocity = p2.vec2.length(ball.velocity);
        var newVelocity = p2.vec2.create();

        p2.vec2.copy(newVelocity, e.contactEquations[0].contactPointB);
        p2.vec2.add(newVelocity, newVelocity, [0, 1])
        p2.vec2.normalize(newVelocity, newVelocity);

        var coeficient = 1;
        var angle = Math.atan2(newVelocity[1], newVelocity[0]);

        var halfCircleChunk = Math.PI / 8;

        if (angle > 6 * halfCircleChunk || angle < 2 * halfCircleChunk) {
            coeficient = 1.1;
        } else if (angle > 5 * halfCircleChunk || angle < 3 * halfCircleChunk) {
            coeficient = 1.05;
        } else if (angle < 5 * halfCircleChunk && angle > 3 * halfCircleChunk) {
            coeficient = 0.95;
        }

        p2.vec2.scale(newVelocity, newVelocity, clamp(currentVelocity * coeficient, 11, 16))

        ball.velocity = newVelocity;
    },
    update: function (delta, event) {},
    remove: function () {
        this.game.world.off('beginContact', this.handlePaddleHit);
    }
})