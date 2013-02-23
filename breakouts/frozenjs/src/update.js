define([
    './remove',
    './Ball',
    './Paddle',
    './levels',
    './PowerUp',
    './PowerDown',
    'frozen/box2d/joints/Prismatic',
    'frozen/plugins/loadSound!resources/sfx/brickDeath.wav',
    'frozen/plugins/loadSound!resources/sfx/countdownBlip.wav',
    'frozen/plugins/loadSound!resources/sfx/powerup.wav',
    'frozen/plugins/loadSound!resources/sfx/powerdown.wav',
    'frozen/plugins/loadSound!resources/sfx/recover.wav'
  ], function(remove, Ball, Paddle, levels, PowerUp, PowerDown, Prismatic, brickDeath, countdownBlip, powerupSound, powerdownSound, recover){


  return function(millis){
    if(this.state.screen === 1){ // in play


      var paddle = this.entities.paddle;
      var newBall, newPaddle;

      var i,j, colObj;


      //check if the level cleared
      var aliveBricks = false;
      if(this.state.currentBricks){
        for (i = 0; i < this.state.currentBricks.length; i++) {
          if(!this.state.currentBricks[i].dead){
            this.state.currentBricks[i].updateAnimation(millis); //update animation here for effeciency
            aliveBricks = true;
          }
        }

        if(!aliveBricks){
          this.state.currentLevel++;
          if(this.state.currentLevel < levels.length){
            this.loadLevel(this.state.currentLevel);
          }else{
            this.state.screen = 3; //you win!
          }
        }
      }

      //check if we're in countdown mode
      if(this.state.launchMillis > 0){
        this.prevLaunchMillis = this.state.launchMillis;
        this.state.launchMillis-= millis;
        if(this.state.launchMillis >= 0 && (Math.floor(this.prevLaunchMillis / 1000.0) !== Math.floor(this.state.launchMillis / 1000.0))){
          countdownBlip.play();
        }
        if(this.state.launchMillis <= 0){
          this.boxUpdating = true;
        }else{
          this.boxUpdating = false;
        }
      }else{

        this.boxUpdating = true;

        if(this.state.balls){
          var ballsInPlay = [];
          for (i = 0; i < this.state.balls.length; i++) {
            if(this.state.balls[i].y < this.height / this.box.scale){
              this.state.balls[i].updateAnimation(millis);
              ballsInPlay.push(this.state.balls[i]);
            }else{
              this.box.removeBody(this.state.balls[i].id);
              delete this.entities[this.state.balls[i]];
            }
          }
          this.state.balls = ballsInPlay;
        }

        if(paddle && paddle.collisions){
          for (i = 0; i < paddle.collisions.length; i++) {
            colObj = this.entities[paddle.collisions[i].id];
            if(colObj.ball && colObj.y < paddle.y){
              var distance = colObj.x - paddle.x;
              var maxAngle = 45;
              var maxDistance = paddle.halfWidth + colObj.radius;
              var angle = (distance / maxDistance) * maxAngle;
              //console.log(maxDistance, distance, angle, colObj.x - paddle.x);
              this.box.removeBody(colObj.id);
              this.box.addBody(this.entities[colObj.id]);
              this.box.applyImpulseDegrees(colObj.id, angle, colObj.impulse);

            }else if(colObj.powerUp){
              this.box.removeBody(colObj.id);
              delete this.entities[colObj.id];
              this.state.powerUps = remove(this.state.powerUps, colObj);
              this.state.geomId++;
              newBall = new Ball({id: this.state.geomId});
              this.state.balls.push(newBall);
              this.box.addBody(newBall);
              this.entities[newBall.id] = newBall;
              this.box.applyImpulseDegrees(newBall.id, 155, newBall.impulse * 0.75);
              powerupSound.play();

            }else if(colObj.powerDown){
              this.box.removeBody(colObj.id);
              delete this.entities[colObj.id];
              this.state.powerDowns = remove(this.state.powerDowns, colObj);
              if(paddle.smallMillis > 0){ //just start the count over
                paddle.smallMillis = paddle.smallMillisStart;
              }
              else{ //create a new small sized paddle
                newPaddle = new Paddle({x: paddle.x * paddle.scale, y: paddle.y * paddle.scale, halfWidth: paddle.smallHalfWidth, smallMillis: paddle.smallMillisStart});
                this.state.pJoint = new Prismatic({bodyId1: 'paddle', bodyId2: 'leftWall', id: 'pJoint'});
                this.box.destroyJoint('pJoint');
                this.box.removeBody(paddle.id);
                this.box.addBody(newPaddle);
                this.box.addJoint(this.state.pJoint);
                this.entities.paddle = newPaddle;
                this.entities.paddle.collisions = paddle.collisions;
              }
              powerdownSound.play();
            }
          }
        }

        //if the paddle is small, countdown how much time is left in the small state
        if(paddle && paddle.smallMillis > 0){
          paddle.smallMillis -= millis;
          if(paddle.smallMillis <= 0){ // it's done being small, replace wiht a big sized paddle, and replace the joint
            newPaddle = new Paddle({x: paddle.x * paddle.scale, y: paddle.y * paddle.scale, halfWidth: paddle.bigHalfWidth});
            this.state.pJoint = new Prismatic({bodyId1: 'paddle', bodyId2: 'leftWall', id: 'pJoint'});
            this.box.destroyJoint('pJoint');
            this.box.removeBody(paddle.id);
            this.box.addBody(newPaddle);
            this.box.addJoint(this.state.pJoint);
            this.entities.paddle = newPaddle;
            recover.play();
          }
        }

        //handle ball collisions
        for (i = 0; i < this.state.balls.length; i++) {
          var ball = this.state.balls[i];

          if(ball.collisions){
            //console.log(ball.linearVelocity.x, ball.linearVelocity.y);
            for (j = 0; j < ball.collisions.length; j++) {
              colObj = this.entities[ball.collisions[j].id];
              if(colObj.brick){
                colObj.dying = true;
                this.box.removeBody(colObj.id);
                brickDeath.play();
                if(colObj.powerUpBrick){
                  //console.log('power up');
                  this.state.geomId++;
                  var power = new PowerUp({x: colObj.x * colObj.scale, y: colObj.y * colObj.scale, id: this.state.geomId});
                  this.box.addBody(power);
                  this.box.applyImpulseDegrees(power.id, 180, power.impulse);
                  this.entities[power.id] = power;
                  this.state.powerUps.push(power);
                }else if(colObj.powerDownBrick){
                  //console.log('power down');
                  this.state.geomId++;
                  var powerDown = new PowerDown({x: colObj.x * colObj.scale, y: colObj.y * colObj.scale, id: this.state.geomId});
                  this.box.addBody(powerDown);
                  this.box.applyImpulseDegrees(powerDown.id, 180, powerDown.impulse);
                  this.entities[powerDown.id] = powerDown;
                  this.state.powerDowns.push(powerDown);
                }
                this.state.score+= 100;
              }
            }
          }

          // Sometimes in box2d, especially withough gravity, things can get stuck bouncing sideways.
          // If that happens for a couple of iterations, remove the ball, replace it, and shoot it out diagnolly in the same direction it was heading
          if(ball.linearVelocity &&  Math.abs(ball.linearVelocity.y) < 3){
            ball.slowY++;
            if(ball.slowY > 1 && ball.aliveTime > 300){
              console.log('slow ' + ball.linearVelocity.y);
              this.box.removeBody(ball.id);
              newBall = new Ball({x:ball.x * ball.scale, y:ball.y * ball.scale, id: ball.id});
              this.state.balls[i] = newBall;
              this.box.addBody(newBall);
              this.entities[ball.id] = newBall;
              if(ball.linearVelocity.y > 0){
                if(ball.linearVelocity.x > 0){
                  this.box.applyImpulseDegrees(ball.id, 45, ball.impulse);
                }else{
                  this.box.applyImpulseDegrees(ball.id, 315, ball.impulse);
                }
              }else{
                if(ball.linearVelocity.x > 0){
                  this.box.applyImpulseDegrees(ball.id, 135, ball.impulse);
                }else{
                  this.box.applyImpulseDegrees(ball.id, 225, ball.impulse);
                }
              }

              newBall.slowY = 0;
            }
          }else{
            ball.slowY = 0;
          }
        }

        //check if there's any balls left on the screen
        if(this.state.balls.length === 0){
          this.state.lives --;
          if(this.state.lives > 0){
            this.state.geomId++;
            newBall = new Ball({id: this.state.geomId});
            this.state.balls.push(newBall);
            this.box.addBody(newBall);
            this.entities[newBall.id] = newBall;
            this.box.applyImpulseDegrees(newBall.id, 155, newBall.impulse * 0.75);
            this.state.launchMillis = 3001;
          }else{
            this.state.screen = 2; //game over
          }
        }

    }

  }//end in play check

  };
});