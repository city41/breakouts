define([
  'dcl',
  'dcl/bases/Mixer',
  'frozen/box2d/RectangleEntity',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(dcl, Mixer, Rectangle, tiles){

  'use strict';

  return dcl([Mixer, Rectangle], {
    id: 'paddle',
    img: tiles,
    x: 100,
    y: 376,
    halfWidth: 24,
    halfHeight: 8,
    bigHalfWidth: 24,
    smallHalfWidth: 16,
    friction: 0,

    draw: dcl.superCall(function(sup){
      return function(ctx){
        if(this.img){
          ctx.drawImage(this.img,
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