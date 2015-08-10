BasicGame.Game = function (game) {

    //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

    this.debug = false;

    this.brickDeath = null;
    this.countdownBlip = null;
    this.powerdown = null;
    this.powerup = null;
    this.recover = null;

    this.countDown;
    this.countDownTime = 3;
    this.countDownTimeElapsed = 0;
    this.countDownInitialX = 140;
    this.countDownInitialY = 200;
    this.isCountDownOff = false;
    this.countDownTimeInterval = 1000;

    this.countDownsecondTick = 1;

    this.paddle;
    this.paddleDefaultWidth = 48;
    this.paddleSmallWidth = 32;
    this.paddleSpeed = 200;

    this.paddleInitialX = 0;
    this.paddleInitialY = 368;

    this.dropItemLimit = 3;
    this.isPaddleNerfed = false;
    this.paddleNerfTime = 6000;
    this.recoverTimeout = null;

    this.balls;
    this.ballsCount = 0;
    this.bricks;
    this.items;
    this.bricksWithItems = [];

    this.scorePerBrick = 100;
    this.scorePerLevel = 1000;

    //0 is 1 becasue levels are in array
    this.currentLevel = 0;

    this.ballSpeed = 220;
    this.ballMaxVel = 300;

    this.ballInitialX = 50;
    this.ballInitialY = 240;
    this.initialDirection = 1;

    this.wallWidth = 16;

    this.mouseControl = true;

    this.lives = 3;
    this.score = 0;

    this.scoreText;
    this.livesText;
    this.levelText;
    this.gameMessageText;

    this.aKey;
    this.dKey;
    this.leftKey;
    this.rightKey;

    this.vKey;
    this.sKey;
    this.bKey;

    this.breakoutLevels;

    this.shakeEffect = false;

};

BasicGame.Game.prototype = {

    create: function () {

        //	Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        this.initGameVars();

        this.loadLevels();

        this.createSoundsAndMusic();

        this.game.add.sprite(0, 0, 'bg');

        //reset some game vars
        this.ballsCount = 0;
        this.lives = 3;
        this.score = 0;
        this.countDownTime = 3;
        this.countDownTimeElapsed = 0;

        this.game.camera.setSize(this.game.world.width, this.game.world.height);

        //remove the camera bounds so we can shake it later ;)
        this.game.camera.bounds = null;

        this.createPaddle();

        //Bricks
        this.bricks = this.game.add.group();

        //Brick drops buff/nerf items
        this.items = this.game.add.group();

        this.createHUD();

        this.populateLevel(0);

        this.balls = this.game.add.group();
        this.createBall();

        this.createCounter();

        //add a click event listener
        this.game.input.onDown.add(this.click, this);

        //other keys
        this.vKey = this.game.input.keyboard.addKey(Phaser.Keyboard.V);
        this.vKey.onDown.add(this.createBall, this);
        this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.sKey.onDown.add(this.toggleshakeEffect, this);
        this.bKey = this.game.input.keyboard.addKey(Phaser.Keyboard.B);
        this.bKey.onDown.add(this.toggleMouseKeyboardControls, this);

        this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.leftKey.onDown.add(this.prevLevel, this);
        this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.rightKey.onDown.add(this.nextLevel, this);

        this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);

    },

    update: function () {

        //	Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        this.paddleUpdate();

        this.countDownUpdate();

        this.bricksUpdate();

        if (this.isCountDownOff) {
            //if(this.balls.countLiving() > 0) {
            this.balls.forEachAlive(this.ballUpdate, this);
            //}
        }

        this.game.physics.collide(this.balls, this.balls, this.ballHitBallHandler, this.ballHitBallProcess, this);

        this.game.physics.collide(this.balls, this.bricks, this.ballHitBrickHandler, this.ballHitBricklProcess, this);

        this.game.physics.collide(this.paddle, this.balls, this.paddleHitBallHandler, this.paddleHitBallProcess, this);

        this.game.physics.collide(this.paddle, this.items, this.paddleHitItemHandler, this.paddleHitItemProcess, this);

        this.game.onRenderCallback = this.render;
    },

    render: function () {

        if (this.debug) {

            //ALL THIS CODE IS LEFT ONPURPOSE AND WORKS IN CANVAS ONLY

            //this.game.debug.renderInputInfo(20, 20);

            //this.game.debug.renderSpriteInfo(this.paddle, 20, 240);
            //this.game.debug.renderSpriteBounds(paddle);
            //this.game.debug.renderSpriteInfo(tempBall);
            //this.game.debug.renderSpriteBounds(tempBall);

            //this.game.debug.renderSpriteBody(this.paddle);
            //this.game.debug.renderSpriteBody(tempBall);

            var debugBallRender = function (ball) {
                //this.game.debug.renderSpriteInfo(ball, 20, 100);
                //this.game.debug.renderSpriteBounds(ball);
                //this.game.debug.renderSpriteBody(ball);
            }
            this.balls.forEach(debugBallRender, this);

        }
    },

    loadLevels: function () {

        this.currentLevel = 0;

        var r = 'red';
        var b = 'blue';
        var o = 'orange';
        var g = 'green';
        var X = null;

        //you can uncoment the dev level and or/add a level of your own
        //powerUps are not picked from the values bellow but set with: this.dropItemLimit
        this.breakoutLevels = [
            /*{
             name: "debug level",
             bricks: [
             [b, g, o, g, o, g, b, b, b],
             [b, b, b, b, b, b, b, b, b],
             [g, b, r, b, r, b, g, b, b],
             [g, b, b, b, b, b, g, b, b]
             ],
             powerUps: 1,
             powerDowns: 1
             },*/
            {
                name: "letsa begin",
                bricks: [
                    [X, X, g, o, g, X, X],
                    [o, b, g, g, g, b, o],
                    [X, b, b, b, b, b, X]
                ],
                powerUps: 1,
                powerDowns: 1
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
                ],
                powerUps: 1,
                powerDowns: 1
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
                ],
                powerUps: 2,
                powerDowns: 2
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
                ],
                powerUps: 2,
                powerDowns: 3
            }
        ];

    },

    createSoundsAndMusic: function () {
        this.brickDeath = this.game.add.audio('brickDeath');
        this.countdownBlip = this.game.add.audio('countdownBlip');
        this.powerdown = this.game.add.audio('powerdown');
        this.powerup = this.game.add.audio('powerup');
        this.recover = this.game.add.audio('recover');
    },

    click: function (x, y, timedown) {
        //Uncoment to make every mouse click
        //create a ball and shake screen

        //this.createBall(true);
        //this.shakeGame();
    },

    initGameVars: function () {

        this.lives = 3;
        this.score = 0;
        this.currentLevel = 0;

        this.initLevelVars();

    },

    initLevelVars: function () {

        this.countDownTime = 3;
        this.countDownTimeElapsed = 0;
        this.countDownsecondTick = 1;
        this.isCountDownOff = false;
        this.isPaddleNerfed = false;
        this.paddleNerfTime = 6000;
    },

    createHUD: function () {
        this.livesText = this.game.add.text(30, 390, 'lives: ' + this.lives, { font: "18px Arial", fill: "#000000", align: "left" });
        this.scoreText = this.game.add.text(110, 390, 'score: ' + this.score, { font: "18px Arial", fill: "#000000", align: "left" });
        this.levelText = this.game.add.text(220, 390, 'level: ' + (this.currentLevel + 1), { font: "18px Arial", fill: "#000000", align: "left" });
        this.gameMessageText = this.game.add.text(this.game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
        this.gameMessageText.anchor.setTo(0.5, 0.5);
        this.gameMessageText.visible = false;
    },

    createCounter: function () {
        this.countDown = this.game.add.sprite(this.countDownInitialX, this.countDownInitialY, 'tiles', 'two.png');
        this.countDown.animations.add('counter_three', ['three.png'], 10, false, false);
        this.countDown.animations.add('counter_two', ['two.png'], 10, false, false);
        this.countDown.animations.add('counter_one', ['one.png'], 10, false, false);
        this.countDown.play("counter_three");
        this.countDown.name = "counter";
    },

    populateLevel: function (level) {

        //reset items
        this.items.destroy();
        this.items = this.game.add.group();
        this.bricksWithItems = [];
        clearTimeout(this.recoverTimeout);

        //reset bricks
        this.bricks.destroy();
        this.bricks = this.game.add.group();

        var Level = this.breakoutLevels[level];

        for (var y = 0; y < Level.bricks.length; ++y) {
            for (var x = 0; x < Level.bricks[y].length; ++x) {

                var color = Level.bricks[y][x];

                if (color) {

                    var tempBrick;

                    var bID = 1;
                    if (color == "red") {
                        bID = 2;
                    } else if (color == "blue") {
                        bID = 1;
                    } else if (color == "orange") {
                        bID = 3;
                    } else if (color == "green") {
                        bID = 4;
                    }
                    tempBrick = this.game.add.sprite(x * 32 + 48, y * 16 + 64, 'tiles', 'brick_' + bID + '_1.png');
                    tempBrick.animations.add('idle', ['brick_' + bID + '_1.png'], 10, false, false);
                    tempBrick.diedie = tempBrick.animations.add('brick_die', [
                        'brick_' + bID + '_1.png',
                        'brick_' + bID + '_2.png',
                        'brick_' + bID + '_3.png',
                        'brick_' + bID + '_4.png'
                    ], 10, false, false);
                    tempBrick.animations.add('brick_popin', [
                        'brick_' + bID + '_4.png',
                        'brick_' + bID + '_3.png',
                        'brick_' + bID + '_2.png',
                        'brick_' + bID + '_1.png'
                    ], 10, false, false);
                    var tempCount = 0;
                    if(this.bricks.countLiving() > 0) {
                        tempCount = this.bricks.countLiving();
                    }
                    tempBrick.name = 'brick' + (tempCount + 1);

                    //tempBrick.frameName = 'brick_' + bID + '_1.png';
                    //if you use this you must change the body size
                    // and it's easier if it's set when sprite is created

                    tempBrick.body.bounce.setTo(1, 1);
                    tempBrick.body.immovable = true;

                    tempBrick.animations.play("brick_popin");

                    this.bricks.add(tempBrick);

                    this.brickCount = +1;
                }
            }
        }

        //Give some random bricks the abbility to drop items
        var dropItemLimit = this.dropItemLimit + this.currentLevel;
        var brickPartLimit = Math.floor(this.bricks.countLiving()/dropItemLimit);
        var brickStartLimit = 1;
        var brickEndLimit = brickPartLimit;

        for (var dropCount = 0; dropCount < dropItemLimit; dropCount++) {

            var randomBrick = this.getRandomInt(brickStartLimit,brickEndLimit);

            //Get random value in range
            var randomBrickName = "brick" + randomBrick;
            this.bricksWithItems.push(randomBrickName);

            brickStartLimit = brickEndLimit + 1;
            brickEndLimit += brickPartLimit;

        }

    },

    createPaddle: function () {
        this.paddle = this.game.add.sprite(this.paddleInitialX, this.paddleInitialY, 'tiles', 'paddle_big.png');
        this.paddle.name = "paddle";
        this.paddle.anchor.setTo(0.5, 0); //center anchor/origin to the middle of the paddle
        this.paddle.body.immovable = true;
        this.paddle.body.customSeparateX = true;
        this.paddle.body.customSeparateY = true;
        this.paddle.body.collideWorldBounds = true;   //check how to make a custom not bouncing collision
    },

    createBall: function (active) {

        //create a temp ball which will be added to the balls group
        var tempBall;
        tempBall = this.game.add.sprite(this.ballInitialX, this.ballInitialY, 'tiles');
        var tempCount = 0;
        if(this.balls.countLiving() > 0) {
            tempCount = this.balls.countLiving();
        }
        tempBall.name = 'ball' + (tempCount + 1);
        tempBall.animations.add('rotate', [
            'ball_1.png',
            'ball_2.png',
            'ball_3.png',
            'ball_4.png',
            'ball_5.png'
        ], 10, false, false);

        tempBall.anchor.setTo(0.5, null);

        tempBall.body.bounce.setTo(1, 1); //WHY THIS WORK BUT WITHOUT IT CANT USE CUSTOM SEPARETE???

        if (active) {
            this.setBallVelocity(tempBall);
        }

        this.ballsCount += 1;

        this.balls.add(tempBall);
    },

    resetBall: function (tempBall, active) {

        if (active) {
            this.setBallVelocity(tempBall);
        } else {
            tempBall.body.velocity.x = 0;
            tempBall.body.velocity.y = 0;
        }
        tempBall.revive();
        tempBall.body.x = this.ballInitialX;
        tempBall.body.y = this.ballInitialY;

        this.ballsCount += 1;

    },

    resetBalls: function () {


        //         this.balls.forEach(function(ball){
        //            ball.kill();
        //         }, false);

        //The code bellow is a better way of the code above ...when you want to mass murder
        // but the code above can be used for any function/code and not just kill/revive and so on.

        this.balls.callAll('kill');
        this.ballsCount = 0;
        var tempBall = this.balls.getFirstDead();

        if (tempBall)
        {
            this.resetBall(tempBall);
        }

    },

    takeOneLifeDown: function () {
        //uncoment to have a cool lyrics when player drops a ball
        //console.log("Oh my god I can't believe it, I never seen a ball to die before");
        if (this.balls.countLiving() == 0) {
            this.lives -= 1;
            this.livesText.content = 'lives: ' + this.lives;
            var firstDeadBall = this.balls.getFirstDead();
            firstDeadBall.revive();
            this.ballsCount += 1;
            this.resetCountDown();
            if (this.lives == 0) {
                this.gameOver();
            }
        }
    },

    setBallInitialVelocity: function () {
        this.balls.forEach(this.setBallVelocity, this);
    },

    setBallVelocity: function (tempBall) {
        tempBall.body.velocity.x = this.initialDirection * this.ballSpeed;
        tempBall.body.velocity.y = this.ballSpeed;
    },

    toggleMouseKeyboardControls: function () {
        this.mouseControl = !this.mouseControl;
    },

    toggleshakeEffect: function () {
        this.shakeEffect = !this.shakeEffect;
    },

    prevLevel: function () {

        if (this.currentLevel > 0) {
            this.currentLevel -= 1;

            this.resetBalls();
            this.initLevelVars();
            this.populateLevel(this.currentLevel);
            this.resetCountDown();
        }
        this.levelText.content = 'level: ' + (this.currentLevel + 1);
    },

    nextLevel: function () {
        if (this.currentLevel >= 3) {
            //the player reached the holly grail
            this.gameWin();
        }

        if (this.currentLevel <= 2) {
            this.currentLevel += 1;

            this.resetBalls();
            this.initLevelVars();
            this.populateLevel(this.currentLevel);
            this.resetCountDown();


        }

        this.levelText.content = 'level: ' + (this.currentLevel + 1);
    },

    paddleUpdate: function () {

        if (this.mouseControl) {

            //this is essential so the paddle is centered and phisics works ok (if padle.x is used then the
            // body.x is not udpated corectly and collisions in same direction are missed)

            this.paddle.body.x = this.game.input.worldX - this.paddle.body.halfWidth;

            if (this.paddle.body.x <= 0) {
                this.paddle.body.x = 0;
            }
            if (this.paddle.body.x >= this.game.world.width - this.paddle._cache.width) {
                this.paddle.body.x = this.game.world.width - this.paddle._cache.width;
            }
        } else {

            if ((this.aKey.isDown) && (!this.dKey.isDown)) {
                if (this.paddle.body.x <= 0) {
                    this.paddle.body.x = 0;
                } else {
                    this.paddle.body.velocity.x = -this.paddleSpeed;
                }
            }else if ((this.dKey.isDown) && (!this.aKey.isDown)) {
                if (this.paddle.body.x >= this.game.world.width - this.paddle._cache.width) {
                    this.paddle.body.x = this.game.world.width - this.paddle._cache.width;
                } else {
                    this.paddle.body.velocity.x = this.paddleSpeed;
                }
            } else {
                this.paddle.body.velocity.x = 0;
            }
        }

        if (this.game.input.keyboard.justReleased(Phaser.Keyboard.Z)) {
             this.nerfPaddle();
        }

        if (this.isPaddleNerfed) {
            this.paddle.frameName = "paddle_small.png";
        } else {
            this.paddle.frameName = "paddle_big.png";
        }
        this.paddle.body.setSize(this.paddle._cache.width, this.paddle._cache.height);

    },

    nerfPaddle: function () {

        //clear the time out if paddle was already nerfed
        //then the the new timeout will overwrite the old
        if (this.isPaddleNerfed) {
            clearTimeout(this.recoverTimeout);
        }

        this.isPaddleNerfed = true;

        //save a reference to the context where the setTimeout function call is made,
        // because setTimeout executes the function with this pointing to the global object
        var that = this;

        this.recoverTimeout = setTimeout(function () {

            //It's time to restore the paddle
            //and use that instead this!!! :) or you'll fall in a trap
            that.isPaddleNerfed = false;

            //play a sound
            that.recover.play();

        }, this.paddleNerfTime);

    },

    bricksUpdate: function () {

    },

    ballUpdate: function (ball) {

        ball.animations.play('rotate');

        //ball felt down
        if (ball.body.y > this.game.world.height + ball.body.height) {

            //ball felt down into the abyss

            ball.body.x = this.ballInitialX;
            ball.body.y = this.ballInitialY;
            ball.body.velocity.x = 0;
            ball.body.velocity.y = 0;

            ball.kill();
            this.ballsCount -= 1;

            if (this.ballsCount <= 0) {

                this.takeOneLifeDown();

                //clear and reset some stuff when player drops the ball and lose a lige
                this.items.callAll('kill');
                this.isPaddleNerfed = false;

            }

        }
        if (ball.body.x < this.wallWidth) {
            ball.body.x = this.wallWidth;
            ball.body.velocity.x *= -1;
        }
        if (ball.body.x > this.game.world.width - this.wallWidth - ball.body.width) {
            ball.body.x = this.game.world.width - this.wallWidth - ball.body.width;
            ball.body.velocity.x *= -1;
        }
        if (ball.body.y < 16) {
            ball.body.velocity.y = Math.abs(ball.body.velocity.y);
        }
        if (ball.body.velocity.x > this.ballMaxVel) {
            ball.body.velocity.x = this.ballMaxVel;
        }
        if (ball.body.velocity.y > this.ballMaxVel) {
            ball.body.velocity.y = this.ballMaxVel;
        }
    },

    countDownUpdate: function () {

        this.countDownTimeElapsed += this.game.time.elapsed;

        if (!this.isCountDownOff) {

            if (this.countDownTimeElapsed > this.countDownTimeInterval * this.countDownsecondTick) {

                this.countDownTime -= 1;
                this.countDownsecondTick += 1;

                this.countdownBlip.play();
            }

            if (this.countDownTime == 2) {
                this.countDown.play("counter_two", 10);
            } else if (this.countDownTime == 2) {
                this.countDown.play("counter_one", 10);
            } else if (this.countDownTime == 1) {
                this.countDown.play("counter_one", 10);
            } else if (this.countDownTime <= 0) {
                this.setBallInitialVelocity();
                this.isCountDownOff = true;
                this.countDown.kill();
            }
        }

    },

    resetCountDown: function () {
        this.countDown.revive();
        this.countDown.play("counter_three");
        this.countDownTime = 3;
        this.countDownTimeElapsed = 0;
        this.countDownsecondTick = 1;
        this.isCountDownOff = false;
    },

    paddleHitBallHandler: function (paddle, ball) {
        //just an empty handler
    },

    paddleHitBallProcess: function (paddle, ball) {

        //the two lines down show you a way to color your message in the console
        // also a defenitly check this: https://developers.google.com/chrome-developer-tools/docs/tips-and-tricks

        //console.log("%cprocess", "background: red;");
        //console.log(paddle.name + ' colide with ' + ball.name);

        ball.body.velocity.y = this.determineBounceVelocityY(paddle, ball);
        ball.body.velocity.x = this.determineBounceVelocityX(paddle, ball);

        return true;

    },

    determineBounceVelocityX: function (_paddle, _ball) {

        var bounceVelocityX = _ball.body.velocity.x;

        var ballBodyCenterX = _ball.body.x + _ball.body.halfWidth;
        var paddleBodyCenterX = _paddle.body.x + _paddle.body.halfWidth;
        var distanceX = Math.abs(ballBodyCenterX - paddleBodyCenterX);

        if (_ball.body.right < _paddle.body.x) {

            //  Ball is on the left-hand vertical side of the paddle

            var directionVariable = (bounceVelocityX > 0) ? -1 : 1;

            return bounceVelocityX * directionVariable - (distanceX * 2);

        }

        if (ballBodyCenterX == paddleBodyCenterX) {

            //  Ball is perfectly in the middle
            //  Add a little random X to prevent it bouncing straight up!

            return bounceVelocityX + 1 + Math.random() * 8;

        }

        var bounceCoefficient = 0;

        function coefficient(bounceScale, halfWidth){

            if (bounceScale > 0 && bounceScale < halfWidth / 3) {
                return 0.7;
            } else if (bounceScale > halfWidth / 3 && bounceScale < halfWidth / 3 * 2) {
                return 0.9
            } else {
                //it's at the end make the ball bounce faster
                return 1.1;
            }

        }

        if (ballBodyCenterX < paddleBodyCenterX) {

            // Ball hit the top of the paddle, left of center

            bounceCoefficient = -1 * coefficient(distanceX, _paddle.body.halfWidth);

        } else {

            // Ball hit the paddle right of center, either on the top or on the side

            bounceCoefficient = coefficient(_paddle.body.halfWidth - distanceX, _paddle.body.halfWidth);

        }

        var ratio = (distanceX) / _paddle.body.halfWidth * bounceCoefficient;

        return (this.ballSpeed * ratio);

    },

    determineBounceVelocityY: function (paddle, ball) {
        var bounceVelocityY = ball.body.velocity.y;
        if (ball.body.y < paddle.body.y + paddle.body.height / 2) {
            bounceVelocityY *= -ball.body.bounce.y;
        }
        return bounceVelocityY;
    },

    ballHitBrickHandler: function (_ball, _brick) {

        _brick.animations.play("brick_die", 15);  //just play
        _brick.events.onAnimationComplete.add(this.onAnimationCompleteBrick, this);

        this.brickDeath.play();

        this.score += this.scorePerBrick;

        this.scoreText.content = 'score: ' + this.score;

        if( this.bricksWithItems.indexOf(_brick.name) > -1 ){
            this.dropItem(_brick.x, _brick.y);
        }
    },

    ballHitBricklProcess: function (ball, _brick) {

        if (this.shakeEffect) {
            this.shakeGame();  //funny extra ;)
        }
        return true;
    },

    dropItem: function (dropItemInitialX,dropItemInitialY) {

        var typeFrame = "";
        var itemEffectName = "";

        if(Math.floor(Math.random()*2)){
            typeFrame = 'power_down.png';
            itemEffectName = "powerDown";
        } else {
            typeFrame = 'power_up.png';
            itemEffectName = "powerUp";
        }

        var dropItem;
        dropItem = this.game.add.sprite(this.getRandomInt(32, this.game.world.width - 64), -32, 'tiles', typeFrame);
        var tempCount = 0;
        if(this.items.countLiving() > 0) {
            tempCount = this.items.countLiving();
        }
        dropItem.name = 'item' + (tempCount + 1);

        //custom property
        dropItem.itemEffectName = itemEffectName;

        dropItem.body.x = dropItemInitialX;
        dropItem.body.y = dropItemInitialY;
        dropItem.body.velocity.y = 100;

        this.items.add(dropItem);
    },

    onAnimationCompleteBrick: function (sprite, animation) {

        //check which animation was finished
        if (animation.name == "brick_die") {
            sprite.kill(); //working kill a brick

            //  Are they any bricks left?
            if (this.bricks.countLiving() == 0) {
                //  New level starts
                this.score += this.scorePerLevel;
                this.scoreText.content = 'score: ' + this.score;
                this.nextLevel();
            }
        }
    },

    paddleHitItemHandler: function (paddle, item) {
        //empty handler
    },

    paddleHitItemProcess: function (paddle, item) {

        if(item.itemEffectName == "powerDown"){
            this.nerfPaddle();
            //play a sound
            this.powerdown.play();
        } else {
            this.createBall(true);
            //play a sound
            this.powerup.play();
        }
        item.kill();
        return true;
    },

    ballHitBallHandler: function (ball1, ball2) {
        //empty handler
    },

    ballHitBallProcess: function (ball1, ball2) {

        if (ball1.body.velocity.y > 0 && ball2.body.velocity.y < 0) {
            ball1.body.velocity.y *= -ball1.body.bounce.y;
            ball2.body.velocity.y *= -ball2.body.bounce.y;
        }
        if (ball1.body.velocity.y > 0 && ball2.body.velocity.y < 0) {
            ball1.body.velocity.x *= -ball1.body.bounce.x;
            ball2.body.velocity.x *= -ball2.body.bounce.x;
        }
    },

    shakeGame: function () {
        var rumble = 100;
        var rumbleSpeed = 50;
        var rumbleInterval;
        var rumbleStopTimeOut;
        var rumbleTime = 500;
        var rumbleDuration = 300; //in milliseconds

        clearInterval(rumbleInterval);
        rumbleInterval = setInterval(this.shake, rumbleSpeed, this.game.camera, 2, 5);
        clearInterval(rumbleStopTimeOut);
        rumbleStopTimeOut = setTimeout(this.stopShake, rumbleDuration, this.game.camera, rumbleInterval);
    },

    stopShake: function (rect, interval) {
        clearInterval(interval);

        // reset camera to inital position
        rect.x = 0;
        rect.y = 0;

    },

    shake: function (rect, x, y) {

        x = x || 5;
        y = y || 5;

        var rx = Math.floor(Math.random() * (x + 1)) - x / 2;
        var ry = Math.floor(Math.random() * (y + 1)) - y / 2;

        rx = (rx === 0 && x !== 0) ? ((Math.random() < 0.5) ? 1 : -1) : rx;
        ry = (ry === 0 && y !== 0) ? ((Math.random() < 0.5) ? 1 : -1) : ry;

        rect.x += rx;
        rect.y += ry;

    },

    gameOver: function () {
        this.game.state.start('GameOver');
    },

    gameWin: function(){
        this.game.state.start('Congratulations');
    },

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

};