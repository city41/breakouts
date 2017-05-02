	  /**
     * Brick class
     * @param {Number} x     initial x position
     * @param {Number} y     initial y position
     * @param {String} color initial SpriteSheet animation
     */
    var Brick = function(x, y, color, world) {
		this.initialize(x, y, color, world);
    };
	
	Brick.prototype = new createjs.Sprite();
	
	Brick.prototype.Sprite_initialize = Brick.prototype.initialize;
	
    Brick.prototype.initialize = function(x, y, color, world) {
		this.game = world
        this.x = x;
        this.y = y;
		this.height = this.game.spriteSheets.bricks.getFrameBounds(0).height;
		this.width = this.game.spriteSheets.bricks.getFrameBounds(0).width;
        this.color = color;
		this.Sprite_initialize(this.game.spriteSheets.bricks);
        this.gotoAndStop(color);
    };
	
	Brick.prototype.setPower = function(power){
		this.power = power
	}
	Brick.prototype.firePower = function(){
		if(this.power){
			this.power.fire();
		}
	}
