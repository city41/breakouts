Entropy.Entity({
    name: "Player",
    create: function (game) {
        var livesTextNode = new PIXI.Text('life:3', {
            font: "9pt 'Press Start 2P'"
        });
        var scoreTextNode = new PIXI.Text('score:0000', {
            font: "9pt 'Press Start 2P'"
        });

        var levelTextNode = new PIXI.Text('lvl:1', {
            font: "9pt 'Press Start 2P'"
        });

        livesTextNode.position.x = -14;
        livesTextNode.position.y = -18.7;
        livesTextNode.scale.y = -1 / Entropy.ZOOM;
        livesTextNode.scale.x = 1 / Entropy.ZOOM;

        scoreTextNode.position.x = -5;
        scoreTextNode.position.y = -18.7;
        scoreTextNode.scale.y = -1 / Entropy.ZOOM;
        scoreTextNode.scale.x = 1 / Entropy.ZOOM * 0.95;

        levelTextNode.position.x = 7.8;
        levelTextNode.position.y = -18.7;
        levelTextNode.scale.y = -1 / Entropy.ZOOM;
        levelTextNode.scale.x = 1 / Entropy.ZOOM * 0.95;

        game.stage.addChild(livesTextNode)
        game.stage.addChild(scoreTextNode)
        game.stage.addChild(levelTextNode)

        this.add("Stats", 3, livesTextNode, scoreTextNode, levelTextNode);
    },
    remove: function (game) {
        game.stage.removeChild(this.components.playerstats.livesTextNode);
        game.stage.removeChild(this.components.playerstats.scoreTextNode);
    }
});