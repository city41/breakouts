define([
  './gameState',
  'frozen/plugins/loadImage!resources/bg_prerendered.png'
], function(state, background){

  return function(ctx){
    //ctx.fillRect(0, 0, this.width, this.height);
    ctx.drawImage(background, 0, 0);
    //for(var id in state.world){
    //  state.world[id].draw(ctx);
    //}
    state.world.paddle.draw(ctx);
    state.balls[0].draw(ctx);
    if(state.currentBricks){
      for (var i = 0; i < state.currentBricks.length; i++) {
        state.currentBricks[i].draw(ctx);
      }
    }
  };

});