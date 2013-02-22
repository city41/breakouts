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
    powerDown: true,
    impulse: 2,
    constructor: function(){
      this.maskBits = 2;
      this.groupIndex = -1;
    },
    draw: function(ctx){
      ctx.drawImage(tiles,
          112, 96, //clip start
          16, 16,
          this.x * this.scale - 8 , this.y * this.scale - 8,
          16, 16
      );
    }


  });

});