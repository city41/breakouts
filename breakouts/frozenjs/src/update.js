define([
    './remove',
    './Ball',
    './Paddle',
    './levels',
    './PowerUp',
    './PowerDown',
    'frozen/box2d/joints/Prismatic',
    'frozen/plugins/loadSound!resources/sfx/brickDeath.wav',
    'frozen/plugins/loadSound!resources/sfx/countdownBlip.wav'
  ], function(remove, Ball, Paddle, levels, PowerUp, PowerDown, Prismatic, brickDeath, countdownBlip){


  return function(millis){
    if(this.state.screen === 1){ // in play


      var paddle = this.entities.paddle;
      var newBall, newPaddle;

      var i,j, colObj;
      if(this.state.currentBricks){
        for (i = 0; i < this.state.currentBricks.length; i++) {
          this.state.currentBricks[i].updateAnimation(millis);
        }
      }

      if(this.launchMillis > 0){
        this.prevLaunchMillis = this.launchMillis;
        this.launchMillis-= millis;
        if(this.launchMillis >= 0 && (Math.floor(this.prevLaunchMillis / 1000.0) !== Math.floor(this.launchMillis / 1000.0))){
          countdownBlip.play();
        }
        this.boxUpdating = false;
      }else{

        this.boxUpdating = true;

        if(this.state.balls){
          var ballsInPlay = [];
          for (i = 0; i < this.state.balls.length; i++) {
            this.state.balls[i].updateAnimation(millis);
            if(this.state.balls[i].y < this.height / this.box.scale){
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
              console.log(maxDistance, distance, angle, colObj.x - paddle.x);
              this.box.removeBody(colObj.id);
              this.box.addBody(this.entities[colObj.id]);
              this.box.applyImpulseDegrees(colObj.id, angle, colObj.impulse);

            }else if(colObj.powerUp){
              this.box.removeBody(colObj.id);
              delete this.entities[colObj.id];
              this.state.powerUps = remove(this.state.powerUps, colObj);
              this.state.geomId++;
              newBall = new Ball({x: this.state.startBallX, y: this.state.startBallY, id: this.state.geomId});
              this.state.balls.push(newBall);
              this.box.addBody(newBall);
              this.entities[newBall.id] = newBall;
              this.box.applyImpulseDegrees(newBall.id, 155, newBall.impulse * 0.75);

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
            }
          }
        }
        if(paddle && paddle.smallMillis > 0){
          paddle.smallMillis -= millis;
          if(paddle <= 0){
            newPaddle = new Paddle({x: paddle.x * paddle.scale, y: paddle.y * paddle.scale, halfWidth: paddle.bigHalfWidth});
            this.state.pJoint = new Prismatic({bodyId1: 'paddle', bodyId2: 'leftWall', id: 'pJoint'});
            this.box.destroyJoint('pJoint');
            this.box.removeBody(paddle.id);
            this.box.addBody(newPaddle);
            this.box.addJoint(this.state.pJoint);
            this.entities.paddle = newPaddle;
          }
        }

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
                  console.log('power up');
                  this.state.geomId++;
                  var power = new PowerUp({x: colObj.x * colObj.scale, y: colObj.y * colObj.scale, id: this.state.geomId});
                  this.box.addBody(power);
                  //this.box.applyImpulseDegrees(power.id, 180, power.impulse);
                  this.entities[power.id] = power;
                  this.state.powerUps.push(power);
                }else if(colObj.powerDownBrick){
                  console.log('power down');
                  this.state.geomId++;
                  var powerDown = new PowerDown({x: colObj.x * colObj.scale, y: colObj.y * colObj.scale, id: this.state.geomId});
                  this.box.addBody(powerDown);
                  //this.box.applyImpulseDegrees(power.id, 180, power.impulse);
                  this.entities[powerDown.id] = powerDown;
                  this.state.powerDowns.push(powerDown);
                }
                this.state.score+= 100;
              }
            }
          }

          if(ball.linearVelocity &&  Math.abs(ball.linearVelocity.y) < -3){
            ball.slowY++;
            if(ball.slowY > 1 && ball.aliveTime > 500){
              console.log('slow ' + ball.linearVelocity.y);
              this.box.removeBody(ball.id);
              newBall = new Ball({x:ball.x,y:ball.y, alreadyScaled: true, id: ball.id, scale: this.box.scale});
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
              console.log(newBall);
            }
          }else{
            ball.slowY = 0;
          }
        }


        var aliveBricks = false;
        if(this.state.currentBricks){
          for (i = 0; i < this.state.currentBricks.length; i++) {
            if(!this.state.currentBricks[i].dead){
              aliveBricks = true;
            }
          }

          if(!aliveBricks){
            this.state.currentLevel++;
            if(this.state.currentLevel < (levels.length -1)){
              this.loadLevel(this.state.currentLevel);
            }else{
              this.state.screen = 3; //you win!
            }
          }
        }

        if(this.state.balls.length === 0){
          this.state.lives --;
          if(this.state.lives > 0){
            this.state.geomId++;
            newBall = new Ball({x: this.state.startBallX, y: this.state.startBallY, id: this.state.geomId});
            this.state.balls.push(newBall);
            this.box.addBody(newBall);
            this.entities[newBall.id] = newBall;
            this.box.applyImpulseDegrees(newBall.id, 155, newBall.impulse * 0.75);
            this.launchMillis = 3001;
          }else{
            this.state.screen = 2; //game over
          }
        }



    }

  }//end in play check

  };
});