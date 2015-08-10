var balls = [];
var Ball = Class.create(Sprite, {
  initialize: function(x,y,dx,dy) {
    Sprite.apply(this,[16,16]);
    this.image = enchant.Game.instance.assets['resources/tiles.png'];
    this.frame = 51;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  },
  move: function() {
    this.x += this.dx;
    this.y += this.dy;
    //change the image to make ball spin
    //this is not too fast and spins in correct direction
    //depending on if ball is moving up or down
    switch (Math.floor(this.y/16)%5) {
      case 0: 
        this.frame = 55;
        break;
      case 1: 
        this.frame = 54;
        break;
      case 2: 
        this.frame = 53;
        break;
      case 3: 
        this.frame = 52;
        break;
      default:
        this.frame = 51;
     }
  }
});
 
//calculate dx change
Ball.prototype.determineBounceVelocity  = function(p) {
  var ratio = (p.width/10)/2
  return ((this.x-p.x)/10)-ratio;
};

//add starting ball
addBall = function(dx,dy) {
  var game = enchant.Game.instance;
  return new Ball(game.width/4,game.height/2,dx,dy);
};
