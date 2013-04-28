define([
  'lodash',
  'frozen/plugins/loadImage!resources/bg_prerendered.png',
  'frozen/plugins/loadImage!resources/logo.png',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(_, background, logo, tiles){

  'use strict';

  return function(ctx){
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';

    ctx.drawImage(background, 0, 0);

    // Fast track to game drawing since this is where the actual movement and performance is needed
    if(this.state.screen === 1){ //game playing
      this.entities.paddle.draw(ctx);

      var entities = Array.prototype.concat.call(this.state.balls, this.state.currentBricks, this.state.powerUps, this.state.powerDowns);
      _.forEach(entities, function(entity){
        entity.draw(ctx);
      });

      ctx.fillText('lives: ' + this.state.lives, 20, 405);
      ctx.textAlign = 'center';
      ctx.fillText('score: ' + this.state.score, this.width / 2, 405);
      ctx.textAlign = 'right';
      ctx.fillText('level: ' + (this.state.currentLevel + 1), 300, 405);

      //draw the countdown numbers
      if(this.state.launchMillis > 0){
        var tileNumber = Math.floor(Math.abs(this.state.launchMillis - 3000) / 1000);
        ctx.drawImage(tiles,
          tileNumber * 32, 96, //clip start
          32, 48,
          144 , 180,
          32, 48
        );
      }
    } else {
      var halfWidth = this.width / 2;
      var centerLogo = halfWidth - logo.width / 2;
      ctx.drawImage(logo, centerLogo, 70); // Might need to drop this to 65 for screen 0
      ctx.textAlign = 'center';

      if(this.state.screen === 0){ //title screen
        if(this.mobile){
          ctx.fillText('Tap to start', halfWidth, 315);
        } else {
          ctx.fillText('Click to start', halfWidth, 315);
          ctx.fillText('during the game: use L/R arrow', halfWidth, 380);
          ctx.fillText('keys to skip levels', halfWidth, 400);
        }
      } else if(this.state.screen === 2){ // game over
        ctx.fillText('Game Over', halfWidth, 300);
      } else if(this.state.screen === 3){ // you win!
        ctx.fillText('You Win!', halfWidth, 300);
      }
    }
  };

});