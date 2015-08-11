Entropy.System({
    name: "BallDeathChecker",
    initialize: function () {
        this.query = new Entropy.Query({
            name: "Ball"
        });

        this.playerQuery = new Entropy.Query({
            name: "Player"
        })
    },
    update: function (delta, event) {
        var balls = this.engine.getEntities(this.query);
        var player = this.engine.getOne(this.playerQuery);

        var lostBalls = 0;
        var totalBalls = 0;

        var e;
        var i = 0;

        while (e = balls[i]) {
            if (e.components.body.body.position[1] < -22) {
                this.engine.remove(e);
                lostBalls++;
            }
           
            i++;
        }

        if (lostBalls === i && i !== 0) {
            player.components.stats.lives--;

            if (player.components.stats.lives === -1) {
                this.engine.clear();

                this.engine.once('cleared', function () {
                    this.game.stop();
                    this.game.state.change('GameOver');
                }, this)
            } else {
                player.components.stats.livesTextNode.text = 'life:' + player.components.stats.lives;

                this.engine.create('Ball', -8, 0, 11, -11);
                this.engine.create('Counter');

                this.engine.addSystem('CountdownSystem');               
                this.engine.removeSystem('PhysicsStep');
            }
        }
    }
});