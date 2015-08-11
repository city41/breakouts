//paddle 
var Paddle = Class.create(Sprite, {
  initialize: function() {
    Sprite.apply(this,[48,16]);
    var game = enchant.Game.instance;
    this.image = game.assets['resources/tiles.png'];
    //select spritesheet frame
    this.frame = 16;
    this.x = game.width/2-this.width/2;
    this.y = game.height-48;

  } //end initialize
});
 
