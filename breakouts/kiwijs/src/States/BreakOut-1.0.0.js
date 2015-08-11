var BreakOutState = new Kiwi.State('BreakOutState');

/**
* The BreakOutState in the core state that is used in the game.
*
* It is the state where the majority of the functionality occurs 'in-game'.
*
*
* @class BreakOutState
* @extends State
* @constructor
*/

/**
* This create method is executed when Kiwi Game reaches the boot stage of the game loop.
* @method create
* @public
*/
BreakOutState.create = function () {
    //hide the mouse
    this.game.stage.canvas.style.cursor = 'none';

    this.setLevelData();

    //audio
    this.brickDeathSFX = new Kiwi.Sound.Audio(this.game, 'brickDeath', 1, false);
    this.countdownBlipSFX = new Kiwi.Sound.Audio(this.game, 'countdownBlip', 1, false);
    this.powerdownSFX = new Kiwi.Sound.Audio(this.game, 'powerdown', 1, false);
    this.powerupSFX = new Kiwi.Sound.Audio(this.game, 'powerup', 1, false);
    this.recoverSFX = new Kiwi.Sound.Audio(this.game, 'recover', 1, false);

    //game vars
    this.score = 0;
    this.level = 0;

    //starting ball position
    this.ballX = 50;
    this.ballY = 240;

    this.paddleWidth = 48;

    //half paddle and ball width
    this.hp = 24;
    this.hb = 16;

    //power down vars
    this.powerDown = false;
    this.downTime = 0;

    //bg
    this.bg = new Kiwi.GameObjects.Sprite(this, this.textures.bg);
    this.addChild(this.bg);

    this.bricksLeft = 0;
    this.bricks = new Kiwi.Group(this);
    this.addChild(this.bricks);

    //paddle
    this.paddle = new Kiwi.GameObjects.Sprite(this, this.textures.tiles, 0, 368);
    this.paddle.animation.switchTo(24);
    this.addChild(this.paddle);

    //ball
    this.balls = new Kiwi.Group(this);
    this.addChild(this.balls);

    this.items = new Kiwi.Group(this);
    this.addChild(this.items);

    this.initStage(this.level);

    this.score = 0;
    this.lives = 3;

    this.setHUD();

}

/**
* This method generates all the textfields used in the HUD layer
* @method setHUD
* @public
*/
BreakOutState.setHUD = function () {
    //UI
    this.scoreTF = new Kiwi.HUD.Widget.TextField(this.game, "score: " + this.score, 30, 390);
    this.scoreTF.style.color = "#000000";
    this.scoreTF.style.fontSize = "18px";
    this.scoreTF.style.fontFamily = "Arial, Helvetica, sans-serif"
    this.game.huds.defaultHUD.addWidget(this.scoreTF);

    this.livesTF = new Kiwi.HUD.Widget.TextField(this.game, "lives: " + this.lives, 130, 390);
    this.livesTF.style.color = "#000000";
    this.livesTF.style.fontSize = "18px";
    this.livesTF.style.fontFamily = "Arial, Helvetica, sans-serif"
    this.game.huds.defaultHUD.addWidget(this.livesTF);

    this.levelTF = new Kiwi.HUD.Widget.TextField(this.game, "level: " + (this.level + 1), 220, 390);
    this.levelTF.style.color = "#000000";
    this.levelTF.style.fontSize = "18px";
    this.levelTF.style.fontFamily = "Arial, Helvetica, sans-serif"
    this.game.huds.defaultHUD.addWidget(this.levelTF);
}

/**
* This method generates all the game map data
* @method setLevelData
* @public
*/
BreakOutState.setLevelData = function () {
    var X = 0;
    var b = 1;
    var o = 2;
    var r = 3;
    var g = 4;

    this.levels = [
        {
            name: "letsa begin",
            bricks: [
                [X,X,g,o,g,X,X],
                [o,b,g,g,g,b,o],
                [X,b,b,b,b,b,X]
            ]
        },
        {
            name: "how's it going?",
            bricks: [
                [X, g, o, g, o, g, X],
                [X, b, b, b, b, b, X],
                [g, b, r, b, r, b, g],
                [g, b, b, b, b, b, g],
                [g, b, X, X, X, b, g],
                [X, b, b, b, b, b, X]
            ]
        },
        {
            name: 'tie fighta!',
            bricks: [
                [X, b, X, g, X, b, X],
                [b, X, b, o, b, X, b],
                [b, g, b, o, b, g, b],
                [b, X, b, o, b, X, b],
                [X, b, X, X, X, b, X],
                [r, X, r, X, r, X, r]
            ]
        },
        {
            name: 'swirl',
            bricks: [
                [r, g, o, b, r, g, o],
                [b, X, X, X, X, X, X],
                [o, X, o, b, r, g, o],
                [g, X, g, X, X, X, b],
                [r, X, r, X, r, X, r],
                [b, X, b, o, g, X, g],
                [o, X, X, X, X, X, o],
                [g, r, b, o, g, r, b]
            ]
        }
    ];
}

/**
* This method initates the game play
* @method initStage
* @public
*/
BreakOutState.initStage = function (num, options) {
    //game complete, show a victorious victor page. So rewarding.
    if (num >= this.levels.length - 1) {
        this.game.huds.defaultHUD.removeWidget(this.scoreTF);
        this.game.huds.defaultHUD.removeWidget(this.livesTF);
        this.game.huds.defaultHUD.removeWidget(this.levelTF);
        game.states.switchState('GameCompleteState');
        return;
    }

    this.level = num;
    this.playing = false;

    //tiles

    if (!options || options.resetTiles !== false) {
        this.buildTiles();
    }

    //add initial ball
    this.addBall();

    this.setBigPaddle();

    //starting countdown
    this.countdown = new Kiwi.GameObjects.Sprite(this, this.textures.tiles, 140, 200);
    this.countdown.animation.switchTo('countdown', true);
    this.addChild(this.countdown);
    this.countdown.animation.onUpdate.add(this.playCountdownSFX, this);
    this.countdown.animation.onStop.add(this.startPlay, this);
    this.playCountdownSFX();
}

/**
* This method plays the countdown blip sfx
* @method playCountdownSFX
* @public
*/
BreakOutState.playCountdownSFX = function () {
    this.countdownBlipSFX.play();
}

/**
* This method places the bricks on the stage
* @method buildTiles
* @public
*/
BreakOutState.buildTiles = function () {
    var brickX = 48;
    var brickY = 64;
    var brickWidth = 32;
    var brickHeight = 16;
    var map = this.levels[this.level].bricks;

    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[0].length; j++) {
            var num = map[i][j];
            if (num > 0) {
                var brick = new PhysicsSprite(this, this.textures.tiles, brickX + (j * brickWidth), brickY + (i * brickHeight));
                brick.animation.switchTo("tile" + num);
                brick.hittable = true;
                //making sure the bricks don't move
                brick.physics.moves = false;
                brick.physics.elasticity = 100;
                brick.physics.mass = 0;
                this.bricks.addChild(brick);
                this.bricksLeft++;
            }
        }
    }

}

/**
* This method adds a new ball to the stage
* @method addBall
* @public
*/
BreakOutState.addBall = function () {
    var ball = new PhysicsSprite(this, this.textures.tiles, this.ballX, this.ballY);
    ball.animation.switchTo('ball', true);
    ball.velX = 30;
    ball.velY = 30;
    if (this.playing) {
        ball.physics.velocity.x = ball.velX;
        ball.physics.velocity.y = ball.velY;
    }
    this.balls.addChild(ball);
}

BreakOutState.addPowerUp = function (x, y) {
    var powerUp = new PhysicsSprite(this, this.textures.tiles, x + 8, y);
    powerUp.animation.switchTo(34);
    powerUp.type = 1;
    powerUp.physics.solid = false;
    powerUp.physics.velocity.y = 30;
    this.items.addChild(powerUp);
}

BreakOutState.addPowerDown = function (x, y) {
    var powerDown = new PhysicsSprite(this, this.textures.tiles, x + 8, y);
    powerDown.animation.switchTo(35);
    powerDown.type = 2;
    powerDown.physics.solid = false;
    powerDown.physics.velocity.y = 30;
    this.items.addChild(powerDown);
}

BreakOutState.startPlay = function () {
    this.countdown.destroy();
    this.playing = true;
    for (var i = 0; i < this.balls.members.length; i++) {
        var b = this.balls.members[i];
        b.physics.velocity.x = b.velX;
        b.physics.velocity.y = b.velY;
    }
}

/**
* This method is the main update loop. Move scrolling items and update player here
* @method update
* @public
*/
BreakOutState.update = function () {
    Kiwi.State.prototype.update.call(this);

    this.paddle.x = this.game.input.x - this.paddleWidth / 2;

    if (!this.playing) return;

    //balls
    if (this.balls.members.length > 0) {
        for (var i = 0; i < this.balls.members.length; i++) {
            this.updateBall(this.balls.members[i]);
        }
    } else {
        this.failStage();
    }

    //bricks
    if (this.bricks.members.length == 0) {
        this.passStage();
    }

    //items
    for (var i = 0; i < this.items.members.length; i++) {
        this.updateItem(this.items.members[i]);
    }

    if (this.powerDown) {
        if (this.game.time.clock.elapsed() - this.downTime >= 10) {
            this.setBigPaddle();
            this.recoverSFX.play();
        }
    }
}

//move collectable item
BreakOutState.updateItem = function (item) {
    if (item.physics.overlaps(this.paddle, false)) {
        this.collectItem(item);
    }
    if (item.y > this.game.stage.height) {
        item.destroy();
    }
}

BreakOutState.collectItem = function(item){
    if (item.type == 1) {
        this.addBall();
        this.powerupSFX.play();
    } else {
        this.setLittlePaddle();
    }
    item.destroy();
}

//replace big paddle with mini version for 10 seconds
BreakOutState.setLittlePaddle = function () {
    this.downTime = this.game.time.clock.elapsed();
    this.powerDown = true;
    var prevPaddle = this.paddle;
    this.paddle.destroy();

    this.paddleWidth = 32;

    this.paddle = new Kiwi.GameObjects.Sprite(this, this.textures.tiles, this.game.input.x - this.paddleWidth / 2, 368);
    this.paddle.animation.switchTo(30);
    this.addChild(this.paddle);

    this.powerdownSFX.play();
}

//place big paddle
BreakOutState.setBigPaddle = function () {
    this.powerDown = false;

    this.paddle.destroy();

    this.paddleWidth = 48;

    this.paddle = new Kiwi.GameObjects.Sprite(this, this.textures.tiles, this.game.input.x - this.paddleWidth / 2, 368);
    this.paddle.animation.switchTo(24);
    this.addChild(this.paddle);
}

//move ball
BreakOutState.updateBall = function (ball) {
    //check walls and paddle collisions
    if (ball.physics.velocity.y < 0) {
        //check top wall
        if (ball.y <= 16) {
            ball.y = 16;
            ball.physics.velocity.y *= -1;
        }
    } else {
        //moving downward, check paddle collision
        if (ball.y >= this.paddle.y - ball.height) {
            //check to see if y position is on paddle
            if (ball.y <= this.paddle.y - ball.height + this.paddle.height / 2) {
                //in the right y position
                if (ball.x >= this.paddle.x - ball.width && ball.x <= this.paddle.x + this.paddleWidth) {
                    //new direction based on where you hit the paddle
                    var centreDiff = ball.x - (this.paddle.x + this.hp - this.hb);
                    ball.physics.velocity.x = centreDiff;
                    ball.physics.velocity.y = -((this.paddleWidth + 16) - Math.abs(ball.physics.velocity.x));
                }
            }
        }
        if (ball.y > this.game.stage.height) {
            this.killBall(ball);
            return;
        }
    }
    if (ball.physics.velocity.x < 0) {
        //check left wall
        if (ball.x <= 16) {
            ball.x = 16;
            ball.physics.velocity.x = Math.abs(ball.physics.velocity.x);
        }
    } else {
        //320( = 284
        if (ball.x >= 284) {
            ball.x = 284;
            ball.physics.velocity.x = -Math.abs(ball.physics.velocity.x);
        }
    }

    ball.hitX = false;
    ball.hitY = false;
    ball.hitBrick = false;

    //check ball/brick collisions
    for (var i = 0; i < this.bricks.members.length; i++) {
        var brick = this.bricks.members[i];
        if (ball.physics.overlaps(brick, false) && brick.hittable) {
            this.hitBrick(brick, ball);
        }
    }

    if (ball.hitBrick) {
        if (ball.hitX){
            ball.physics.velocity.x *= -1;
        }
        if (ball.hitY) {
            ball.physics.velocity.y *= -1;
        }
        if (!ball.hitX && !ball.hitY) {
            ball.physics.velocity.x *= -1;
            ball.physics.velocity.y *= -1;
        }
        //play hit audio
        this.brickDeathSFX.play();
    }

}

BreakOutState.killBall = function(ball){
    ball.destroy();
}

BreakOutState.hitBrick = function (brick, ball) {
    ball.hitBrick = true;
    var bw = ball.width;
    //check up/down
    if ((ball.x + bw - ball.physics.velocity.x) >= brick.x && (ball.x - ball.physics.velocity.x) <= brick.x + brick.width) {
        ball.hitY = true;
    }
    if ((ball.y + bw - ball.physics.velocity.y) >= brick.y && (ball.y - ball.physics.velocity.y) <= brick.y + brick.height) {
        ball.hitX = true;
    }

    this.score += 10;
    this.scoreTF.text = 'score: ' + this.score;

    brick.hittable = false;
    brick.animation.play();
    brick.animation.onStop.add(this.destroyBrick, brick);
}

//this = brick
BreakOutState.destroyBrick = function () {
    var r = Math.random() * 10;
    if (r > 9) {
        BreakOutState.addPowerUp(this.x, this.y);
    } else if (r < 1) {
        BreakOutState.addPowerDown(this.x, this.y);
    }
    this.destroy();
}

BreakOutState.passStage = function () {
    this.playing = false;
    this.level++;
    this.score += 1000;
    this.scoreTF.text = 'score: ' + this.score;
    this.levelTF.text = 'level: ' + (this.level + 1);
    this.removeGameContent();
    this.initStage(this.level);
}

BreakOutState.failStage = function () {
    this.playing = false;
    this.lives--;
    this.livesTF.text = 'lives: ' + this.lives;
    this.removeGameContent();
    if (this.lives == 0) {
        //game over
        this.game.huds.defaultHUD.removeWidget(this.scoreTF);
        this.game.huds.defaultHUD.removeWidget(this.livesTF);
        this.game.huds.defaultHUD.removeWidget(this.levelTF);
        game.states.switchState('GameOverState');
    } else {
        //restart
        this.initStage(this.level, { resetTiles: false });
    }
}

BreakOutState.removeGameContent = function () {
    for (var i = this.balls.members.length - 1; i >= 0; i--) {
        this.killBall(this.balls.members[i]);
    }

    for (var i = this.items.members.length - 1; i >= 0; i--) {
        this.items.members[i].destroy();
    }
}
