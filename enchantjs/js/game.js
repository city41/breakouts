/****************************************
 * enchant.js version of Breakout
 *
 * by Maciej Kus http://maciejkus.com/
 *
 * http://enchantjs.com/
 *
 * created for http://www.jsbreakouts.org/
 ****************************************/

var gameWidth = 320,
    gameHeight = 416,
    lives = 3,
    score = 0,
    level = 1;


//load enchant
enchant();

window.onload = function() {
  var game = new Core(gameWidth,gameHeight);
  game.scale = 1;
  game.fps = 50;
  game.preload('resources/bg_prerendered.png',
               'resources/tiles.png',
               'resources/logo.png',
               'resources/sfx/brickDeath.mp3',
               'resources/sfx/countdownBlip.mp3',
               'resources/sfx/powerdown.mp3',
               'resources/sfx/powerup.mp3',
               'resources/sfx/recover.mp3'); 

  //once game loaded
  game.onload = function() {
    var scene = new textScene('enchant.js');
    game.pushScene(scene);
  }

  game.start();
};
