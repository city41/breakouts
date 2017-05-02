   var Paddle = function(x, y, world) {
		this.initialize(x, y, world);
    };
	
	Paddle.prototype = new createjs.Sprite();
	Paddle.prototype.Sprite_initialize = Paddle.prototype.initialize;

    Paddle.prototype.initialize = function(x, y, world) {
        this.x = x;
        this.y = y;
		this.game = world;
        this.normalWidth = 48;
        this.smallWidth = 32;
        this.width = this.normalWidth;
		this.Sprite_initialize(this.game.spriteSheets.paddle);
		this.height = this.game.spriteSheets.paddle.getFrameBounds(0).height;
		//registration point in the middle
        this.regX = -(this.width/2)
		this.regY = -(this.height/2)

		/**
         * Next horizontal position, initialized at initial position
         * @type {Number}
         */
        this.vX = x;
        this.gotoAndStop('normal');
    };

	Paddle.prototype.goShort = function(){
		this.gotoAndStop('small');
		var t = setTimeout(createjs.proxy(this.goNormal, this), 10000);
	}
	
	Paddle.prototype.goNormal = function(){
		this.game.playSound('recover');
		this.gotoAndStop('normal');
	}
	
    /**
     * Move to next position
     * @param  {Number} mouseX mouse X position
     */
    Paddle.prototype.calculateMoveFrom = function(mouseX) {
        this.x = mouseX;
    };