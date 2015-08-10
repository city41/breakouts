Entropy.System({
    name: "LevelChanger",
    initialize: function () {
        var self = this;

        var playerQuery = new Entropy.Query({
            name: "Player"
        })

        this.handleLevelChange = function (e) {
            var player = self.engine.getOne(playerQuery);

            if (!player || !player.components || !player.components.stats) {
                return;
            }

            var newLevel;

            if (e.keyCode === 37) { //prev
                newLevel = player.components.stats.level - 1;

                if (newLevel < 1) {
                    return;
                }
            } else if (e.keyCode === 39) { //next
                newLevel = player.components.stats.level + 1;

                if (newLevel > 2) {
                    return;
                }
            } else {
                return;
            }

            player.components.stats.level = newLevel;
            self.engine.addSystem('InitializeLevel', newLevel);
        }

        window.addEventListener('keyup', this.handleLevelChange);
    },
    update: function (delta, event) {},
    remove: function () {
        window.removeEventListener('keyup', this.handleLevelChange);
    }
});