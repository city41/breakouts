define([
  'frozen/plugins/loadImage!resources/bg_prerendered.png',
  'frozen/plugins/loadImage!resources/logo.png',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(background, logo, tiles){

  return function(ctx){
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';

    ctx.drawImage(background, 0, 0);

    //for(var id in this.entities){
    //  this.entities[id].draw(ctx);
    //}

    if(this.state.screen === 0){ //title screen
      ctx.drawImage(logo, this.width/2 - logo.width/2, 65);

      var x = this.width / 2;
      ctx.textAlign = 'center';
      ctx.fillText('Click to start', x, 300);
      ctx.fillText('during the game: use L/R arrow', x, 360);
      ctx.fillText('keys to skip levels', x, 380);

    }else if(this.state.screen === 1){ //game playing
      var i;
      this.entities.paddle.draw(ctx);
      for (i = 0; i < this.state.balls.length; i++) {
        this.state.balls[i].draw(ctx);
      }
      for (i = 0; i < this.state.currentBricks.length; i++) {
        this.state.currentBricks[i].draw(ctx);
      }
      for (i = 0; i < this.state.powerUps.length; i++) {
        this.state.powerUps[i].draw(ctx);
      }
      for (i = 0; i < this.state.powerDowns.length; i++) {
        this.state.powerDowns[i].draw(ctx);
      }
      ctx.fillText('lives: ' + this.state.lives, 20, 405);
      ctx.textAlign = 'center';
      ctx.fillText('score: ' + this.state.score, this.width/2, 405);
      ctx.textAlign = 'right';
      ctx.fillText('level: ' + (this.state.currentLevel + 1), 300, 405);
      if(this.launchMillis > 2000){
        ctx.drawImage(tiles,
          0, 96, //clip start
          32, 48,
          this.width/2 - 16 , 160,
          32, 48
        );
      }else if(this.launchMillis > 1000){
        ctx.drawImage(tiles,
          32, 96, //clip start
          32, 48,
          this.width/2 - 16 , 160,
          32, 48
        );
      }
      else if(this.launchMillis > 0){
        ctx.drawImage(tiles,
          64, 96, //clip start
          32, 48,
          this.width/2 - 16 , 160,
          32, 48
        );
      }
    }else if(this.state.screen === 2){ // game over
      ctx.drawImage(logo, this.width/2 - logo.width/2, 70);
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', this.width / 2, 300);
    }else if(this.state.screen === 3){ // you win!
      ctx.drawImage(logo, this.width/2 - logo.width/2, 70);
      ctx.textAlign = 'center';
      ctx.fillText('You Win!', this.width / 2, 300);
    }

  };

});