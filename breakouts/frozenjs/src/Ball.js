define([
  'dcl',
  'dcl/bases/Mixer',
  'frozen/box2d/CircleEntity',
  'frozen/Animation',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(dcl, Mixer, Circle, Animation, tile){

  'use strict';

  return dcl([Mixer, Circle], {
    x: 60,
    y: 200,
    ball: true,
    radius: 8,
    img: tile,
    anim: null,
    restitution: 1.0,
    friction: 0,
    impulse: 1.6,
    slowY: 0, //tracker of box2d to keep from slowing vertically
    aliveTime: 0,
    constructor: function(){
      this.anim = new Animation().createFromSheet(5, 200, this.img, 16, 16);
      this.anim.offsetX = 48;
      this.anim.offsetY = 64;
      this.groupIndex = -1;
    },
    updateAnimation : function(millis){
      this.anim.update(millis);
      this.aliveTime+= millis;
    },
    draw: function(ctx){
      this.anim.draw(ctx, this.x * this.scale - this.radius * this.scale, this.y * this.scale - this.radius * this.scale);
    }

  });

});