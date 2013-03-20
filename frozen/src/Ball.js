define([
  'lodash',
  'dcl',
  'frozen/box2d/entities/Circle',
  'frozen/Animation',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(_, dcl, Circle, Animation, tile){

  'use strict';

  return dcl(Circle, {
    x: 60,
    y: 210,
    ball: true,
    radius: 8,
    img: tile,
    anim: null,
    restitution: 1.0,
    friction: 0,
    impulse: 1.8,
    slowY: 0, //tracker of box2d to keep from slowing vertically
    aliveTime: 0,
    groupIndex: -1,
    constructor: function(){
      if(!this.id){
        this.id = _.uniqueId();
      }
      this.anim = Animation.prototype.createFromSheet(5, 200, this.img, 16, 16);
      this.anim.offsetX = 48;
      this.anim.offsetY = 64;
    },
    updateAnimation: function(millis){
      this.anim.update(millis);
      this.aliveTime += millis;
    },
    draw: function(ctx){
      this.anim.draw(ctx, (this.x - this.radius) * this.scale, (this.y - this.radius) * this.scale);
    }
  });

});