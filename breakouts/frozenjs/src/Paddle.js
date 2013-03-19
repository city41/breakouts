define([
  'dcl',
  'frozen/box2d/entities/Rectangle',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(dcl, Rectangle, tiles){

  'use strict';

  return dcl(Rectangle, {
    id: 'paddle',
    x: 110,
    y: 376,
    halfWidth: 24,
    halfHeight: 8,
    bigHalfWidth: 24,
    smallHalfWidth: 16,
    smallMillis: 0,
    smallMillisStart : 10000,
    friction: 0,
    categoryBits: 2,
    draw: function(ctx){
      if(this.smallMillis > 0){
        ctx.drawImage(
          tiles,
          0, 80, //clip start
          32, 16,
          (this.x - this.halfWidth) * this.scale, (this.y - this.halfHeight) * this.scale,
          32, 16
        );
      } else {
        ctx.drawImage(
          tiles,
          0, 64, //clip start
          48, 16,
          (this.x - this.halfWidth) * this.scale, (this.y - this.halfHeight) * this.scale,
          48, 16
        );
      }
    }

  });

});