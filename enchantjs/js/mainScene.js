//main game scene
var GameScene = Class.create(Scene, {
  initialize: function(lev) {
    //to access game instance
    var game = enchant.Game.instance;
    Scene.apply(this);

    //background
    var bg = new Sprite(gameWidth,gameHeight);
    bg.image = game.assets['resources/bg_prerendered.png'];
    this.addChild(bg);
 
    //clone levels array
    this.levels = lev.slice(0);

    //displayed level on label
    level = 5-this.levels.length;

    var bottomLabel = new Label('Lives: ' + lives + ' Score: ' + score + ' Level: ' + level);
    bottomLabel.y = this.height - 16;
    bottomLabel.textAlign = 'center';
    bottomLabel.color = 'black';
    bottomLabel.font = '16px Verdana';
    this.bottomLabel = bottomLabel;
    this.addChild(bottomLabel);
   
    var paddle = new Paddle();
    this.addChild(paddle);
    this.paddle = paddle;

    //paddle movement
    //enchant doesnt have a builtin way to deal with mousemove
    gameID = document.getElementById('enchant-stage');
    gameID.addEventListener("mousemove", function(e) {
      paddle.x = e.pageX - gameID.offsetLeft - paddle.width/2;
      //stop paddle from moving into walls
      if(paddle.x+paddle.width > game.width) paddle.x = game.width-paddle.width;
      else if (paddle.x < 0) paddle.x = 0;
    });

    //load sound
    this.brickDeath = game.assets['resources/sfx/brickDeath.mp3'];

    bricks = [];
    this.populateBricks();
    //add bricks to scene
    for (var i = 0, j = bricks.length; i < j; i++) {
      this.addChild(bricks[i]);
    }
    
    //powerups and powerdowns
    powers = [];
    this.addPowers();
    
    //countdown
    var numbers = new Sprite(32,48);
    numbers.image = enchant.Game.instance.assets['resources/tiles.png'];
    numbers.frame = 12;
    numbers.x = this.width/2;
    numbers.y = this.height/2;
    numbers.countdownBlip = game.assets['resources/sfx/countdownBlip.mp3'];
    numbers.recover = game.assets['resources/sfx/recover.mp3'];
    //enchat.js timeline 
    numbers.tl.cue({
      0: function() {this.countdownBlip.play();},
      50: function() {this.frame++; this.countdownBlip.play();},
      100: function() {this.frame++; this.countdownBlip.play();},
      150: function() { this.scene.removeChild(this); 
                        balls[0].dx = 3; 
                        balls[0].dy = 3;
                        this.recover.play();
                      }
    });
    this.addChild(numbers);
 
    balls = [];
    //ball starts with 0,0 velocity, but is changes when countdown finishes
    balls[0] = addBall(0,0);
    this.addChild(balls[0]);
 
    //toggle levels
    this.addEventListener(Event.RIGHT_BUTTON_UP, function() {
      var nextLevel = new GameScene(this.levels.slice(1));
      enchant.Game.instance.replaceScene(nextLevel);
    });
    this.addEventListener(Event.LEFT_BUTTON_UP, function() {
      var prevLevel = new GameScene(levels.slice((-this.levels.length-1)));
      enchant.Game.instance.replaceScene(prevLevel);
    });

    this.addEventListener(Event.ENTER_FRAME, this.update); //game starts moving
  }, //end initialize

  update: function() {
    //see if paddle and powers touch
    for (var i = 0 ; i < powers.length; i++) {
      powers[i].move();
      if(powers[i].intersect(this.paddle)) {
        powers[i].action();
        this.removeChild(powers[i]);
        powers.splice(i,1); 
        i--;
      }
      //falls past paddle
      else if (powers[i].y > this.height) {
        this.removeChild(powers[i]);
        powers.splice(i,1); 
        i--;
      }
    }

    for (i = 0, j = balls.length; i < j; i++) {
      balls[i].move();
      //collision check
      //walls
      if(balls[i].y > this.height) {
        balls.splice(i,1);
        if(balls.length<1) {
          if(!--lives) {
            var gameover = new textScene('Game Over');
            enchant.Game.instance.replaceScene(gameover);
          }
        balls.push(addBall(3,3));
        this.addChild(balls[balls.length-1]);
        this.bottomLabel.text = 'Lives: ' + lives + ' Score: ' + score + ' Level: ' + level;
        }
        i--;
        j--;
        continue;
      }
      var wallThickness = 16;
      if(balls[i].x < wallThickness) {
        balls[i].dx = -balls[i].dx;
        balls[i].x = wallThickness;
      } else if (balls[i].x+balls[i].width > this.width - wallThickness) {
        balls[i].x = this.width - wallThickness - balls[i].width;
        balls[i].dx = -balls[i].dx;
      }
      if(balls[i].y < wallThickness) balls[i].dy = -balls[i].dy;

      //intersect() is enchantjs collision detection function
      //paddle
      if(balls[i].intersect(this.paddle)) {
         //hitting paddle always bounces ball up
         balls[i].dy = (balls[i].dy < 0) ? balls[i].dy : -balls[i].dy;
         //angle of bounce (dx)
         balls[i].dx = balls[i].determineBounceVelocity(this.paddle);
         this.update();
      }
      //bricks collision
      for(var n = 0, m = bricks.length; n < m; n++) {
        if(balls[i].intersect(bricks[n])) {
          this.brickDeath.play();
          score += 100;
          this.bottomLabel.text = 'Lives: ' + lives + ' Score: ' + score + ' Level: ' + level;

          //see if that brick contained a power
          if(bricks[n].powerUps) {
            powers.push(new PowerUp(bricks[n].x,bricks[n].y));
            this.addChild(powers[powers.length -1]);
          }
          else if(bricks[n].powerDowns) {
            powers.push(new PowerDown(bricks[n].x,bricks[n].y));
            this.addChild(powers[powers.length -1]);
          }

          balls[i].dy = -balls[i].dy;
          balls[i].dx = balls[i].determineBounceVelocity(bricks[n]);
          //remove brick[n] from the scene
          this.removeBrickAnime(bricks[n]);
          bricks.splice(n,1);
        }
      } //end for bricks
    } //end for balls

    //replace current level with next level
    if(bricks.length < 1) {
      this.levels.shift();
      var nextLevel = this.levels.length ? new GameScene(this.levels) : new textScene('You Win');
      enchant.Game.instance.replaceScene(nextLevel);
    }
  }, //end update

  removeBrickAnime: function(brick) {
     brick.frame = [ brick.frame+1, brick.frame+2, brick.frame+3, brick.frame+4, 5,  null];
  } //end removeBrickAnime

});

GameScene.prototype.populateBricks = function() {
  for (var i = 0, j = this.levels[0].bricks.length; i < j; i++) {
    for (var k = 0, l = this.levels[0].bricks[i].length; k < l; k++) {
       if(this.levels[0].bricks[i][k] !== X) {
         var newBrickX = k * 32;
         var newBrickY = i * 16;
         var newBrick = new Brick(newBrickX,newBrickY,this.levels[0].bricks[i][k]);
         bricks.push(newBrick);
       } //end if
    }
  }
};

//adds level powerups and powerdowns to random bricks
GameScene.prototype.addPowers = function() {
  var powerUps = this.levels[0].powerUps;
  var powerDowns = this.levels[0].powerDowns;
  while(powerUps > 0) {
    var rand = Math.floor(Math.random()*bricks.length);
    if (!bricks[rand].powerUps && !bricks[rand].powerDowns) {
       bricks[rand].powerUps = 1;
       powerUps--;
    }
  }
  while(powerDowns > 0) {
    var rand = Math.floor(Math.random()*bricks.length);
    if (!bricks[rand].powerUps && !bricks[rand].powerDowns) {
       bricks[rand].powerDowns = 1;
       powerDowns--;
    }
  }
};

