define([
  './update',
  './draw',
  './walls',
  './Ball',
  './Paddle',
  './Brick',
  './levels',
  './shuffle',
  'dojo/keys',
  'frozen/box2d/BoxGame',
  'frozen/ResourceManager',
  'frozen/box2d/Box',
  'frozen/box2d/RectangleEntity',
  'frozen/box2d/joints/Prismatic'
], function(update, draw, walls, Ball, Paddle, Brick, levels, shuffle, keys, BoxGame, ResourceManager, Box, Rectangle, Prismatic){

   //setup a GameCore instance
  var game = new BoxGame({
    height: 416,
    width: 320,
    box: new Box({resolveCollisions: true, gravityY: 2}),
    boxUpdating: false, //don't start off doing physics calculations
    canvasId: 'canvas',
    //gameAreaId: 'gameArea',
    //canvasPercentage: 0.98,
    update: update,
    draw: draw,
    state: {
      screen: 0,
      lives: 3,
      currentLevel: 0,
      score: 0,
      geomId: 20, //counter to add IDs to box2d world
      powerUps: [],
      powerDowns: [],
      startBallX: 60,
      startBallY: 200,
      launchMillis: 3001, //for countdown
      prevLaunchMillis: 3001 //to calc if should beep on countdown time change
    },
    initInput: function(im){
      //bind key events. second param is for single presses
      im.addKeyAction(keys.LEFT_ARROW, true);
      im.addKeyAction(keys.RIGHT_ARROW, true);
    },
    handleInput: function(im){
      if(this.state.screen === 0 && (im.touchAction.isPressed() || im.mouseAction.isPressed())){
        this.state.screen = 1;
        this.loadLevel(0);
      }

      if(im.touchAction.position){
        movePaddle(im.touchAction.position.x);
      }
      else if(im.mouseAction.position){
        movePaddle(im.mouseAction.position.x);
      }

      if(im.keyActions[keys.LEFT_ARROW].getAmount()){
        if(this.state.currentLevel > 0){
          this.state.currentLevel--;
          this.loadLevel(this.state.currentLevel);
        }

      }else if(im.keyActions[keys.RIGHT_ARROW].getAmount()){
        if(this.state.currentLevel < levels.length - 1){
          this.state.currentLevel++;
          this.loadLevel(this.state.currentLevel);
        }

      }

    }
  });

  var movePaddle = function(x){
    var xPos = x / game.box.scale;
    if(xPos < game.entities.paddle.halfWidth){
      xPos = game.entities.paddle.halfWidth;
    }else if(xPos > game.width / game.box.scale - game.entities.paddle.halfWidth){
      xPos = game.width / game.box.scale - game.entities.paddle.halfWidth;
    }
    game.box.setPosition(game.entities.paddle.id, xPos, game.entities.paddle.y);
    game.state.lastX = x;
  };

  game.loadLevel = function(lvl){
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
    shuffle(this.state.currentBricks);
    console.log(this.state.currentBricks);
    for (i = 0; i < level.powerUps; i++) {
      this.state.currentBricks[powerCounter].powerUpBrick = true;
      powerCounter++;
    }
    for (i = 0; i < level.powerDowns; i++) {
      this.state.currentBricks[powerCounter].powerDownBrick = true;
      powerCounter++;
    }
    this.launchMillis = 3001;

    if(this.state.balls){
      for (i = 0; i < this.state.balls.length; i++) {
        this.box.removeBody(this.state.balls.id);
        delete this.entities[this.state.balls.id];
      }
    }

    this.state.balls = [];


    this.state.geomId++;
    var newBall = new Ball({x: 100, y: 230, id: this.state.geomId});
    this.state.balls.push(newBall);
    this.box.addBody(newBall);
    this.entities[newBall.id] = newBall;
    this.box.applyImpulseDegrees(newBall.id, 155, newBall.impulse * 0.75);

  };

  walls.objs.forEach(function(rect){
    game.entities[rect.id] = new Rectangle(rect);
    game.box.addBody(game.entities[rect.id]);
  });

  game.entities.paddle = new Paddle();
  game.box.addBody(game.entities.paddle);




  game.state.pJoint = new Prismatic({bodyId1: 'paddle', bodyId2: 'leftWall', id: 'pJoint'});
  game.box.addJoint(game.state.pJoint);


  //if you want to take a look at the game object in dev tools
  console.log(game);

  //launch the game!
  game.run();

});