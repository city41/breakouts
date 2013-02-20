define([
  './gameState',
  './update',
  './draw',
  './walls',
  './Ball',
  './Paddle',
  './Brick',
  './levels',
  'frozen/GameCore',
  'frozen/ResourceManager',
  'frozen/box2d/Box',
  'frozen/box2d/RectangleEntity',
  'frozen/box2d/joints/Prismatic'
], function(state, update, draw, walls, Ball, Paddle, Brick, levels, GameCore, ResourceManager, Box, Rectangle, Prismatic){

   //setup a GameCore instance
  var game = new GameCore({
    height: 416,
    width: 320,
    canvasId: 'canvas',
    gameAreaId: 'gameArea',
    canvasPercentage: 0.98,
    update: update,
    draw: draw,
    currentLevel: 0,
    handleInput: function(im){
      if(im.touchAction.position){
        movePaddle(im.touchAction.position.x);
      }
      else if(im.mouseAction.position){
        movePaddle(im.mouseAction.position.x);
      }

    }
  });

  var movePaddle = function(x){
    //if(x !== state.lastX){
      var xPos = x / state.box.scale;
      if(xPos < state.world.paddle.halfWidth){
        xPos = state.world.paddle.halfWidth;
      }else if(xPos > game.width / state.box.scale - state.world.paddle.halfWidth){
        xPos = game.width / state.box.scale - state.world.paddle.halfWidth;
      }
      state.box.setPosition(state.world.paddle.id, xPos, state.world.paddle.y);
      state.lastX = x;
    //}
  };

  game.loadLevel = function(lvl){
    var i;
    var offsetX = (game.width / 2) - 112;// / state.box.scale;
    var offsetY = 70;// / state.box.scale;
    if(state.currentBricks){
      for (i = 0; i < state.currentBricks.length; i++) {
        state.box.removeBody(state.currentBricks[i].id);
      }
    }
    state.currentBricks = [];
    for (i = 0; i < levels[lvl].bricks.length; i++) {
      var row = levels[lvl].bricks[i];
      for (var j = 0; j < row.length; j++) {
        var color = row[j];
        if(color){
          var brick = new Brick({
            color: color,
            x: offsetX + (j * 32) + 16,
            y: offsetY + (i * 16) + 8,
            id: 'brick' + i + '_' + j
          });
          state.world[brick.id] = brick;
          state.box.addBody(brick);
          state.currentBricks.push(brick);
        }
      }
    }
  };

  state.box = new Box({resolveCollisions: true, gravityY: 1});
  state.world = {};
  walls.objs.forEach(function(rect){
    state.world[rect.id] = new Rectangle(rect);
    state.box.addBody(state.world[rect.id]);
  });

  state.world.paddle = new Paddle();
  state.box.addBody(state.world.paddle);
  state.balls = [];
  state.balls.push(new Ball({x: 100, y: 230, id: 'ball1'}));
  state.box.addBody(state.balls[0]);
  state.world.ball1 = state.balls[0];
  state.box.applyImpulseDegrees('ball1',165,1.5);

  state.pJoint = new Prismatic({bodyId1: 'paddle', bodyId2: 'leftWall', id: 'pJoint',
    jointAttributes: {
      maxMotorTorque : 20.0,
      motorSpeed : -40.0,
      enableMotor : true
    }
  });
  state.box.addJoint(state.pJoint);


  //if you want to take a look at the game object in dev tools
  console.log(game);

  //launch the game!
  game.run();
  game.loadLevel(game.currentLevel);

});