define([
  './gameState',
  './update',
  './draw',
  './walls',
  './Ball',
  './Paddle',
  './Brick',
  './levels',
  'frozen/box2d/BoxGame',
  'frozen/ResourceManager',
  'frozen/box2d/Box',
  'frozen/box2d/RectangleEntity',
  'frozen/box2d/joints/Prismatic'
], function(state, update, draw, walls, Ball, Paddle, Brick, levels, BoxGame, ResourceManager, Box, Rectangle, Prismatic){

   //setup a GameCore instance
  var game = new BoxGame({
    height: 416,
    width: 320,
    box: new Box({resolveCollisions: true, gravityY: 1}),
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
      var xPos = x / game.box.scale;
      if(xPos < game.entities.paddle.halfWidth){
        xPos = game.entities.paddle.halfWidth;
      }else if(xPos > game.width / game.box.scale - game.entities.paddle.halfWidth){
        xPos = game.width / game.box.scale - game.entities.paddle.halfWidth;
      }
      game.box.setPosition(game.entities.paddle.id, xPos, game.entities.paddle.y);
      state.lastX = x;
    //}
  };

  game.loadLevel = function(lvl){
    var i;
    var offsetX = (game.width / 2) - 112;// / game.box.scale;
    var offsetY = 70;// / game.box.scale;
    if(state.currentBricks){
      for (i = 0; i < state.currentBricks.length; i++) {
        game.box.removeBody(state.currentBricks[i].id);
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
          game.entities[brick.id] = brick;
          game.box.addBody(brick);
          state.currentBricks.push(brick);
        }
      }
    }
  };

  walls.objs.forEach(function(rect){
    game.entities[rect.id] = new Rectangle(rect);
    game.box.addBody(game.entities[rect.id]);
  });

  game.entities.paddle = new Paddle();
  game.box.addBody(game.entities.paddle);
  state.balls = [];
  state.balls.push(new Ball({x: 100, y: 230, id: 'ball1'}));
  game.box.addBody(state.balls[0]);
  game.entities.ball1 = state.balls[0];
  game.box.applyImpulseDegrees('ball1',165,1.5);

  state.pJoint = new Prismatic({bodyId1: 'paddle', bodyId2: 'leftWall', id: 'pJoint',
    jointAttributes: {
      maxMotorTorque : 20.0,
      motorSpeed : -40.0,
      enableMotor : true
    }
  });
  game.box.addJoint(state.pJoint);


  //if you want to take a look at the game object in dev tools
  console.log(game);

  //launch the game!
  game.run();
  game.loadLevel(game.currentLevel);

});