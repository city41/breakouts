define([
  './update',
  './draw',
  './walls',
  './Ball',
  './Paddle',
  './Brick',
  './levels',
  './shuffle',
  './loadLevel',
  'dojo/keys',
  'frozen/box2d/BoxGame',
  'frozen/ResourceManager',
  'frozen/box2d/Box',
  'frozen/box2d/RectangleEntity',
  'frozen/box2d/joints/Prismatic'
], function(update, draw, walls, Ball, Paddle, Brick, levels, shuffle, loadLevel, keys, BoxGame, ResourceManager, Box, Rectangle, Prismatic){

   //setup a GameCore instance
  var game = new BoxGame({
    height: 416,
    width: 320,
    box: new Box({resolveCollisions: true, gravityY: 0}),
    boxUpdating: false, //don't start off doing physics calculations
    canvasId: 'canvas',
    //gameAreaId: 'gameArea',
    //canvasPercentage: 0.98,
    update: update,
    draw: draw,
    loadLevel: loadLevel,
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

  function movePaddle(x){
    var xPos = x / game.box.scale;
    if(xPos < game.entities.paddle.halfWidth){
      xPos = game.entities.paddle.halfWidth;
    }else if(xPos > game.width / game.box.scale - game.entities.paddle.halfWidth){
      xPos = game.width / game.box.scale - game.entities.paddle.halfWidth;
    }
    game.box.setPosition(game.entities.paddle.id, xPos, game.entities.paddle.y);
    game.state.lastX = x;
  }


  //add walls and paddle to the box
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