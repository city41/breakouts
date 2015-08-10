Entropy.Entity({
    name: "Ball",
    create: function (game, x, y, vx, vy, material) {
        var frames = [1, 2, 3, 4, 5].map(function (num) {
            return new Entropy.Frame(PIXI.utils.TextureCache['ball_0' + num + '.png'])
        })

        var body = new p2.Body({
            mass: 1,
            position: [x, y],
            angle: 0,
            velocity: [vx, vy],
            angularVelocity: 0,
            damping: 0,
            angularDamping: 0
        });

        body.entId = "ball";
        
        var ballShape = new p2.Circle({
            radius: 0.8
        });

        ballShape.material = game.materials.ballMaterial;

        body.addShape(ballShape);
        game.world.addBody(body);

        var animation = new Entropy.Animation(frames, 20, true);
    
        var sprite = animation.getAnimationSprite();

        sprite.position.x = x;
        sprite.position.y = y;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scale.y = -1 / Entropy.ZOOM;
        sprite.scale.x = 1 / Entropy.ZOOM;

        game.stage.addChild(sprite);

        animation.play();

        this.add("Sprite", sprite)
            .add("Animation", animation)
            .add("Body", body);
    },
    remove: function (game) {
        game.world.removeBody(this.components.body.body);
        game.stage.removeChild(this.components.sprite.sprite);
    }
});