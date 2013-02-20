define([
  'frozen/plugins/loadImage!resources/bg_prerendered.png'
], function(background){

  return function(ctx){
    //ctx.fillRect(0, 0, this.width, this.height);
    ctx.drawImage(background, 0, 0);
    //for(var id in this.entities){
    //  this.entities[id].draw(ctx);
    //}
    this.entities.paddle.draw(ctx);
    this.state.balls[0].draw(ctx);
    if(this.state.currentBricks){
      for (var i = 0; i < this.state.currentBricks.length; i++) {
        this.state.currentBricks[i].draw(ctx);
      }
    }
  };

});