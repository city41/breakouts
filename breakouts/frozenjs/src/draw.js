define([
  'frozen/plugins/loadImage!resources/bg_prerendered.png',
  'frozen/plugins/loadImage!resources/logo.png'
], function(background, logo){

  return function(ctx){
    //ctx.fillRect(0, 0, this.width, this.height);
    ctx.drawImage(background, 0, 0);

    //for(var id in this.entities){
    //  this.entities[id].draw(ctx);
    //}

    if(this.state.screen === 0){ //title screen
      ctx.drawImage(logo, this.width/2 - logo.width/2, 70);
      ctx.font = '14px Times';
      ctx.fillText('click to start', 120, 300);

    }else if(this.state.screen === 1){ //game playing
      this.entities.paddle.draw(ctx);
      this.state.balls[0].draw(ctx);
      if(this.state.currentBricks){
        for (var i = 0; i < this.state.currentBricks.length; i++) {
          this.state.currentBricks[i].draw(ctx);
        }
      }
    }else if(this.state.screen === 2){ // game over
      ctx.drawImage(logo, this.width/2 - logo.width/2, 70);
    }

  };

});