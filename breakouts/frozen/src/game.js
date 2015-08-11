define([
  './initInput',
  './handleInput',
  './update',
  './draw',
  './walls',
  './Paddle',
  './PaddleJoint',
  './Ball',
  './loadLevel',
  'lodash',
  'dojo/has',
  'frozen/box2d/BoxGame',
  'frozen/box2d/Box',
  'frozen/box2d/entities/Rectangle'
], function(initInput, handleInput, update, draw, walls, Paddle, PaddleJoint, Ball, loadLevel, _, has, BoxGame, Box, Rectangle){

  'use strict';

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
    handleInput: handleInput,
    update: update,
    draw: draw,
    loadLevel: loadLevel,
    state: {
      screen: 0,
      lives: 3,
      currentLevel: 0,
      score: 0,
      balls: [],
      powerUps: [],
      powerDowns: [],
      currentBricks: [],
      launchMillis: 0, //for countdown
      prevLaunchMillis: 3001 //to calc if should beep on countdown time change
    },
    initInput: initInput,
    newBall: function(){
      var newBall = new Ball();
      this.state.balls.push(newBall);
      this.addBody(newBall);
      this.box.applyImpulseDegrees(newBall.id, 155, newBall.impulse * 0.75);
    }
  });

  //add walls and paddle and joint to the box
  _.forEach(walls.entities, function(rect){
    game.addBody(new Rectangle(rect));
  });
  game.addBody(new Paddle());
  game.addJoint(new PaddleJoint());

  //launch the game!
  game.run();

});