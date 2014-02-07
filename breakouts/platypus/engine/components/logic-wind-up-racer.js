/**
# COMPONENT **logic-wind-up-racer**
Replicates logic for a wind-up toy: listens for a wind-up message over a series of ticks to charge, and then begins racing once the charge is complete.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its charging counter if necessary.
  - @param message.deltaT - To determine how much to charge, the component checks the length of the tick.
- **wind-up, [equivalent message]** - creates and connects the shield entity to this entity.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: false causes a "drop-shield" behavior.
- **stop-racing** - stops the entity movement.
- **hit-solid** - On receiving this message, the entity stops racing.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 

### Local Broadcasts:
- **winding** - This message is triggered when the entity begins winding up.
- **stopped-winding** - This message is triggered when the entity stops winding.
- **racing** - This message is triggered when winding is finished and the entity begins racing.
- **stopped-racing** - This message is triggered when the entity stops racing.
- **blocked** - This message is triggered if the entity collides while racing.
  - @param message (object) - Collision information from the "hit-solid" message. 

## JSON Definition
    {
      "type": "logic-wind-up-racer",

      "windTime": 1000,
      // Optional. Time in milliseconds that entity needs to receive wind-up calls before racing can begin. Defaults to 500.
      
      "raceTime": 4000,
      // Optional. Time in milliseconds that entity will race before coming to a stop. Defaults to 5000.
      
      "speed": 1,
      // Optional. Velocity at which the entity should travel while racing. Defaults to 0.3.
      
      "message": "do-action"
      // Optional: If specified, this message will cause the entity to wind up on this message in addition to "wind-up".
    }
*/
(function(){
	return platformer.createComponentClass({
		
		id: 'logic-wind-up-racer',
		
		constructor: function(definition){
			this.windTime = definition.windTime || 500;
			this.raceTime = definition.raceTime || 5000;
			this.speed = definition.speed || this.owner.speed || 0.3;
			
			this.windProgress = 0;
			
			this.winding = false;
			this.racing = false;
			this.blocked = false;
			this.right = false;
			this.left = false;
			
			this.state = this.owner.state;
			this.state.windingUp = false;
			this.state.racing = false;
			this.state.blocked = false;
			
			if(definition.message){
				this.addListener(definition.message);
				this[definition.message] = this['wind-up'];
			}
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(resp){
				if(this.racing){
					if(!this.blocked && this.right && this.state.right){
						this.owner.x += this.speed;
						this.owner.trigger('racing');
					} else if(!this.blocked && this.left && this.state.left){
						this.owner.x -= this.speed;
						this.owner.trigger('racing');
					} else {
						this.racing = false;
						this.owner.trigger('stopped-racing');
					}
				} else {
					if(this.winding){
						if((this.right && this.state.right) || (this.left && this.state.left)){
							this.windProgress += resp.deltaT;
						}
						this.owner.trigger('winding');
					} else {
						if(this.windProgress){
							if(this.windProgress > this.windTime){
								this.racing = true;
							}
							this.windProgress = 0;
							this.owner.trigger('stopped-winding');
						}
					}
				}
				
				if(this.state.windingUp !== this.winding){
					this.state.windingUp = this.winding;
				}
				if(this.state.racing !== this.racing){
					this.state.racing = this.racing;
				}
				if(this.state.blocked !== this.blocked){
					this.state.blocked = this.blocked;
				}
				
				this.blocked = false;
			},
			"stop-racing": function(value){
				this.racing = false;
				this.owner.trigger('stopped-racing');
			},
			"wind-up": function(value){
				this.winding = !value || (value.pressed !== false);
				this.right = this.state.right;
				this.left  = this.state.left;
			},
			"hit-solid": function(collision){
				if(collision.x){
					if(this.racing && ((this.right && (collision.x > 0)) || (this.left && (collision.x < 0)))){
						this.blocked = true;
						this.owner.trigger('blocked', collision);
					}
				}
			}
		},
	
		methods:{
			destroy: function(){
				this.state.windingUp = false;
				this.state.racing = false;
				this.state.blocked = false;
			}			
		}
	});
})();
