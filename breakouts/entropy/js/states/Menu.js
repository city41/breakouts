Entropy.State({
    name: 'Menu',
    initialize: function (game, done) {
        this.menuScreen = document.querySelector('.menu-screen');

        return done();
    },
    enter: function (game, done) {
        var self = this;

        this.startGameHandler = function (e) {
            game.state.change('Gameplay');
        }

        this.menuScreen.addEventListener('click', this.startGameHandler)
        
        fadeInScreen('.menu-screen', function () {
            return done();
        })
    },
    exit: function (game, done) {
        var self = this;

        this.menuScreen.removeEventListener('click', this.startGameHandler)

        fadeOutScreen('.menu-screen', function () {
            return done();
        })
    }
})