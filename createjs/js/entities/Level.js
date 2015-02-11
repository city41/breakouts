	/**
     * Level class. Represents a level in the game.
     *
     * Holds references to the various graphics and display objects used
     * within this level.
     * @param {Number} levelNumber Human number (1-indexed) of the level
     */
    var Level = function(levelNumber, world) {
        /**
         * Zero-indexed number of the level, used in the levelMaps.
         * @type {Number}
         */
        this.levelNumber = levelNumber;
		
		/**
		* Reference to the game itsel
		*/
		this.game = world;
		
        /**
         * There can be several balls at the same time.
         * A ball is an instance of createjs.Sprite.
         * @type {Array}
         */
        this.balls = [];

        /**
         * Every brick physically present in the level.
         * A brick is an instance of createjs.Sprite.
         * @type {Array}
         */
        this.bricks = [];
		
        /**
         * The paddle controlled by the player
         * @type {createjs.Sprite}
         */
        this.paddle = null;

		/**
		* Container for all the bricks 
		*/
		this.container = new createjs.Container();
		
		/**
		* State of the level
		*/
		this.paused = false;
		
       /**
	   * current level we're on
	   */
	   this.currentLevel = null;
		
	   /**
	   * Total levels we have so far
	   */
	   this.totalLevels = 2;
	   
		//init point for the maps
		this.initY = 77;
		this.initX = 54;
		this.brickWidth = this.game.spriteSheets.bricks.getFrameBounds(0).width;
		this.brickHeight = this.game.spriteSheets.bricks.getFrameBounds(0).height;
		
		this.create();
    };
	
    /**
     * Map that defines the levels, i.e the color and position of each
     * brick in the level. Property made static so it doesn't eat up more
     * memory than necessary.
     * @type {Array}
     */
	
	Level.prototype.setupMapLevel = function(){
		
			var r = 'red';
			var b = 'blue';
			var o = 'orange';
			var g = 'green';
			var X = null;

			var mapLevels = [
				{
					name: "letsa begin",
					bricks: [
						[X,X,g,o,g,X,X],
						[o,b,g,g,g,b,o],
						[X,b,b,b,b,b,X]
					]
				},
				{
					name: "how's it going?",
					bricks: [
						[X,g,o,g,o,g,X],
						[X,b,b,b,b,b,X],
						[g,b,r,b,r,b,g],
						[g,b,b,b,b,b,g],
						[g,b,X,X,X,b,g],
						[X,b,b,b,b,b,X]
					]
				}
		];
		
		return  mapLevels[this.levelNumber]
	}


    /**
     * Create and displays the graphics and game objects for a level
     * @return {Level} itsel for chaining
     */
    Level.prototype.create = function() {

        // Adding a ball to the stage
		var ball = new Ball(50, 250, this.game);
		ball.id = 1;
        this.game.stage.addChild(ball);
        this.balls.push(ball);
        this.game.stage.addChild(this.container);
		
		 
		// Adding bricks to the stage
		this.currentLevel =  this.setupMapLevel();
		var level = this.currentLevel; //lazy tipyng :)
		var rows = level.bricks.length
		for(var i=0; i<rows; i++){
			for(var c = 0; c<level.bricks[i].length; c++){
				if(!level.bricks[i][c]) continue;
				var brick = new Brick(this.initX+(this.brickWidth*c), this.initY+(this.brickHeight*i),level.bricks[i][c], this.game);
				this.container.addChild(brick);
				this.bricks.push(brick);
			}
		}

        // Adding the paddle
        var paddle = new Paddle((this.game.stage.canvas.width / 2), 368, this.game);
        this.game.stage.addChild(paddle);
        this.paddle = paddle;
		
        return this;
    };
	
	//Reset elements
	Level.prototype.reset = function(){
	  if(this.balls.length>1) return
	  this.balls[0].x = 50;
	  this.balls[0].y = 250;
	  this.balls[0].velx = (Math.random()*3)-1.5;
	  this.game.reset()
	}
	//Move to the next level or finish if we're in the last
	Level.prototype.next = function(skipNow){
	  this.paused = true;
    this.game.levelNumber += 1;
	  this.levelNumber = this.game.levelNumber;
	  if(this.levelNumber>=this.totalLevels){
		this.game.gameover(true);
	  } else {
		var t=setTimeout(function(level){ level.game.inicia(); }, (skipNow ? 0 : 3000), this);
	  }
	}
  Level.prototype.prev = function(skipNow) {
    this.paused = true;
	  this.game.levelNumber -= 1;
	  this.levelNumber = this.game.levelNumber;
	  if(this.levelNumber<0){
      this.game.splashScreen();
	  } else {
		var t=setTimeout(function(level){ level.game.inicia(); }, (skipNow ? 0 : 3000), this);
	  }
  }
	//Main game's tick handler
	Level.prototype.tick = function(){
		if(this.paused) return
		for(var i in this.balls)
		   this.balls[i].tick();
	}
	//handle mouse movement
    Level.prototype.setupEvents = function() {
        var level = this;
        this.game.stage.on("stagemousemove", level.onMouseMove, level);
		
    };
	
	//return lower/upper limits of the bricks
	Level.prototype.getBounds = function(){
		return {lower:this.initY+(this.brickHeight * this.currentLevel.bricks.length),upper:this.initY}
	};
	
	Level.prototype.onMouseMove = function(mouseEvent) {
        this.paddle.calculateMoveFrom(mouseEvent.stageX);
    };