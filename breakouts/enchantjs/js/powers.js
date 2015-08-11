//var powerUps = [];
//var powerDowns = [];
var powers = [];

//powers parent class
var Power = Class.create(Sprite, {
  initialize: function(x,y) {
    Sprite.apply(this,[16,16]);
    this.image = enchant.Game.instance.assets['resources/tiles.png'];
    this.x = x;
    this.y = y;
  },
  move: function() {
    this.y += 2;
  }
});

var PowerDown = Class.create(Power, {
  initialize: function(x,y) {
    Power.call(this,x,y);
    this.frame = 79;
  },
  action: function() {
    var game = enchant.Game.instance;
    var paddle = game.currentScene.paddle;
    game.assets['resources/sfx/powerdown.mp3'].play();
    paddle.width = 32;
    paddle.frame = 30;
  }
});

var PowerUp = Class.create(Power, {
  initialize: function(x,y) {
    Power.call(this,x,y);
    this.frame = 78;
  },
  action: function() {
    var game = enchant.Game.instance;
    balls.push(addBall(3,3));
    game.assets['resources/sfx/powerup.mp3'].play();
    game.currentScene.addChild(balls[balls.length -1]);
  }
});

