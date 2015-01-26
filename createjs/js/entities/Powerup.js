	  /**
     * Powerup class
     * @param {Number} x     initial x position
     * @param {Number} y     initial y position
     * @param {Object} world, reference to main Game object
     */
    var Powerup = function(x, y, world) {
		this.game = world
		this.Sprite_constructor(this.game.spriteSheets.power, "powerup");
        this.x = x;
        this.y = y;
		this.speed = 0;
		this.alpha = 0;
		this.height = this.game.spriteSheets.power.getFrameBounds(0).height;
		this.width = this.game.spriteSheets.power.getFrameBounds(0).width;
    };
	
	// setup inheritance
	createjs.extend(Powerup, createjs.Sprite);

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
	
	// resolve superclass overwritten methods
	// (e.g. Sprite.constructor -> Powerup.Sprite_constructor)
	createjs.promote(Powerup, 'Sprite');
