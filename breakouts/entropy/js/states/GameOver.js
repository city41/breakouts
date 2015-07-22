Entropy.State({
    name: 'GameOver',
    enter: function (game, done) {
        fadeInScreen('.gameover-screen', function () {
            return done();
        })
    },
    exit: function (game, done) {
        fadeOutScreen('.gameover-screen', function () {
            return done();
        })
    }
})