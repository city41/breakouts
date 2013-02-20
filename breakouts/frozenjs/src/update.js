define([], function(){


  return function(millis){

    var i, colObj;
    if(this.state.currentBricks){
      for (i = 0; i < this.state.currentBricks.length; i++) {
        this.state.currentBricks[i].updateAnimation(millis);
      }
    }

    this.state.balls[0].updateAnimation(millis);


    if(this.entities.paddle.collisions){
      for (i = 0; i < this.entities.paddle.collisions.length; i++) {
        colObj = this.entities[this.entities.paddle.collisions[i].id];
        if(colObj.ball && colObj.y < this.entities.paddle.y){
          var distance = colObj.x - this.entities.paddle.x;
          var maxAngle = 45;
          var maxDistance = this.entities.paddle.halfWidth + colObj.radius;
          var angle = (distance / maxDistance) * maxAngle;
          console.log(maxDistance, distance, angle, colObj.x - this.entities.paddle.x);
          this.box.removeBody(colObj.id);
          this.box.addBody(this.entities[colObj.id]);
          this.box.applyImpulseDegrees(colObj.id, angle, colObj.impulse);

        }
      }

    }

    if(this.state.balls[0].collisions){
      for (i = 0; i < this.state.balls[0].collisions.length; i++) {
        colObj = this.entities[this.state.balls[0].collisions[i].id];
        if(colObj.brick){
          colObj.dying = true;
          this.box.removeBody(colObj.id);
        }
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
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
      }

    }

  };
});