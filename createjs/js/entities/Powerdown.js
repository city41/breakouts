	  /**
     * Powerup class
     * @param {Number} x     initial x position
     * @param {Number} y     initial y position
     * @param {Object} world, reference to main Game object
     */
    var Powerdown = function(x, y, world) {
		this.game = world;
		this.Sprite_constructor(this.game.spriteSheets.power, "powerdown");
        this.x = x;
        this.y = y;
		this.speed = 0;
		this.alpha = 0;
		this.height = this.game.spriteSheets.power.getFrameBounds(0).height;
		this.width = this.game.spriteSheets.power.getFrameBounds(0).width;
    };
	
	// setup inheritance
	createjs.extend(Powerdown, createjs.Sprite)
	
	Powerdown.prototype.fire = function(){
		this.alpha = 1;
		this.speed = 1;
	}
	
	Powerdown.prototype.tick = function(){
		this.y += this.speed;
		if(this.speed>0){
			var paddle = this.game.currentLevel.paddle;
			if(((this.y + (this.height/2)) >= paddle.y) && this.y < paddle.y+paddle.height){
				if(this.x >= (paddle.x)){
					if(this.x <= (paddle.x + paddle.width)){
						this.game.currentLevel.paddle.goShort();
						this.game.stage.removeChild(this);
						this.game.playSound("powerdown");
						this.speed = 0;
					}
				}
			}
		}	
	}
	// resolve superclass overwritten methods
	// (e.g. Sprite.constructor -> Powerdown.Sprite_constructor)
	createjs.promote(Powerdown, 'Sprite');
