/**
# COMPONENT **logic-gravity**
A component that causes the object to move according to a specified gravity.

## Dependencies
- [[Handler-Logic]] (on entity's parent) - This component listens for a "handle-logic" message. It then moves the entity according to the gravitational forces.
- [[Collision-Basic]] (on entity) - Not required if this object doesn't collide with things. This component listens for the message 'hit-solid' from the collision-basic component.

## Messages

### Listens for:
- **handle-logic** - Accelerates and moves the objects according to the set gravity. Objects will not move faster than the max velocity set. Though max velocity only limits the portion of the velocity maintained by the gravity component.
  - @param resp.deltaT (number) - The time since the last tick.
- **hit-solid** - Received when we collide with an object that is solid to the entity. We stop the movement in the direction of that object.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.
- **glide** - Changes the maximum gravitational velocity.
  - @param message.maxVelocity, message.maxVelocityX, message.maxVelocityY (number) - The new maximum velocity the entity should have due to gravity.
  - @param message.duration, message.durationX, message.durationY (number) - Time in milliseconds to make the transition form current velocity to the maximum velocity.
  - @param message.acceleration, message.accelerationX, message.acclerationY (number) - How quickly to transition to new maximum velocity.
- **gravitate** - Changes the gravitational acceleration.
  - @param message.gravity, message.gravityX, message.gravityY (number) - Sets the new gravitational pull on the entity.
- **hover** - Causes gravitational affect on the entity's velocity to cease.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop gravity.
- **fall** - Causes the gravitational affect on the entity's velocity to continue.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not start gravity.
 

## JSON Definition
    {
      "type": "logic-pushable",
      "velocityX" : 0,
      //Optional - The starting x velocity of the entity. Defaults to 0.
	  "velocityY" : 0,
	  //Optional - The starting y velocity of the entity. Defaults to 0.
	  "maxVelocityX" : 3,
	  //Optional - The max x velocity attributed to the entity by gravity. Defaults to 3.
	  "maxVelocityY" : 3, 
	  //Optional - The max y velocity attributed to the entity by gravity. Defaults to 3.
	  "maxVelocity" : 3, 
	  //Optional - The max velocity attributed to the entity by gravity in both x and y. This is superseded by the specific maxVelocityX and maxVelocityY values. Defaults to 3.
	  "xGravity" : 0,
	  //Optional - The gravitational acceleration in units/millisecond that the entity moves in x. Defaults to 0.
	  "yGravity" : .01,
	  //Optional - The gravitational acceleration in units/millisecond that the entity moves in y. Defaults to .01.
	  "gravity" : 0
	  //Optional - The gravitational acceleration in units/millisecond that the entity moves in y. This is superseded by the specific yGravity. Defaults to .01.
    }
*/

(function(){
	return platformer.createComponentClass({
		id: 'logic-gravity',
		
		constructor: function(definition){
			this.vY = definition.gravity || definition.yGravity;
			if(typeof this.vY !== 'number'){
				this.vY = .01;
			}
			this.vX = definition.xGravity || 0;
			
			this.maxVelocity = definition.maxVelocity || 0;
			this.newMaxX = this.maxVelocityX = definition.maxVelocityX || this.maxVelocity;
			this.newMaxY = this.maxVelocityY = definition.maxVelocityY || this.maxVelocity;
			this.accelerationX = 0;
			this.accelerationY = 0;
			this.durationX = 0;
			this.durationY = 0;
			
			if(typeof this.owner.dx !== 'number'){
				this.owner.dx = 0;
			}
			if(typeof this.owner.dy !== 'number'){
				this.owner.dy = 0;
			}
			
			this.state = this.owner.state;
			
			this.hovering = this.state.hovering = this.state.hovering || false;
			this.falling  = this.state.falling  = this.state.falling  || false;
			this.grounded = this.state.grounded = this.state.grounded || !this.falling;
		},
		
		events:{
			"handle-logic": function(resp){
				var deltaT = resp.deltaT;
				
				if(!this.hovering){
					if(this.newMaxX !== this.maxVelocityX){
						if(this.durationX - deltaT > 0){
							this.maxVelocityX += (this.newMaxX - this.maxVelocityX) * (deltaT / this.durationX);
							this.durationX -= deltaT;
						} else if(this.accelerationX){
							if(this.newMaxX > this.maxVelocityX){
								if(this.owner.dx > this.maxVelocityX) {
									this.maxVelocityX = this.owner.dx;
								}
								this.maxVelocityX = Math.min(this.maxVelocityX + (this.accelerationX * resp.deltaT), this.newMaxX);
							} else {
								if(this.owner.dx < this.maxVelocityX) {
									this.maxVelocityX = this.owner.dx;
								}
								this.maxVelocityX = Math.max(this.maxVelocityX - (this.accelerationX * resp.deltaT), this.newMaxX);
							}
						} else {
							this.maxVelocityX = this.newMaxX;
							this.durationX = 0;
						}
					}
					
					if(this.newMaxY !== this.maxVelocityY){
						if(this.durationY - deltaT > 0){
							this.maxVelocityY += (this.newMaxY - this.maxVelocityY) * (deltaT / this.durationY);
							this.durationY -= deltaT;
						} else if(this.accelerationY){
							if(this.newMaxY > this.maxVelocityY){
								if(this.owner.dy > this.maxVelocityY) {
									this.maxVelocityY = this.owner.dy;
								}
								this.maxVelocityY = Math.min(this.maxVelocityY + (this.accelerationY * resp.deltaT), this.newMaxY);
							} else {
								if(this.owner.dy < this.maxVelocityY) {
									this.maxVelocityY = this.owner.dy;
								}
								this.maxVelocityY = Math.max(this.maxVelocityY - (this.accelerationY * resp.deltaT), this.newMaxY);
							}
						} else {
							this.maxVelocityY = this.newMaxY;
							this.durationY = 0;
						}
					}
					
					this.owner.dx += this.vX * deltaT;
					this.owner.dy += this.vY * deltaT;
					
					if(this.vX && this.maxVelocityX && (this.owner.dx > this.maxVelocityX)){
						this.owner.dx = this.maxVelocityX;
					}
					if(this.vY && this.maxVelocityY && (this.owner.dy > this.maxVelocityY)){
						this.owner.dy = this.maxVelocityY;
					}
				}
				
				if(this.state.hovering !== this.hovering){
					this.state.hovering = this.hovering;
				}
				if(this.state.falling !== this.falling){
					this.state.falling = this.falling;
				}
				if(this.state.grounded !== this.grounded){
					this.state.grounded = this.grounded;
				}
				this.grounded = false;
				this.falling  = true;
			},
			"hit-solid": function(collisionInfo){
				if(!this.hovering){
					if(((collisionInfo.y > 0) && (this.vY > 0)) || ((collisionInfo.y < 0) && (this.vY < 0))){
						this.owner.dy = 0;
						this.falling = false;
						this.grounded = true;
					} else if(((collisionInfo.x < 0) && (this.vX < 0)) || ((collisionInfo.x > 0) && (this.vX > 0))){
						this.owner.dx = 0;
						this.falling = false;
						this.grounded = true;
					}
				}
				return true;
			},
			"glide": function(resp) {
				var max      = resp.maxVelocity || this.maxVelocity,
				duration     = resp.duration || 0,
				acceleration = resp.acceleration || 0;				
				
				this.durationX = resp.durationX || duration;
				this.durationY = resp.durationY || duration;
				
				this.accelerationX = resp.accelerationX || acceleration;
				this.accelerationY = resp.accelerationY || acceleration;
				
				this.newMaxX = resp.maxVelocityX || max || this.maxVelocityX;
				this.newMaxY = resp.maxVelocityY || max || this.maxVelocityY;
				
				if(!this.durationX && !this.accelerationX){
					this.maxVelocityX = this.newMaxX;
				}
				if(!this.durationY && !this.accelerationY){
					this.maxVelocityY = this.newMaxY;
				}
			},
			"gravitate": function(value) {
				this.vY = value.gravity || value.yGravity || 0;
				this.vX = value.xGravity || 0;
			},
			"hover": function(value){
				this.owner.dx = 0;
				this.owner.dy = 0;
				this.hovering = !value || (value.pressed !== false);
			},
			"fall": function(value){
				this.hovering = !!value && (value.pressed === false);
			}
		},
		
		methods: {
			destroy: function(){
				this.owner.dx = 0;
				this.owner.dy = 0;
			}
		}
	});
})();
