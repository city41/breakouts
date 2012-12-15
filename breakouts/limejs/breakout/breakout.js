goog.provide('breakout');

goog.require('lime.Director');
goog.require('breakout.scenes.Menu');

breakout.TILE_SIZE = 16;
breakout.BRICK_WIDTH = 32;
breakout.BRICK_HEIGHT = 16;
goog.exportSymbol('breakout.TILE_SIZE', breakout.TILE_SIZE);
goog.exportSymbol('breakout.BRICK_WIDTH', breakout.BRICK_WIDTH);
goog.exportSymbol('breakout.BRICK_HEIGHT', breakout.BRICK_HEIGHT);

// entrypoint
breakout.start = function(containerId){
	breakout.director = new lime.Director(document.getElementById(containerId), 320, 480);
	breakout.director.setDisplayFPS(false);

	breakout.director.makeMobileWebAppCapable();
	breakout.director.replaceScene(new breakout.scenes.Menu());
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('breakout.start', breakout.start);
