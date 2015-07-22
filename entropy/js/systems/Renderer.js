Entropy.System({
    name: "Renderer",
    initialize: function () {
        this.stage = this.game.stage;
        this.renderer = this.game.renderer;
    },
    update: function (delta, event) {
        this.renderer.render(this.stage);
    }
});