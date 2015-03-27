define([
  'dojo/keys'
], function(keys){

  'use strict';

  return function(im){
    //bind key events. second param is for single presses
    im.addKeyAction(keys.LEFT_ARROW, true);
    im.addKeyAction(keys.RIGHT_ARROW, true);

    im.on('mousemove', im.mousemove);
  };

});