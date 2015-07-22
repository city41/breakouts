 Entropy.System({
    name: "BlockHit",
    initialize: function () {
        var blocksQuery = new Entropy.Query({
            name: "Block"
        });

        var playerQuery = new Entropy.Query({
            name: "Player"
        })

        var self = this;
        var game = this.game;

        var handleBlockHit = function (e) {
            if (e.bodyA.entId === 'ball' && e.bodyB.entId === 'block') {
                var ball = e.bodyA;
                var blockBody = e.bodyB;
            } else if(e.bodyA.entId === 'block' && e.bodyB.entId === 'ball') {
                var ball = e.bodyB;
                var blockBody = e.bodyA;
            } else {
                return;
            }


            if (blockBody.collisionResponse === false) {
                return;
            }

            var e, block;
            var player = self.engine.getOne(playerQuery);
            var blocks = self.engine.getEntities(blocksQuery);
            var blocksLength = blocksQuery.entitiesLength;
            var i = 0;

            while (e = blocks[i]) {
                if (e.components.body.body === blockBody) {
                    block = e;
                    
                    break;
                }

                i++;
            }

            if (block == null) {
                return;
            }

            var animation = block.components.animation.animation;

            player.components.stats.score += 100;
            player.components.stats.scoreTextNode.text = 'score:' + pad(player.components.stats.score, 4);

            blockBody.collisionResponse = false;
            
            game.sounds.brickDeath.play();
            animation.play();

            animation.once('end', function () {
                //we have removed the last block
                if (blocksLength === 1) {
                    var nextLevel = ++player.components.stats.level;

                    if (nextLevel <= 2) {
                        self.engine.addSystem(['InitializeLevel', 0], nextLevel);
                    } else {
                        self.engine.clear();

                        self.engine.once('cleared', function () {
                            self.game.stop();
                            self.game.state.change('GameOver');
                        })
                    }
                }

                self.engine.remove(block);
            })
        }

        this.handleBlockHit = handleBlockHit;
        this.game.world.on('beginContact', handleBlockHit);
    },
    update: function (delta, event) {
    
    },
    remove: function () {
        this.game.world.off('beginContact', this.handleBlockHit);
    }
})