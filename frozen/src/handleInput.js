define([
  './levels',
  'dojo/keys'
], function(levels, keys){

  'use strict';

  return function handleInput(im){
    //start game
    if(this.state.screen === 0 && (im.mouseAction.isPressed())){
      this.state.screen = 1;
      this.loadLevel(0);
    }

    //move paddles
    var position = im.mouseAction.position;
    if(position){
      var paddle = this.entities.paddle;
      if(this.state.screen === 1 && paddle){
        var xPos = position.x / this.box.scale;
        if(xPos < paddle.halfWidth){
          xPos = paddle.halfWidth;
        } else if(xPos > this.width / this.box.scale - paddle.halfWidth){
          xPos = this.width / this.box.scale - paddle.halfWidth;
        }
        if(this.state.launchMillis <= 0){
          this.box.setPosition(paddle.id, xPos, paddle.y);
        } else {
          paddle.x = xPos; //force update to render paddle movement during countdown
        }
      }
    }

    //advance the levels
    if(im.keyActions[keys.LEFT_ARROW].getAmount() && this.state.currentLevel > 0){
      this.state.currentLevel--;
      this.loadLevel(this.state.currentLevel);
    } else if(im.keyActions[keys.RIGHT_ARROW].getAmount() && this.state.currentLevel < (levels.length - 1)){
      this.state.currentLevel++;
      this.loadLevel(this.state.currentLevel);
    }
  };

});