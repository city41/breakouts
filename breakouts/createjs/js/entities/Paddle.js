   var Paddle = function(x, y, world) {
		this.game = world;
		this.Sprite_constructor(this.game.spriteSheets.paddle);
        this.x = x;
        this.y = y;
        this.width = 48;
		this.height = this.game.spriteSheets.paddle.getFrameBounds(0).height;
		//registration point in the middle
		this.regX = -(this.width/2);
		this.regY = -(this.height/2);

		/**
         * Next horizontal position, initialized at initial position
         * @type {Number}
         */
        this.vX = x;
        this.gotoAndStop('normal');
    };

	// setup inheritance
	createjs.extend(Paddle, createjs.Sprite);

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
