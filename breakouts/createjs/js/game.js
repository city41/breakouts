(function() {
    /**
     * Main game object, start point of the Game application.
     * @type {Object}
     */
    var Game = {
	
        /**
         * EaselJS stage from canvas
         * @type {createjs.Stage}
         */
        stage: null,

        /**
         * Text that shows loading of the game
         * @type {createjs.Text}
         */
        loadingIndicator: null,

        /**
         * Loads and holds assets
         * @type {createjs.Preloader}
         */
        loader: null,

        /**
         * Text that displays the current FPS
         * @type {createjs.Text}
         */
        FPSIndicator: null,

        /**
         * holds references to the various spriteSheets by name
         * @type {Object}
         */
        spriteSheets: {
            ball: null,
            bricks: null,
            paddle: null
        },

        /**
         * Reference to the current level
         * @type {Level}
         */
        currentLevel: null,
		
		/**
		* level number reference
    * 0 is 1 because levels are in array
		*/
		levelNumber: 0,
		
		/**
		* Game score
		*/
		score: 0,
		
		/**
		* Game lives
		*/
		lives: 3,
		
		/**
		* pause state
		*/
		paused: true,
		
		/**
		* flag that the game was started
		*/
		inited: false,
		
        /**
         * Application starter function
         */
        initialize: function() {
            Game.stage = new createjs.Stage('stage');
			createjs.Touch.enable(Game.stage);
            Game.loadAssets();
        },

        /**
         * Load game assets and show loading indicator
         * @return {[type]} [description]
         */
        loadAssets: function() {
            var manifest = [{
                id: "tiles",
                src: "assets/tiles.png"
            }, {
                id: "logo",
                src: "assets/logo.png"
            }, {
                id: "background",
                src: "assets/bg_prerendered.png"
            }].concat(getAudioFiles());

            Game.loadingIndicator = new createjs.Text("Loading 0%", "30px Arial", '#000');
            Game.loadingIndicator.x = 0;
            Game.loadingIndicator.y = 200;
            Game.stage.addChild(Game.loadingIndicator);

            Game.FPSIndicator = document.getElementById('fps');

            Game.loader = new createjs.LoadQueue(false);

			Game.loader.addEventListener("progress", handleProgress);
			Game.loader.addEventListener("complete", handleComplete);
			Game.loader.addEventListener("error", handleFileError);
			
			Game.loader.installPlugin(createjs.Sound);
            
			Game.loader.loadManifest(manifest);

            /**
             * Avoids boring type
             * @return {Array} manifest for audio files
             */

            function getAudioFiles() {
                var filesNames = ['brickDeath', 'countdownBlip'];
                var extensions = ['.mp3', '.ogg', '.wav'];
                var result = [];

                filesNames.forEach(function(file) {
                    extensions.forEach(function(extension) {
                        result.push({
                            id: file,
                            src: 'assets/sfx/' + file + extension
                        });
                    });
                });

                return result;
            }
			//Handle loading progress
			function handleProgress(event) {
                Game.loadingIndicator.text = "Loading resources "+ Math.floor(event.loaded * 100) + "%";
                Game.stage.update();
            }
			//hancle complete loading
            function handleComplete(event) {
				Game.loadingIndicator.text = "Resources loaded!";
                Game.stage.update();
                Game.stage.removeAllChildren();
                Game.buildSpriteSheets();
                Game.splashScreen();

                window.onkeydown = function(evt) {
                  if (Game.levelNumber != -1) {
                    switch(evt.keyCode) {
                      case 37: // left arrow
                        Game.currentLevel.prev(true);
                        break;
                      case 39: // right arrow
                        Game.currentLevel.next(true);
                        break;
                    }
                  }
                }
            }
			 // An error happened on a file
			function handleFileError(event) {
					Game.loadingIndicator.text = "There was an error loading resources"
			}

        },
		
    splashScreen: function() {
				var splashScreen = new SplashScreen(Game.loader.getResult("background"), Game.loader.getResult("logo"), Game);
    },
		//general convenient method to play sound registered here
		playSound: function(name){
			createjs.Sound.play(name);
		},

    updateScore: function() {
	    Game.scoreText.text = "Lives:"+Game.lives+" Score:"+Game.score+" Level:"+(Game.levelNumber+1);
	    Game.stage.update();
    },
		
		inicia: function(event){
			//remove all elements except background
			var elem = Game.stage.getNumChildren()
			for(var i=1; i<elem; i++){
				Game.stage.removeChildAt(1)
			}
			 Game.stage.update();
			 Game.currentLevel = new Level(Game.levelNumber, Game);
			 var gameDim = Game.stage.getBounds();
			//scoring Text
			Game.scoreText = new createjs.Text('', '20px Arial', '#000');
			Game.scoreText.maxWidth = gameDim.width - 30
			Game.scoreText.y = gameDim.height - 20;
			Game.scoreText.x = 20;
			Game.stage.addChild(Game.scoreText);
      Game.updateScore();
            Game.currentLevel.setupEvents();
			Game.runCountDown();
			Game.setupUpdateLoop();
			Game.inited = true;
		},
		//reset game to init a new round
		reset: function(){
			Game.paused = true; 
			Game.runCountDown();
		},
		//countdown loop
		runCountDown: function(){
			Game.paused = Game.currentLevel.paused = true;
			var countdown = new createjs.Sprite(Game.spriteSheets.countdown, "go");
			countdown.addEventListener("animationend", function(evt){ 
				Game.paused = false; 
				Game.currentLevel.paused = false;
				Game.stage.removeChild(countdown);
			})
			
			var dim = Game.stage.getBounds();
			countdown.x = dim.width/2 - (Game.spriteSheets.countdown.getFrameBounds(1).width/2);
			countdown.y = dim.height - 150;
			Game.stage.addChild(countdown);
			
			createjs.Sound.play("countdownBlip");
			createjs.Sound.play("countdownBlip", {interrupt: createjs.Sound.INTERRUPT_ANY, delay:1000});
			createjs.Sound.play("countdownBlip", {interrupt: createjs.Sound.INTERRUPT_ANY, delay:2000});
		},
		
		 /**
         * Finish the game
         * @argument isLast (boolean) indicate if is the 
		 * last screen so you win or just that you lost
         */
		gameover: function(isLast){
			//remove all elements except background
			var elem = Game.stage.getNumChildren()
			for(var i=1; i<elem; i++){
				Game.stage.removeChildAt(1)
			}
			Game.stage.update();
			//set levelNumber to -1 so main loop skip
			Game.levelNumber = -1;
      Game.currentLevel = null;
			//scoring Text
			var gameOver = new GameOverScreen(Game.loader.getResult("background"), Game.loader.getResult("logo"), Game, isLast);
		},
		/**
		* The whole game is finished and need to begin again
		*/
		reinit: function(){
			Game.lives = 3;
			Game.score = 0;
			Game.levelNumber = 0;
			Game.paused = true;
			Game.inicia();
		},	
		
        /**
         * Creates the various `createjs.SpriteSheet`s once the tiles asset
         * has been loaded.
         */
        buildSpriteSheets: function() {
            var tileImage = Game.loader.getResult("tiles");
		
            Game.spriteSheets.bricks = new createjs.SpriteSheet({
                images: [tileImage],
                frames: {
                    width: 32,
                    height: 16
                },
                animations: {
                    blue: { frames:[0]} ,
                    blueDying: {frames:[0, 5], speed: 0.1, next: false},
                    orange: { frames:[6]} ,
                    orangeDying:{frames:[6, 11], speed: 0.1, next: false},
                    red: { frames:[12]} ,
                    redDying:{frames:[12, 17], speed: 0.1, next: false},
                    green: { frames:[18]} ,
                    greenDying:{frames:[18, 23], speed: 0.1, next: false},
                }
            });

            Game.spriteSheets.ball = new createjs.SpriteSheet({
                images: [tileImage],
                frames: {
                    width: 16,
                    height: 16
                },
                animations: {
                    ball: {
                        frames: [51, 52, 53, 54, 55],
                        frequency: 2
                    }
                }
            });

            Game.spriteSheets.countdown = new createjs.SpriteSheet({
                images: [tileImage],
				frames: {
                    width: 32,
                    height: 48
                },
               
                animations: {
                    go: {
                         frames: [12,13,14],
                         next: false,
						 speed: .02
                    }
                }
            });

            Game.spriteSheets.paddle = new createjs.SpriteSheet({
                images: [tileImage],
                frames: [
					// x, y, width, height, imageIndex, regX, regY
                    [0, 64, 48, 16, 0, 24, 8],
                ],
                animations: {
                    normal: 0,
                }
            });
			
        },

        tick: function(elapsedTime) {
            //If you want to view FPS, uncoment below line and <span id="fps"> on index.html
			 // Game.FPSIndicator.innerText = Math.round(createjs.Ticker.getMeasuredFPS());
			if(Game.levelNumber != -1 && !this.paused) Game.currentLevel.tick();
            Game.stage.update();
        },
		//creates main tick
		setupUpdateLoop: function() {
			if(!Game.inited){
				createjs.Ticker.on("tick", this.tick, this);
				createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED ;
				createjs.Ticker.setFPS(60);		
			}
        }
    };
	
    window.addEventListener('load', Game.initialize);

})();