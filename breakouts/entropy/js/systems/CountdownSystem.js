 Entropy.System({
    name: "CountdownSystem",
    initialize: function () {
        this.counterQuery = new Entropy.Query({
            name: "Counter"
        });

        this.hasRun = false;
    },
    update: function (delta, event) {
        if (this.hasRun) {
            return;
        }

        var counter = this.engine.getEntities(this.counterQuery)[0];
        var animation = counter.components.animation.animation;

        animation.on('end', function () {
            this.engine.remove(counter);
            this.engine.addSystem('PhysicsStep');
            this.engine.removeSystem(this);
        }, this);

        animation.play();

        this.hasRun = true;
    }
})