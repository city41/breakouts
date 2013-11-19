/**
# COMPONENT **ai-chaser**
This component acts as a simple AI that will chase another entity.

## Dependencies:
- [[collision-basic]] (on entity) - This component listens for collision messages on the entity.
- [[logic-angular-movement]] (on entity) - This component triggers messages for this component which moves the entity.
- [[handler-ai]] (on entity's parent) - This component listens for an ai "tick" message to orderly perform its control logic.

## Messages

### Listens for:
- **handle-ai** - This AI listens for a step message triggered by its entity parent in order to perform its logic on each tick.
- **set-target** - On receiving this message, the component will change its target and begin chasing the new entity.
  - @param message ([[Entity]]) - Sets this entity's target to the provided entity.
- **start-chasing** - On receiving this message, the component will begin chasing the entity.
- **stop-chasing** - On receiving this message, the component will cease chasing the entity.

### Local Broadcasts:
- **stop** - Triggered by this component before triggering another direction.
- **set-angle** - Triggered to direct the entity toward the entity it is chasing.
- **move** - Triggered once a target is set to begin moving toward the target.

## JSON Definition:
    {
      "type": "ai-chaser"
    }
*/

(function(){

	return platformer.createComponentClass({
		
		id: 'ai-chaser', 
		
		constructor: function(definition){
			this.target = null;
			this.piOverTwo = Math.PI / 2;
			this.prevAngle = 0;
			this.chasing = true;
		},

		events: {// These are messages that this component listens for
			"handle-ai": function(){
				if (this.target && this.chasing)
				{
					//figure out angle
					this.owner.trigger('move');
					var angle = 0;
					var dX = this.target.x - this.owner.x;
					var dY = this.target.y - this.owner.y;
					if (dX == 0)
					{
						if (dY > 0) {
							angle = this.piOverTwo;
						} else if (dY < 0) {
							angle = -this.piOverTwo;
						} else {
							angle = this.prevAngle;
							this.owner.trigger('stop');
						}
					} else {
						angle = Math.atan(dY/dX);
						if (dX < 0) {
							angle = Math.PI + angle;
						}
					}
					this.owner.trigger('set-angle', angle);
					this.prevAngle = angle;
				} else {
					this.owner.trigger('stop');
				}
			},
			"set-target": function(entity){
				this.target = entity;
			},
			"start-chasing": function(){
				this.chasing = true;
			},
			"stop-chasing": function(){
				this.chasing = false;
			}
				   
		},
		
		methods: {// These are methods that are called on the component
			destroy: function(){
				this.target = null;
			}
		}
		
	});
})();