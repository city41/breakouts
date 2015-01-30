/**
# COMPONENT **logic-angular-movement**
This component changes the (x, y) position of an object according to its current speed and heading. It maintains its own heading information independent of other components allowing it to be used simultaneously with other logic components like [[Logic-Pushable]] and [[Logic-Gravity]].

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
  - @param message.deltaT - To determine how far to move the entity, the component checks the length of the tick.
- **set-angle** - On receiving this message, the entity adjusts its movement orientation.
  - @param angle (number) - Number in radians to set the orientation of the entity.
- **stop** - Stops motion until a `move` message is received.
- **move** - Begins motion until a `stop` message is received.

## JSON Definition:
    {
      "type": "logic-angular-movement",
      
      "maxVelocity": 4.5,
      // Optional. Defines the distance in world units that the entity should be moved per millisecond. Defaults to 3.
      
      "acceleration": .04
      // Optional. Defines how quickly the entity should accelerate. Defaults to 0.01.
      
      "visualOrientationOffset": 1.57
      // Optional. Defines how much to rotate the image in addition to the movement rotation.
    }
*/
(function(){

	return platformer.createComponentClass({
		
		id: 'logic-angular-movement', 
		
		constructor: function(definition){
			this.angle     = 0;
			this.v         = [0,0];
			this.maxV      = this.owner.maxVelocity  || definition.maxVelocity  || 3;
			this.a         = this.owner.acceleration || definition.acceleration || .01;
			this.moving    = false;
			this.piOverTwo = Math.PI / 2;
			this.visualOffset = definition.visualOrientationOffset || 0;
			this.owner.orientation = this.owner.orientation || this.visualOffset;
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(update){
				var deltaT = update.deltaT;
				var currentAngle = 0;
				if (this.moving)
				{
					this.v[0] += this.a * Math.cos(this.angle) * deltaT;
					this.v[1] += this.a * Math.sin(this.angle) * deltaT;
					if (this.v[0] == 0)
					{
						if (this.v[1] > 0) {
							currentAngle = this.piOverTwo;
						} else if (this.v[1] < 0) {
							currentAngle = -this.piOverTwo;
						} else {
							currentAngle = this.angle;
						}
					} else {
						currentAngle = Math.atan(this.v[1]/this.v[0]);
						if (this.v[0] < 0) {
							currentAngle = Math.PI + currentAngle;
						}
					}
					if (this.v[0] >= 0) {
						this.v[0] = Math.min(this.v[0], this.maxV * Math.cos(currentAngle));
					} else {
						this.v[0] = Math.max(this.v[0], this.maxV * Math.cos(currentAngle));
					}
					if (this.v[1] >= 0) {
						this.v[1] = Math.min(this.v[1], this.maxV * Math.sin(currentAngle));
					} else {
						this.v[1] = Math.max(this.v[1], this.maxV * Math.sin(currentAngle));
					}
					
					this.owner.x += this.v[0];
					this.owner.y += this.v[1];
					this.owner.orientation = currentAngle + this.visualOffset;
				}				
			},
			"set-angle": function(angle){
				this.angle = angle;
			},
			"move": function(){
				this.moving = true;
			},
			"stop": function(){
				this.moving = false;
			}
		}
	});
})();