/**
# COMPONENT **ai-pacer**
This component acts as a simple AI that will reverse the movement direction of an object when it collides with something.

## Dependencies:
- [[Collision-Basic]] (on entity) - This component listens for collision messages on the entity.
- [[Logic-Directional-Movement]] (on entity) - This component receives triggered messages from this component and moves the entity accordingly.
- [[Handler-Ai]] (on entity's parent) - This component listens for an ai "tick" message to orderly perform its control logic.

## Messages

### Listens for:
- **handle-ai** - This AI listens for a step message triggered by its entity parent in order to perform its logic on each tick.
- **turn-around** - On receiving this message, the component will check the collision side and re-orient itself accordingly.
  - @param message.x (integer) - uses `x` to determine if collision occurred on the left (-1) or right (1) of this entity.
  - @param message.y (integer) - uses `y` to determine if collision occurred on the top (-1) or bottom (1) of this entity.

### Local Broadcasts:
- **stop** - Triggered by this component before triggering another direction.
- **go-down**, **go-left**, **go-up**, **go-right** - Triggered in response to an entity colliding from the opposing side.

## JSON Definition:
    {
      "type": "ai-pacer",
      
      "movement": "horizontal",
      // Optional: "vertical", "horizontal", or "both". If nothing is specified, entity changes direction when colliding from any direction ("both").
      
      "direction": "up"
      // Optional: "up", "right", "down", or "left". This specifies the initial direction of movement. Defaults to "up", or "left" if `movement` is horizontal.
    }
*/
(function(){
	return platformer.createComponentClass({
		id: "ai-pacer",
		
		constructor: function(definition){
			this.movement         = definition.movement  || 'both';
			this.lastDirection    = '';
			this.currentDirection = definition.direction || ((this.movement === 'horizontal')?'left':'up');
		},
		
		events: {
			"handle-ai": function(obj){
				if(this.currentDirection !== this.lastDirection){
					this.lastDirection = this.currentDirection;
					this.owner.trigger('stop');
					this.owner.trigger('go-' + this.currentDirection);
				}
			},
			
			"turn-around": function(collisionInfo){
				if ((this.movement === 'both') || (this.movement === 'horizontal')){
					if(collisionInfo.x > 0){
						this.currentDirection = 'left';
					} else if (collisionInfo.x < 0) {
						this.currentDirection = 'right';
					}
				} 
				if ((this.movement === 'both') || (this.movement === 'vertical')){
					if(collisionInfo.y > 0){
						this.currentDirection = 'up';
					} else if (collisionInfo.y < 0) {
						this.currentDirection = 'down';
					}
				} 
			}
		}
	});
})();
