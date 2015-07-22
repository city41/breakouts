Entropy.State({
    name: 'Initialize',
    initialize: function (game, done) {
        Entropy.Const("WIDTH", 320);
        Entropy.Const("HEIGHT", 416);
        Entropy.Const("ZOOM", 10);

        var view = document.querySelector('.game-canvas');

        var renderer = new PIXI.autoDetectRenderer(Entropy.WIDTH, Entropy.HEIGHT, {
            view: view,
            transparent: true,
            antialias: false
        });

        var scene = new PIXI.Container();
        var stage = new PIXI.Container();

        scene.addChild(stage);

        stage.position.x = Entropy.WIDTH / 2;
        stage.position.y = Entropy.HEIGHT / 2;

        stage.scale.x = Entropy.ZOOM;
        stage.scale.y = -Entropy.ZOOM;

        stage.interactive = true;

        game.input = {};

       

        var world = new p2.World({
            gravity: [0, 0]
        });

        game.renderer = renderer;
        game.stage = stage;
        game.world = world;

        game.state.change('Menu');

        return done();
    }
})