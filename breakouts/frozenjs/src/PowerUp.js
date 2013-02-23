define([
  'dcl',
  'dcl/bases/Mixer',
  'frozen/box2d/RectangleEntity',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(dcl, Mixer, Rectangle, tiles){

  'use strict';

  return dcl([Mixer, Rectangle], {
    halfWidth: 8,
    halfHeight: 8,
    staticBody: false,
    powerUp: true,
    impulse: 1,
    constructor: function(){
      //explict props on this instance, not on protoype because of a soon to be fixed bug :)
      this.maskBits = 2;
      this.groupIndex = -1;
    },
    draw: function(ctx){
      ctx.drawImage(tiles,
          96, 96, //clip start
          16, 16,
          this.x * this.scale - 8 , this.y * this.scale - 8,
          16, 16
      );
    }


  });

});