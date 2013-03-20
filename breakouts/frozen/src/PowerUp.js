define([
  './Power',
  'dcl'
], function(Power, dcl){

  'use strict';

  return dcl(Power, {
    powerUp: true,
    draw: function(ctx){
      ctx.drawImage(
        this.tiles,
        96, 96, //clip start
        16, 16,
        this.x * this.scale - 8 , this.y * this.scale - 8,
        16, 16
      );
    }
  });

});