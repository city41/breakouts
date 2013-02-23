define([
  './Ball',
  './Brick',
  './levels',
  './shuffle'
], function(Ball, Brick, levels, shuffle){
  function loadLevel(lvl){
    var i;
    var offsetX = (this.width / 2) - 112;// / game.box.scale;
    var offsetY = 70;// / game.box.scale;
    var level = levels[lvl];
    var powerCounter = 0;
    if(this.state.currentBricks){
      for (i = 0; i < this.state.currentBricks.length; i++) {
        this.box.removeBody(this.state.currentBricks[i].id);
      }
    }
    this.state.currentBricks = [];

    for (i = 0; i < level.bricks.length; i++) {
      var row = level.bricks[i];
      for (var j = 0; j < row.length; j++) {
        var color = row[j];
        this.state.geomId++;
        if(color){
          var brick = new Brick({
            color: color,
            x: offsetX + (j * 32) + 16,
            y: offsetY + (i * 16) + 8,
            id: this.state.geomId
          });
          this.entities[brick.id] = brick;
          this.box.addBody(brick);
          this.state.currentBricks.push(brick);
        }
      }
    }

    //shuffle the bricks to randomly assign powerUps and powerDowns to them
    shuffle(this.state.currentBricks);
    for (i = 0; i < level.powerUps; i++) {
      this.state.currentBricks[powerCounter].powerUpBrick = true;
      powerCounter++;
    }
    for (i = 0; i < level.powerDowns; i++) {
      this.state.currentBricks[powerCounter].powerDownBrick = true;
      powerCounter++;
    }

    //reset launch counter
    this.state.launchMillis = 3001;

    //if small paddle, reduce wait
    if(this.entities.paddle.slowMillis > 0){
      this.entities.paddle.slowMillis = 1;
    }

    //remove balls from last level
    if(this.state.balls){
      for (i = 0; i < this.state.balls.length; i++) {
        this.box.removeBody(this.state.balls[i].id);
        delete this.entities[this.state.balls[i].id];
      }
    }
    this.state.balls = [];

    //remove powerups from last level
    if(this.state.powerUps){
      for (i = 0; i < this.state.powerUps.length; i++) {
        this.box.removeBody(this.state.powerUps[i].id);
        delete this.entities[this.state.powerUps[i].id];
      }
    }
    this.state.powerUps = [];

    //remove downs from last level
    if(this.state.powerDowns){
      for (i = 0; i < this.state.powerDowns.length; i++) {
        this.box.removeBody(this.state.powerDowns[i].id);
        delete this.entities[this.state.powerDowns[i].id];
      }
    }
    this.state.powerDowns = [];


    this.state.geomId++;
    var newBall = new Ball({id: this.state.geomId});
    this.state.balls.push(newBall);
    this.box.addBody(newBall);
    this.entities[newBall.id] = newBall;
    this.box.applyImpulseDegrees(newBall.id, 155, newBall.impulse * 0.75);

  }

  return loadLevel;
});