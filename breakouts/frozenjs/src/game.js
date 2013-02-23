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
  'dojo/has',
  'dojo/has!touch?dojo/touch:dojo/mouse',
  'frozen/box2d/BoxGame',
  'frozen/ResourceManager',
  'frozen/box2d/Box',
  'frozen/box2d/RectangleEntity',
  'frozen/box2d/joints/Prismatic'
], function(update, draw, walls, Ball, Paddle, Brick, levels, shuffle, loadLevel, keys, has, hid, BoxGame, ResourceManager, Box, Rectangle, Prismatic){

   //setup a GameCore instance
  var game = new BoxGame({
    height: 416,
    width: 320,
    box: new Box({resolveCollisions: true, gravityY: 0}),
    boxUpdating: false, //don't start off doing physics calculations
    canvasId: 'canvas',
    gameAreaId: has('touch') ? 'gameArea' : null,
    canvasPercentage: has('touch') ? 0.98 : null,
    mobile: has('touch') ? true : false,
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
      launchMillis: 0, //for countdown
      prevLaunchMillis: 3001 //to calc if should beep on countdown time change
    },
    initInput: function(im){
      //bind key events. second param is for single presses
      im.addKeyAction(keys.LEFT_ARROW, true);
      im.addKeyAction(keys.RIGHT_ARROW, true);
    },
    handleInput: function(im){
      //start game
      if(this.state.screen === 0 && (im.touchAction.isPressed() || im.mouseAction.isPressed())){
        this.state.screen = 1;
        this.loadLevel(0);
      }

      //move paddles
      if(im.touchAction.position){
        movePaddle(im.touchAction.position.x);
      }
      else if(im.mouseAction.position){
        movePaddle(im.mouseAction.position.x);
      }

      //advance the levels
      if(im.keyActions[keys.LEFT_ARROW].getAmount() && this.state.currentLevel > 0){
        this.state.currentLevel--;
        this.loadLevel(this.state.currentLevel);

      }else if(im.keyActions[keys.RIGHT_ARROW].getAmount() && this.state.currentLevel < (levels.length - 1)){
        this.state.currentLevel++;
        this.loadLevel(this.state.currentLevel);
      }
    }
  });

  function movePaddle(x){
    if(game.state.screen === 1 && game.entities.paddle){
      var xPos = x / game.box.scale;
      if(xPos < game.entities.paddle.halfWidth){
        xPos = game.entities.paddle.halfWidth;
      }else if(xPos > game.width / game.box.scale - game.entities.paddle.halfWidth){
        xPos = game.width / game.box.scale - game.entities.paddle.halfWidth;
      }
      if(game.state.launchMillis <= 0){
        game.box.setPosition(game.entities.paddle.id, xPos, game.entities.paddle.y);
      }else{
        game.entities.paddle.x = xPos; //force update to render paddle movement during countdown
      }
    }
  }

  //add walls and paddle and joint to the box
  walls.objs.forEach(function(rect){
    game.entities[rect.id] = new Rectangle(rect);
    game.box.addBody(game.entities[rect.id]);
  });
  game.entities.paddle = new Paddle();
  game.box.addBody(game.entities.paddle);
  game.state.pJoint = new Prismatic({bodyId1: 'paddle', bodyId2: 'leftWall', id: 'pJoint'});
  game.box.addJoint(game.state.pJoint);


  //launch the game!
  game.run();

});