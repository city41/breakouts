 Entropy.System({
    name: "AnimationUpdater",
    initialize: function () {
        this.query = new Entropy.Query(['Animation']);
    },
    update: function (delta, event) {
        var animations = this.engine.getEntities(this.query);
        var e;

        var i = 0;

        while (e = animations[i]) {
            e.components.animation.animation.update(delta);
           
            i++;
        }
    }
});