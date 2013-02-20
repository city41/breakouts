define([
    'frozen/plugins/loadImage!{back:resources/bg_prerendered.png,tile:resources/tiles.png,logo:resources/logo.png}'
], function(images){
  return function(rm){
    // this.images = {};
    // this.images.back = rm.loadImage('resources/bg_prerendered.png');
    // this.images.tile = rm.loadImage('resources/tiles.png');
    // this.images.logo = rm.loadImage('resources/logo.png');
    this.images = images;
    this.sounds = {};
    this.sounds.brickDeath = rm.loadSound('resources/sfx/brickDeath.wav');
    this.sounds.powerup = rm.loadSound('resources/sfx/powerup.wav');
    this.sounds.powerdown = rm.loadSound('resources/sfx/powerup.wav');
    this.sounds.countdownBlip = rm.loadSound('resources/sfx/countdownBlip.wav');
    this.sounds.recover = rm.loadSound('resources/sfx/recover.wav');
  };
});