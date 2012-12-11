goog.provide('breakout');

goog.require('lime.Director');
goog.require('breakout.scenes.Menu');

breakout.TILE_SIZE = 16;

// entrypoint
breakout.start = function(containerId){
	breakout.director = new lime.Director(document.getElementById(containerId), 320, 480);
	breakout.director.setDisplayFPS(true);

	breakout.director.makeMobileWebAppCapable();
	breakout.director.replaceScene(new breakout.scenes.Menu());
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('breakout.start', breakout.start);
