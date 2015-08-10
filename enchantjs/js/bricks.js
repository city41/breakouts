var bricks = [];

var Brick = Class.create(Sprite, {
  initialize: function(x,y,color) {
    Sprite.apply(this,[32,16]);
    this.image = enchant.Game.instance.assets['resources/tiles.png'];
    var startFrame = color*6;
    this.frame = [startFrame + 4, startFrame +3, startFrame +2, startFrame+1,startFrame, null];
    this.x = x + 48;
    this.y = y + 64;
  }
});

Brick.prototype.powerDowns = 0;
Brick.prototype.powerUps = 0;

