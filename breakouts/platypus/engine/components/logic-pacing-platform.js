/**
# COMPONENT **logic-pacing-platform**
This component changes the (x, y) position of an object according to its speed and heading and alternates back and forth. This is useful for in-place moving platforms.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
  - @param message.deltaT - To determine how far to move the entity, the component checks the length of the tick.

## JSON Definition:
    {
      "type": "logic-directional-movement",
      
      "angle": 3.14,
      // Optional. Defines the angle of movement in radians. Defaults to 0 (horizontal, starts moving right).
      
      "distance": 440,
      // Optional. Declares distance in world units that the entity should move back and forth across. Defaults to 128.
      
      "period": 6000,
      // Optional. Sets the time in milliseconds that the entity should take to make a complete movement cycle. Defaults to 4 seconds (4000).
      
      "startPos": 0
      // Optional. Position in the cycle that the movement should begin. Defaults in the middle at 0; PI/2 and -PI/2 will put you at the extremes.
    }
*/
(function(){

	return platformer.createComponentClass({
		
		id: 'logic-pacing-platform',
		
		constructor: function(definition){
			this.ang		      = this.owner.angle 	 || definition.angle 	|| 0; //PI/2 makes it go down first
			this.dist			  = this.owner.distance || definition.distance || 128; //Distance in pixels
			this.period			  = this.owner.period	|| definition.period 	|| 4000;
			this.time			  = 0;
			this.startPos		  = this.owner.startPos || definition.startPos || 0; //PI/2 and -PI/2 will put you at the extremes
			this.offset 	  	  = 0;
			this.originX		  = this.owner.x;
			this.originY		  = this.owner.y;
		},

		events: {// These are messages that this component listens for
			'handle-logic': function (update){
				var deltaT = update.deltaT;
				
				this.time += deltaT;
				if (this.time > this.period) {
					this.time = this.time % this.period;
				}
				this.offset = (this.time / this.period) * (2 * Math.PI);
				
				this.owner.x = this.originX + Math.sin(this.offset + this.startPos) * this.dist * Math.cos(this.ang);
				this.owner.y = this.originY + Math.sin(this.offset + this.startPos) * this.dist * Math.sin(this.ang);
			}
		}
	});
})();
