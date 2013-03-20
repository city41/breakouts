define([
  './Ball',
  './Paddle',
  './PaddleJoint',
  './levels',
  './PowerUp',
  './PowerDown',
  'lodash',
  /*
   * sounds/ is aliased in dojoConfig - plugins use require.toUrl to determine path
   * not specifying an extension let's frozen auto-select one that works for the current browser
   */
  'frozen/plugins/loadSound!sounds/brickDeath',
  'frozen/plugins/loadSound!sounds/countdownBlip',
  'frozen/plugins/loadSound!sounds/powerup',
  'frozen/plugins/loadSound!sounds/powerdown',
  'frozen/plugins/loadSound!sounds/recover'
], function(Ball, Paddle, PaddleJoint, levels, PowerUp, PowerDown, _, brickDeath, countdownBlip, powerupSound, powerdownSound, recover){

  'use strict';

  /*
   * Screen states:
   * 1: in play
   * 2: game over
   * 3: you win
   */

  return function(millis){
    // return early if not in play
    if(this.state.screen !== 1){
      return;
    }

    var paddle = this.entities.paddle;
    var newBall, newPaddle;

    //check if the level cleared
    var aliveBricks = false;
    _.forEach(this.state.currentBricks, function(brick){
      if(!brick.dead){
        brick.updateAnimation(millis); //update animation here for effeciency
        aliveBricks = true;
      }
    });

    if(!aliveBricks){
      this.state.currentLevel++;
      if(this.state.currentLevel < levels.length){
        this.loadLevel(this.state.currentLevel);
      } else {
        this.state.screen = 3; //you win!
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
      } else {
        this.boxUpdating = false;
      }
    } else {

      this.boxUpdating = true;

      this.state.balls = _.filter(this.state.balls, function(ball){
        if(ball.y < this.height / this.box.scale){
          ball.updateAnimation(millis);
          return true;
        }

        this.removeBody(ball);
        return false;
      }, this);

      if(paddle && paddle.collisions){
        _.forEach(paddle.collisions, function(collision){
          var colObj = this.entities[collision.id];
          if(colObj.ball && colObj.y < paddle.y){
            var distance = colObj.x - paddle.x;
            var maxAngle = 45;
            var maxDistance = paddle.halfWidth + colObj.radius;
            var angle = (distance / maxDistance) * maxAngle;
            this.removeBody(colObj);
            this.addBody(colObj);
            this.box.applyImpulseDegrees(colObj.id, angle, colObj.impulse);
          } else if(colObj.powerUp){
            this.removeBody(colObj);
            this.state.powerUps = _.reject(this.state.powerUps, { id: colObj.id });
            this.newBall();
            powerupSound.play();
          } else if(colObj.powerDown){
            this.removeBody(colObj);
            this.state.powerDowns = _.reject(this.state.powerDowns, { id: colObj.id });
            if(paddle.smallMillis > 0){ //just start the count over
              paddle.smallMillis = paddle.smallMillisStart;
            } else { //create a new small sized paddle
              newPaddle = new Paddle({
                x: paddle.x * paddle.scale,
                y: paddle.y * paddle.scale,
                halfWidth: paddle.smallHalfWidth,
                smallMillis: paddle.smallMillisStart
              });
              this.removeJoint(this.joints.pJoint);
              this.removeBody(paddle);
              this.addBody(newPaddle);
              this.addJoint(new PaddleJoint());
            }
            powerdownSound.play();
          }
        }, this);
      }

      //if the paddle is small, countdown how much time is left in the small state
      if(paddle && paddle.smallMillis > 0){
        paddle.smallMillis -= millis;
        if(paddle.smallMillis <= 0){ // it's done being small, replace wiht a big sized paddle, and replace the joint
          newPaddle = new Paddle({
            x: paddle.x * paddle.scale,
            y: paddle.y * paddle.scale,
            halfWidth: paddle.bigHalfWidth
          });
          this.removeJoint(this.joints.pJoint);
          this.removeBody(paddle);
          this.addBody(newPaddle);
          this.addJoint(new PaddleJoint());
          recover.play();
        }
      }

      //handle ball collisions
      _.forEach(this.state.balls, function(ball, idx){
        if(ball.collisions){
          _.forEach(ball.collisions, function(collision){
            var colObj = this.entities[collision.id];
            if(colObj && colObj.brick){
              colObj.dying = true;
              this.removeBody(colObj);
              brickDeath.play(0.5);
              if(colObj.powerUpBrick){
                var powerUp = new PowerUp({
                  x: colObj.x * colObj.scale,
                  y: colObj.y * colObj.scale
                });
                this.addBody(powerUp);
                this.box.applyImpulseDegrees(powerUp.id, 180, powerUp.impulse);
                this.state.powerUps.push(powerUp);
              }else if(colObj.powerDownBrick){
                var powerDown = new PowerDown({
                  x: colObj.x * colObj.scale,
                  y: colObj.y * colObj.scale
                });
                this.addBody(powerDown);
                this.box.applyImpulseDegrees(powerDown.id, 180, powerDown.impulse);
                this.state.powerDowns.push(powerDown);
              }
              this.state.score+= 100;
            }
          }, this);
        }

        // Sometimes in box2d, especially withough gravity, things can get stuck bouncing sideways.
        // If that happens for a couple of iterations, remove the ball, replace it, and shoot it out diagnolly in the same direction it was heading
        if(ball.linearVelocity &&  Math.abs(ball.linearVelocity.y) < 3){
          ball.slowY++;
          if(ball.slowY > 1 && ball.aliveTime > 300){
            this.box.removeBody(ball.id);
            newBall = new Ball({
              x: ball.x * ball.scale,
              y: ball.y * ball.scale,
              id: ball.id
            });
            this.state.balls[idx] = newBall;
            this.addBody(newBall);
            var degrees;
            if(ball.linearVelocity.y > 0){
              if(ball.linearVelocity.x > 0){
                degrees = 45;
              }else{
                degrees = 315;
              }
            } else {
              if(ball.linearVelocity.x > 0){
                degrees = 135;
              }else{
                degrees = 225;
              }
            }
            this.box.applyImpulseDegrees(ball.id, degrees, ball.impulse);

            newBall.slowY = 0;
          }
        } else {
          ball.slowY = 0;
        }
      }, this);

      //check if there's any balls left on the screen
      if(this.state.balls.length === 0){
        this.state.lives--;
        if(this.state.lives > 0){
          this.newBall();
          this.state.launchMillis = 3001;
        } else {
          this.state.screen = 2; //game over
        }
      }
    }
  };

});