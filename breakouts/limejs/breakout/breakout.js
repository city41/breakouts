goog.provide('breakout');

goog.require('lime.Director');
goog.require('lime.Renderer');
goog.require('breakout.scenes.Menu');

breakout.TILE_SIZE = 16;
breakout.BRICK_WIDTH = 32;
breakout.BRICK_HEIGHT = 16;

breakout.IS_MOBILE = (function() {
	// stolen from Modernizr
	// TODO: does Lime or Closure already have this somewhere?
	try {  
    document.createEvent("TouchEvent");  
    return true;  
  } catch (e) {  
    return false;  
  } 
})();


goog.exportSymbol('breakout.TILE_SIZE', breakout.TILE_SIZE);
goog.exportSymbol('breakout.BRICK_WIDTH', breakout.BRICK_WIDTH);
goog.exportSymbol('breakout.BRICK_HEIGHT', breakout.BRICK_HEIGHT);
goog.exportSymbol('breakout.IS_MOBILE', breakout.IS_MOBILE);

// entrypoint
breakout.start = function(containerId){
	breakout.director = new lime.Director(document.getElementById(containerId), 20 * breakout.TILE_SIZE, 26 * breakout.TILE_SIZE);
	breakout.director.setDisplayFPS(false);

	breakout.director.replaceScene(new breakout.scenes.Menu());
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('breakout.start', breakout.start);
