define([
  'lodash',
  'dcl',
  'frozen/box2d/entities/Rectangle',
  'frozen/plugins/loadImage!resources/tiles.png'
], function(_, dcl, Rectangle, tiles){

  'use strict';

  return dcl(Rectangle, {
    halfWidth: 8,
    halfHeight: 8,
    staticBody: false,
    impulse: 1,
    maskBits: 2,
    groupIndex: -1,
    tiles: tiles,
    constructor: function(){
      if(!this.id){
        this.id = _.uniqueId();
      }
    }
  });

});