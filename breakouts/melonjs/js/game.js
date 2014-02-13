/**
 * main 
 */
var game = {

	// game assets
	assets : [	
		{name: "logo",			type:"image",	src: "data/img/logo.png"},
		{name: "tiles16",		type:"image",	src: "data/img/tiles16.png"},
		//{name: "bounce",		type: "audio",	src: "data/sfx/"},
		{name: "brickdeath",	type: "audio",	src: "data/sfx/"},
		{name: "countdownblip",	type: "audio",	src: "data/sfx/"},
		{name: "powerdown",		type: "audio",	src: "data/sfx/"},
		{name: "powerup",		type: "audio",	src: "data/sfx/"},
		{name: "recover",		type: "audio",	src: "data/sfx/"},
		{name: "title",			type: "tmx",	src: "data/map/title.json"},
		{name: "level0",		type: "tmx",	src: "data/map/level0.json"},
		{name: "level1",		type: "tmx",	src: "data/map/level1.json"},
		{name: "level2",		type: "tmx",	src: "data/map/level2.json"},
		{name: "level3",		type: "tmx",	src: "data/map/level3.json"}
	],

	// game data (score and other things)
	data : {
		lives: 3,
		score: 0,
		level: -1,
		// # bricks in the level
		bricks: 0
	},
	
	/**
	 * Initialize the application
	 */
	onload: function() {

		// init the video (with auto-scaling on)
		if (!me.video.init('screen', 320, 416, me.device.isMobile ? true : false, me.device.isMobile ? "auto" : undefined)) {
			alert("Sorry but your browser does not support html 5 canvas. Please try with another one!");
			return;
		}
		
		// disable interpolation when scaling
		me.video.setImageSmoothing(false);
		
		// enable pre-renderning globally (instead of per layer)
		// as it gives better performance on mobile device 
		// on this kind of simple game (limit draw operations)
		me.sys.preRender = true;
		
		// disable gravity globally
		me.sys.gravity = 0;
		
		// initialize the "sound engine"
		me.audio.init("mp3,ogg,wav");
		
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
		
		// register our user-defined entities in the object pool
		me.pool.register("paddle", EntityPaddle);
		me.pool.register("brick", EntityBrick);
		me.pool.register("ball", EntityBall);
		me.pool.register("countdown", EntityCountdown);
		
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
