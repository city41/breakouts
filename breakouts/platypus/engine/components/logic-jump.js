/**
# COMPONENT **logic-jump**
This component will cause the entity to jump with a certain amount of acceleration for a certain period of time.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
- **jump** - On receiving this message, the component causes the entity's position to change according to the preset behavior.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not make it jump.
- **[Message specified in definition]** - An alternative message can be specified in the JSON definition that will also cause the jump.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not make it jump.
- **hit-solid** - On receiving this message, the component discontinues its jump velocity.
  - @param collisionInfo.x (number) - Either 1,0, or -1. Zeros out the jump velocity if acceleration is in the contrary direction.
  - @param collisionInfo.y (number) - Either 1,0, or -1. Zeros out the jump velocity if acceleration is in the contrary direction.

### Local Broadcasts:
- **just-jumped** - this component will trigger this message when it receives a "jump" message and is able to jump. This is useful for tying in a jump sound.

## JSON Definition:
    {
      "type": "logic-jump",
      
      "message": "do-action",
      // Optional: If specified, this message will cause the entity to jump on this message in addition to "jump".
      
      "accelerationX": 0.2,
      "accelerationY": -0.07,
      // Acceleration of the jump. Defaults to -4 for y, 0 for x.
      
      "time": 500
      // Optional: Time in milliseconds that the jump can continue being powered by the message input; defaults to 0 which causes instantaneous jumping behavior (and thus should have a substantially larger acceleration than applying jump acceleration over time). Defaults to 0.
    }

*/
(function(){
	return platformer.createComponentClass({
		id: 'logic-jump',
		constructor: function(definition){
			if(definition.message){
				this.addListener(definition.message);
				this[definition.message] = this['jump'];
			}
			
			this.aX = this.owner.accelerationX || definition.accelerationX || 0;
			this.aY = this.owner.accelerationY || definition.accelerationY;
			if(typeof this.aY !== 'number'){
				this.aY = -4;
			}
			if(typeof this.owner.dx !== 'number'){
				this.owner.dx = 0;
			}
			if(typeof this.owner.dy !== 'number'){
				this.owner.dy = 0;
			}
			
			this.time = definition.time || 0;
			
			this.jumpLength = 0;
			
			this.jumping = false;
			this.justJumped = false;
			this.grounded = true;
			
			this.state = this.owner.state;
			this.state.jumping    = false;
			this.state.justJumped = false;
		},
		
		events:{
			"handle-logic": function(resp){
				var deltaT   = resp.deltaT;
				
				if(this.state.justJumped !== this.justJumped){
					this.state.justJumped = this.justJumped;
				}

				if(this.justJumped){
					this.justJumped = false;
					this.jumpLength = this.time;
					this.owner.triggerEvent("just-jumped");
				}
				
				if(this.state.jumping !== this.jumping){
					this.state.jumping = this.jumping;
				}

				if(this.jumping){
					if(this.time){
						this.owner.dx += this.aX * deltaT;
						this.owner.dy += this.aY * deltaT;
						
						this.jumpLength -= deltaT;
						if(this.jumpLength < 0){
							this.jumping = false;
						}
					} else {
						this.owner.dx = this.aX;
						this.owner.dy = this.aY;

						this.jumping = false;
					}
				}
				
				this.grounded = false;
			},
			
			"jump": function(state){
				var jumping = false;
				
				if(state){
					jumping = (state.pressed !== false);
				} else {
					jumping = true;
				}

				if(!this.jumping && jumping && this.grounded){
					this.justJumped = true;
					this.jumping = true;
				} else if (this.jumping && !jumping) {
					this.jumping = false;
				}
			},
			
			"hit-solid": function(collisionInfo){
				if(!this.justJumped){
					if(collisionInfo.y){
						this.owner.dy = 0;
						if(((collisionInfo.y > 0) && (this.aY < 0)) || ((collisionInfo.y < 0) && (this.aY > 0))){
							this.jumping = false;
							this.grounded = true;
						}
					} else if(collisionInfo.x){
						this.owner.dx = 0;
						if(((collisionInfo.x < 0) && (this.aX > 0)) || ((collisionInfo.x > 0) && (this.aX < 0))){
							this.jumping = false;
							this.grounded = true;
						}
					}
				}
				return true;
			}
		}
	});
})();
