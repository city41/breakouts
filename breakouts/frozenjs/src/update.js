define([
  './gameState'
], function(state){


  return function(millis){
    state.box.update(millis);//have box2d do an interation
    state.box.updateExternalState(state.world); //have update local objects with box2d state

    var i, colObj;
    if(state.currentBricks){
      for (i = 0; i < state.currentBricks.length; i++) {
        state.currentBricks[i].updateAnimation(millis);
      }
    }

    state.balls[0].updateAnimation(millis);


    if(state.world.paddle.collisions){
      for (i = 0; i < state.world.paddle.collisions.length; i++) {
        colObj = state.world[state.world.paddle.collisions[i].id];
        if(colObj.ball && colObj.y < state.world.paddle.y){
          var distance = colObj.x - state.world.paddle.x;
          var maxAngle = 45;
          var maxDistance = state.world.paddle.halfWidth + colObj.radius;
          var angle = (distance / maxDistance) * maxAngle;
          console.log(maxDistance, distance, angle, colObj.x - state.world.paddle.x);
          state.box.removeBody(colObj.id);
          state.box.addBody(state.world[colObj.id]);
          state.box.applyImpulseDegrees(colObj.id, angle, colObj.impulse);

        }
      }

    }

    if(state.balls[0].collisions){
      for (i = 0; i < state.balls[0].collisions.length; i++) {
        colObj = state.world[state.balls[0].collisions[i].id];
        if(colObj.brick){
          colObj.dying = true;
          state.box.removeBody(colObj.id);
        }
      }
    }

    var aliveBricks = false;
    if(state.currentBricks){
      for (i = 0; i < state.currentBricks.length; i++) {
        if(!state.currentBricks[i].dead){
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