define([
  './Brick',
  './levels',
  'lodash'
], function(Brick, levels, _){

  'use strict';

  return function loadLevel(lvl){
    var offsetX = (this.width / 2) - 112; // game.box.scale;
    var offsetY = 70; // game.box.scale;
    var level = levels[lvl];
    var powerCounter = 0;

    this.removeBodies(this.state.currentBricks);
    this.state.currentBricks = [];

    _.forEach(level.bricks, function(row, i){
      _.forEach(row, function(brickType, j){
        if(brickType !== null){
          var brick = new Brick({
            brickType: brickType,
            x: offsetX + (j * 32) + 16,
            y: offsetY + (i * 16) + 8
          });
          this.addBody(brick);
          this.state.currentBricks.push(brick);
        }
      }, this);
    }, this);

    //shuffle the bricks to randomly assign powerUps and powerDowns to them
    var shuffled = _.shuffle(this.state.currentBricks);
    _.times(level.powerUps, function(){
      shuffled[powerCounter].powerUpBrick = true;
      powerCounter++;
    });
    _.times(level.powerDowns, function(){
      shuffled[powerCounter].powerDownBrick = true;
      powerCounter++;
    });
    this.state.currentBricks = shuffled;

    //reset launch counter
    this.state.launchMillis = 3001;

    //if small paddle, reduce wait
    if(this.entities.paddle.slowMillis > 0){
      this.entities.paddle.slowMillis = 1;
    }

    //remove balls, powerups, and powerdowns from last level
    this.removeBodies(this.state.balls, this.state.powerUps, this.state.powerDowns);
    this.state.balls = [];
    this.state.powerUps = [];
    this.state.powerDowns = [];

    this.newBall();
  };

});