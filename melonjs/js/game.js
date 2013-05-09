/**
 * main 
 */
var game = {

	// game assets
	assets : [	
		{name: "logo",			type:"image",	src: "data/img/logo.png"},
		{name: "tiles16",		type:"image",	src: "data/img/tiles16.png"},
		//{name: "bounce",		type: "audio",	src: "data/sfx/",	channel : 2},
		{name: "brickdeath",	type: "audio",	src: "data/sfx/",	channel : 2},
		{name: "countdownblip",	type: "audio",	src: "data/sfx/",	channel : 1},
		{name: "powerdown",		type: "audio",	src: "data/sfx/",	channel : 1},
		{name: "powerup",		type: "audio",	src: "data/sfx/",	channel : 1},
		{name: "recover",		type: "audio",	src: "data/sfx/",	channel : 1},
		{name: "title",			type: "tmx",	src: "data/map/title.tmx"},
		{name: "level0",		type: "tmx",	src: "data/map/level0.tmx"},
		{name: "level1",		type: "tmx",	src: "data/map/level1.tmx"},
		{name: "level2",		type: "tmx",	src: "data/map/level2.tmx"},
		{name: "level3",		type: "tmx",	src: "data/map/level3.tmx"}
	],
	
	/**
	 * Initialize the application
	 */
	onload: function() {
		me.sys.useNativeAnimFrame = true;

		// init the video (with auto-scaling on)
		if (!me.video.init('canvas', 320, 416)) {
			alert("Sorry but your browser does not support html 5 canvas. Please try with another one!");
			return;
		}
		
		// disable interpolation when scaling
		me.video.setImageSmoothing(false);
		
		// enable pre-renderning globally (instead of per layer)
		// as it gives better performance on mobile device 
		// on this kind of simple game (limit draw operations)
		me.sys.preRender = true;
		
		// enable dirty region draw mechanism
		me.sys.dirtyRegion = true;
		
		// disable gravity globally
		me.sys.gravity = 0;
		
		// initialize the "sound engine"
		me.audio.init("mp3,ogg");
		
		// some additional fine-tuning to make it "nice" on mobile devices
		if (me.sys.touch) {
			/* This code prevents the webview from moving on a swipe */
			preventDefaultScroll = function(e) {
				e.preventDefault();
				window.scroll(0,0);
				return false;
			};
			window.document.addEventListener('touchmove', preventDefaultScroll, false);

			window.addEventListener("load", function() {
				setTimeout(function() {
					window.scrollTo(0, 1);
				}, 0);
			});
		}
		
		// set the loader callback
		me.loader.onload = this.loaded.bind(this);
		
		// set all ressources to be loaded
		me.loader.preload(game.assets);
		
		// load everything & display a loading screen
		me.state.change(me.state.LOADING);
	
	},
	
	/**
	 * callback when everything is loaded
	 */	
	loaded: function ()	{
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.MENU, new TitleScreen());
		me.state.set(me.state.PLAY, new PlayScreen());
		me.state.set(me.state.GAME_END, new GameEndScreen());
		me.state.set(me.state.GAMEOVER, new GameOverScreen());
		
		// add some fadeIn/fadeOut effect for transition 
		me.state.transition("fade","#000000", 100);
		
		// add our user-defined entities in the entity pool
		me.entityPool.add("paddle", EntityPaddle);
		me.entityPool.add("brick", EntityBrick);
		me.entityPool.add("ball", EntityBall);
		me.entityPool.add("countdown", EntityCountdown);
		
		// add a fn callback that displays pause on pause :)
		me.state.onPause = function () {
			var _font = new me.Font('Arial', 20, 'black', 'center');
			_font.bold();
			_font.draw(me.video.getSystemContext(), 'Paused !', me.game.viewport.width/2, me.game.viewport.height/2 + 110);
			me.video.blitSurface();
		};
		
		// switch to MENU state
		me.state.change(me.state.MENU);
	}
};

/* Bootstrap */
window.onReady(function onReady() {
	game.onload();
});
