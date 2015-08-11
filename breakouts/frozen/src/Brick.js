define([
  'lodash',
  'dcl',
  'frozen/box2d/entities/Rectangle',
  'frozen/Animation',
  'frozen/ResourceManager',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(_, dcl, Rectangle, Animation, ResourceManager, tiles){

  'use strict';

  var animFrameTime = 100;

  var flippedTiles = ResourceManager.prototype.flipImageX('flipped', tiles);

  return dcl(Rectangle, {
    img: tiles,
    x: 100,
    y: 376,
    halfWidth: 15.5,
    halfHeight: 7.5,
    staticBody: true,
    friction: 0,
    dyingAnim: null,
    birthingAnim: null,
    dead: false,
    dying: false,
    dyingMillis: animFrameTime * 3,
    birthing: true,
    birthingMillis: animFrameTime * 3,
    powerUpBrick: false,
    powerDownBrick: false,
    brick: true,
    brickType: 0, // 0 - 3 for the differs colors
    constructor: function(){
      if(!this.id){
        this.id = _.uniqueId();
      }
    },
    getBirthingAnim: function(){
      //lazy load to wait for flipped image creation
      if(!this.birthingAnim){
        this.birthingAnim = Animation.prototype.createFromSheet(3, animFrameTime, flippedTiles, 32, 16);
        this.birthingAnim.offsetX = 32;
        this.birthingAnim.offsetY = 16 * this.brickType;
      }
      return this.birthingAnim;
    },
    getDyingAnim: function(){
      if(!this.dyingAnim){
        this.dyingAnim = Animation.prototype.createFromSheet(4, animFrameTime, tiles, 32, 16);
        this.dyingAnim.offsetX = 64;
        this.dyingAnim.offsetY = 16 * this.brickType;
      }
      return this.dyingAnim;
    },
    updateAnimation: function(millis){
      if(this.dying){
        this.getDyingAnim().update(millis);
        this.dyingMillis -= millis;
        if(this.dyingMillis <= 0){
          this.dying = false;
          this.dead = true;
        }
        return;
      }

      if(this.birthing){
        this.getBirthingAnim().update(millis);
        this.birthingMillis -= millis;
        if(this.birthingMillis <= 0){
          this.birthing = false;
        }
      }
    },
    draw: function(ctx){
      if(this.dead){
        return;
      }

      if(this.dying){
        this.getDyingAnim().draw(ctx, this.x * this.scale - 16, this.y * this.scale - 8);
        return;
      }

      if(this.birthing){
        this.getBirthingAnim().draw(ctx, this.x * this.scale - 16, this.y * this.scale - 8);
        return;
      }

      ctx.drawImage(
        this.img,
        0, this.brickType * 16, //clip start
        32, 16,
        this.x * this.scale - 16 , this.y * this.scale - 8,
        32, 16
      );
    }
  });

});