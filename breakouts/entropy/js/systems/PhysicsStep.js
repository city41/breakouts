 Entropy.System({
    name: "PhysicsStep",
    update: function (delta, event) {
        this.game.world.step(1/60, delta, 2);
    }
});