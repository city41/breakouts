   var Paddle = function(x, y, world) {
		this.game = world;
		this.Sprite_constructor(this.game.spriteSheets.paddle);
        this.x = x;
        this.y = y;
        this.normalWidth = 48;
        this.smallWidth = 32;
        this.width = this.normalWidth;
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

	// setup inheritance
	createjs.extend(Paddle, createjs.Sprite);

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
        this.x = Math.min(mouseX, this.game.stage.canvas.width - this.width);
    };

	// resolve superclass overwritten methods
	// (e.g. Sprite.constructor -> Paddle.Sprite_constructor)
	createjs.promote(Paddle, 'Sprite');
