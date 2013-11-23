/**
# COMPONENT **logic-directional-movement**
This component changes the (x, y) position of an object according to its current speed and heading. It maintains its own heading information independent of other components allowing it to be used simultaneously with other logic components like [[Logic-Pushable]] and [[Logic-Gravity]]. It accepts directional messages that can stand alone, or come from a mapped controller, in which case it checks the `pressed` value of the message before changing its course accordingly.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
  - @param message.deltaT - To determine how far to move the entity, the component checks the length of the tick.
- **[directional message]** - Directional messages include `go-down`, `go-south`, `go-down-left`, `go-southwest`, `go-left`, `go-west`, `go-up-left`, `go-northwest`, `go-up`, `go-north`, `go-up-right`, `go-northeast`, `go-right`, `go-east`, `go-down-right`, and `go-southeast`. On receiving one of these messages, the entity adjusts its movement orientation.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new orientation. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
- **stop** - Stops motion in all directions until movement messages are again received.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.

### Local Broadcasts:
- **logical-state** - this component will trigger this message when its movement or direction changes. Note that directions are not mutually exclusive: adjacent directions can both be true, establishing that the entity is facing a diagonal direction.
  - @param message.moving (boolean) - whether the entity is in motion.
  - @param message.left (boolean)   - whether the entity is facing left.
  - @param message.right (boolean)  - whether the entity is facing right.
  - @param message.up (boolean)     - whether the entity is facing up.
  - @param message.down (boolean)   - whether the entity is facing down.

## JSON Definition:
    {
      "type": "logic-directional-movement",
      
      "speed": 4.5
      // Optional. Defines the distance in world units that the entity should be moved per millisecond. Defaults to 0.3.
    }
*/
(function(){
	var processDirection = function(direction){
		return function (state){
			if(state){
				this[direction] = (state.pressed !== false);
//				this.stopped = !state.pressed;
			} else {
				this[direction] = true;
//				this.stopped = false;
			}
		};
	},
	getAngle = function(x, y){
		var m = Math.sqrt(x * x + y * y),
		a     = 0;

		if (m != 0){
			a = Math.acos(x / m);
			if (y < 0){
				a = (Math.PI * 2) - a;
			}
		}
		return a;
	};
	
	return platformer.createComponentClass({
		id: 'logic-directional-movement',
		
		constructor: function(definition){
			var self = this;
			
			this.speed = definition.speed || .3;
			
			this.boost = false;
			this.paused = false;
			
			if(definition.pause || definition.boost){
				if(typeof definition.pause === 'string'){
					this.pausers = [definition.pause];
				} else {
					this.pausers = definition.pause;
				}
				this.addListener('logical-state');
				this['logical-state'] = function(state){
					var paused = false;
					if(definition.pause){
						for(var i = 0; i < self.pausers.length; i++){
							paused = paused || state[self.pausers[i]];
						}
						this.paused = paused;
					}
					
					if(definition.boost){
						if(self.boost){
							if(state[definition.boost] === false){
								self.boost = false;
							}
						} else if(state[definition.boost] === true){
							self.boost = true;
						}
					}
				};
			}

			this.state = this.owner.state;
			this.state.moving = false;
			this.state.left = false;
			this.state.right = false;
			this.state.up = false;
			this.state.down = false;

			this.owner.orientation = 0;
			
			this.moving = false;
			this.left = false;
			this.right = false;
			this.up = false;
			this.down = false;
			this.upLeft = false;
			this.upRight = false;
			this.downLeft = false;
			this.downRight = false;
			this.facing = 'right';
		},
		events:{
			"handle-logic": function(resp){
				var vX    = 0,
				vY        = 0,
				up        = this.up        || this.upLeft || this.downLeft,
				upLeft    = this.upLeft    || (this.up   && this.left),
				left      = this.left      || this.upLeft || this.downLeft,
				downLeft  = this.downLeft  || (this.down && this.left),
				down      = this.down      || this.downLeft || this.downRight,
				downRight = this.downRight || (this.down && this.right),
				right     = this.right     || this.upRight || this.downRight,
				upRight   = this.upRight   || (this.up   && this.right),
				orientation = 0;
				
				if (up && down){
					this.moving = false;
				} else if (left && right) {
					this.moving = false;
				} else if (upLeft) {
					vX = -this.speed / 1.414;
					vY = -this.speed / 1.414;
					this.moving = true;
					this.facing = 'up-left';
				} else if (upRight) {
					vY = -this.speed / 1.414;
					vX =  this.speed / 1.414;
					this.moving = true;
					this.facing = 'up-right';
				} else if (downLeft) {
					vY =  this.speed / 1.414;
					vX = -this.speed / 1.414;
					this.moving = true;
					this.facing = 'down-left';
				} else if (downRight) {
					vY =  this.speed / 1.414;
					vX =  this.speed / 1.414;
					this.moving = true;
					this.facing = 'down-right';
				} else if(left)	{
					vX = -this.speed;
					this.moving = true;
					this.facing = 'left';
				} else if (right) {
					vX =  this.speed;
					this.moving = true;
					this.facing = 'right';
				} else if (up) {
					vY = -this.speed;
					this.moving = true;
					this.facing = 'up';
				} else if (down) {
					vY =  this.speed;
					this.moving = true;
					this.facing = 'down';
				} else {
					this.moving = false;
					
					// This is to retain the entity's direction even if there is no movement. There's probably a better way to do this since this is a bit of a retrofit. - DDD
					switch(this.facing){
					case 'up': up = true; break;
					case 'down': down = true; break;
					case 'left': left = true; break;
					case 'right': right = true; break;
					case 'up-left': up = true; left = true; break;
					case 'up-right': up = true; right = true; break;
					case 'down-left': down = true; left = true; break;
					case 'down-right': right = true; right = true; break;
					}
				}
				
				if(this.moving){
					if(!this.paused){
						if(this.boost) {
							vX *= 1.5;
							vY *= 1.5;
						}

						this.owner.x += (vX * resp.deltaT);
						this.owner.y += (vY * resp.deltaT);
					}
					
					orientation = getAngle(vX, vY);
					if(this.owner.orientation !== orientation){
						this.owner.orientation = orientation;
					}
				}
				
				//TODO: possibly remove the separation of this.state.direction and this.direction to just use state?
				if(this.state.moving !== this.moving){
					this.state.moving = this.moving;
				}
				if(this.state.up !== up){
					this.state.up = up;
				}
				if(this.state.right !== right){
					this.state.right = right;
				}
				if(this.state.down !== down){
					this.state.down = down;
				}
				if(this.state.left !== left){
					this.state.left = left;
				}
			},
			
			"go-down": processDirection('down'),
			"go-south": processDirection('down'),
			"go-down-left": processDirection('downLeft'),
			"go-southwest": processDirection('downLeft'),
			"go-left": processDirection('left'),
			"go-west": processDirection('left'),
			"go-up-left": processDirection('upLeft'),
			"go-northwest": processDirection('upLeft'),
			"go-up": processDirection('up'),
			"go-north": processDirection('up'),
			"go-up-right": processDirection('upRight'),
			"go-northeast": processDirection('upRight'),
			"go-right": processDirection('right'),
			"go-east": processDirection('right'),
			"go-down-right": processDirection('downRight'),
			"go-southeast": processDirection('downRight'),

			"stop": function(state){
				if(!state || (state.pressed !== false)){
					this.left = false;
					this.right = false;
					this.up = false;
					this.down = false;
					this.upLeft = false;
					this.upRight = false;
					this.downLeft = false;
					this.downRight = false;
				}
			},
			
			"accelerate": function(velocity) {
				this.speed = velocity;
			}
		}
	});
})();