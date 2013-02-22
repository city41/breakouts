define([
  'dcl',
  'dcl/bases/Mixer',
  'frozen/box2d/RectangleEntity',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(dcl, Mixer, Rectangle, tiles){

  'use strict';

  return dcl([Mixer, Rectangle], {
    id: 'paddle',
    x: 100,
    y: 376,
    halfWidth: 24,
    halfHeight: 8,
    bigHalfWidth: 24,
    smallHalfWidth: 16,
    smallMillis: 0,
    smallMillisStart : 10000, //TODO ten seconds is enough?
    friction: 0,
    constructor: function(){
      this.categoryBits = 2;
    },
    draw: dcl.superCall(function(sup){
      return function(ctx){
        if(this.smallMillis > 0){
          ctx.drawImage(tiles,
            0, 80, //clip start
            32, 16,
            this.x * this.scale - this.halfWidth * this.scale, this.y * this.scale - this.halfHeight * this.scale,
            32, 16
          );
        }else{
          ctx.drawImage(tiles,
            0, 64, //clip start
            48, 16,
            this.x * this.scale - this.halfWidth * this.scale, this.y * this.scale - this.halfHeight * this.scale,
            48, 16
          );
        }
        //sup.apply(this, [ctx]);
      };
    })

  });

});