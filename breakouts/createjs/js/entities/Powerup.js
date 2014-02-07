	  /**
     * Powerup class
     * @param {Number} x     initial x position
     * @param {Number} y     initial y position
     * @param {Object} world, reference to main Game object
     */
    var Powerup = function(x, y, world) {
		this.initialize(x, y, world);
    };
	
	Powerup.prototype = new createjs.Sprite();
	
	Powerup.prototype.Sprite_initialize = Powerup.prototype.initialize;
	
    Powerup.prototype.initialize = function(x, y, world) {
		this.game = world
        this.x = x;
        this.y = y;
		this.speed = 0;
		this.alpha = 0;
		this.height = this.game.spriteSheets.power.getFrameBounds(0).height;
		this.width = this.game.spriteSheets.power.getFrameBounds(0).width;
		this.Sprite_initialize(this.game.spriteSheets.power, "powerup");
    };
	
	Powerup.prototype.fire = function(){
		this.alpha = 1;
		this.speed = 1;
	}
	
	Powerup.prototype.tick = function(){
		this.y += this.speed;
		if(this.speed>0){
			var paddle = this.game.currentLevel.paddle;
			if(((this.y + (this.height/2)) >= paddle.y) && this.y < paddle.y+paddle.height){
				if(this.x >= (paddle.x)){
					if(this.x <= (paddle.x + paddle.width)){
						this.game.currentLevel.addExtraBall();
						this.game.stage.removeChild(this)
						this.game.playSound("powerup");
						this.speed = 0;
					}
				}
			}
		}
	}