	  /**
     * Brick class
     * @param {Number} x     initial x position
     * @param {Number} y     initial y position
     * @param {String} color initial SpriteSheet animation
     */
    var Brick = function(x, y, color, world) {
		this.game = world
		this.Sprite_constructor(this.game.spriteSheets.bricks);
        this.x = x;
        this.y = y;
		this.height = this.game.spriteSheets.bricks.getFrameBounds(0).height;
		this.width = this.game.spriteSheets.bricks.getFrameBounds(0).width;
        this.color = color;
        this.gotoAndStop(color);
    };
	
	// setup inheritance
	createjs.extend(Brick, createjs.Sprite);

	// resolve superclass overwritten methods
	// (e.g. Sprite.constructor -> Brick.Sprite_constructor)
	createjs.promote(Brick, 'Sprite');
