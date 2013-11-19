/**
# COMPONENT **logic-impact-launch**
This component will cause the entity to move in a certain direction on colliding with another entity.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
- **impact-launch** - On receiving this message, the component causes the entity's position to change according to the preset behavior.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.
- **[Message specified in definition]** - An alternative message can be specified in the JSON definition that will also cause the impact-launch.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.
- **hit-solid** - On receiving this message, the component discontinues its impact-launch behavior.
  - @param collisionInfo.y (number) - Either 1,0, or -1. If colliding below, impact-launch behavior ceases.

## JSON Definition:
    {
      "type": "logic-impact-launch",
      
      "message": "do-action",
      // Optional: If specified, this message will cause the entity to impact-launch on this message in addition to "impact-launch".
      
      "state": "launching",
      // Optional: This sets the state of the entity while it's being launched. Defaults to "stunned".
      
      "accelerationX": 5,
      "accelerationY": 5,
      // Optional: acceleration entity should have in world units while being launched. Defaults to -0.2 for x and -0.6 for y.
      
      "flipX": true,
      "flipY": true
      // Optional: whether the directions of acceleration should flip according to the direction of the collision. Defaults to false for y and true for x.
    }

*/
(function(){
	return platformer.createComponentClass({
		id: 'logic-impact-launch',
		constructor: function(definition){
			if(definition.message){
				this.addListener(definition.message);
				this[definition.message] = this['impact-launch'];
			}
			this.stunState = definition.state || "stunned";
			
			this.aX = this.owner.accelerationX || definition.accelerationX || -0.2;
			this.aY = this.owner.accelerationY || definition.accelerationY || -0.6;
			this.flipX = ((this.owner.flipX === false) || ((this.owner.flipX !== true) && (definition.flipX === false)))?1:-1;
			this.flipY = (this.owner.flipY || definition.flipY)?-1:1;
			this.mX = 1;
			this.mY = 1;
			
			if(typeof this.owner.dx !== 'number'){
				this.owner.dx = 0;
			}
			if(typeof this.owner.dy !== 'number'){
				this.owner.dy = 0;
			}
			
			this.justJumped = false;
			this.stunned = false;
			
			this.state = this.owner.state;
			this.state.impact  = false;
			this.state[this.stunState] = false;
		},
		
		events:{
			"handle-logic": function(){
				if(this.state.impact !== this.justJumped){
					this.state.impact = this.justJumped;
				}
				if(this.state[this.stunState] !== this.stunned){
					this.state[this.stunState] = this.stunned;
				}

				if(this.justJumped){
					this.justJumped = false;
					this.stunned = true;
					this.owner.dx = this.aX * this.mX;
					this.owner.dy = this.aY * this.mY;
				}
			},
			
			"impact-launch": function(collisionInfo){
				var dx = collisionInfo.x,
				dy     = collisionInfo.y;
				
				if(collisionInfo.entity){
					dx = collisionInfo.entity.x - this.owner.x;
					dy = collisionInfo.entity.y - this.owner.y;
				}

				if(!this.stunned) {
					this.justJumped = true;
					this.owner.dx = 0;
					if(dx > 0){
						this.mX = 1;
					} else if(dx < 0){
						this.mX = this.flipX;
					}
					this.owner.dy = 0;
					if(dy > 0){
						this.mY = 1;
					} else if(dy < 0){
						this.mY = this.flipY;
					}
				}
				return true;
			},
			
			"hit-solid": function(collisionInfo){
				if(this.stunned && (collisionInfo.y > 0)){
					this.stunned = false;
					this.owner.dx = 0;
					this.owner.dy = 0;
				}
				return true;
			}
		}
	});
})();
