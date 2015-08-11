 Entropy.System({
    name: "SpriteBodyUpdater",
    initialize: function () {
        this.query = new Entropy.Query(["Sprite", "Body"]);
    },
    update: function (delta, event) {
        var renderableBodies = this.engine.getEntities(this.query);
        var e;
        
        var i = 0;
        while (e = renderableBodies[i]) {
            var sprite = e.components.sprite.sprite;
            var body = e.components.body.body;

            sprite.position.x = body.position[0];
            sprite.position.y = body.position[1];

            i++;
        }
    }
});