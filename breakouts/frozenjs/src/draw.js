define([
  'frozen/plugins/loadImage!resources/bg_prerendered.png',
  'frozen/plugins/loadImage!resources/logo.png',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(background, logo, tiles){

  function drawCountdownNumber(ctx, num){
    ctx.drawImage(tiles,
      num * 32, 96, //clip start
      32, 48,
      144 , 180,
      32, 48
    );
  }

  return function(ctx){
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';

    ctx.drawImage(background, 0, 0);

    if(this.state.screen === 0){ //title screen
      ctx.drawImage(logo, this.width/2 - logo.width/2, 65);

      var x = this.width / 2;
      ctx.textAlign = 'center';
      if(this.mobile){
        ctx.fillText('Tap to start', x, 315);
      }else{
        ctx.fillText('Click to start', x, 315);
        ctx.fillText('during the game: use L/R arrow', x, 380);
        ctx.fillText('keys to skip levels', x, 400);
      }
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

      //draw the countdown numbers
      if(this.state.launchMillis > 2000){
        drawCountdownNumber(ctx, 0);
      }else if(this.state.launchMillis > 1000){
        drawCountdownNumber(ctx, 1);
      }
      else if(this.state.launchMillis > 0){
        drawCountdownNumber(ctx, 2);
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