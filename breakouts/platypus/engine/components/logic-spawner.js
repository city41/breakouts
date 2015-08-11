/**
# COMPONENT **logic-spawner**
This component creates an entity and propels it away. This is useful for casting, firing, tossing, and related behaviors.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to determine whether it should be spawning or not.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component checks its current state to decide whether to spawn entities.
- **spawn** - creates an entity on the following tick message.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: false results in no entities being created. Is this primarily for controller input.

## JSON Definition
    {
      "type": "logic-spawner"
      // List all additional parameters and their possible values here.

      "spawneeClass": "wet-noodle",
      // Required: string identifying the type of entity to create.
      
      "state": "tossing",
      // Optional. The entity state that should be true while entities are being created. Defaults to "firing".
      
      "speed": 4,
      // Optional. The velocity with which the entity should start. Initial direction is determined by this entity's facing states ("top", "right", etc).
      
      "offsetX": 45,
      "offsetY": -20,
      // Optional. Location relative to the entity where the should be located once created. Defaults to (0, 0).
    }
*/
(function(){
	return platformer.createComponentClass({
		
		id: 'logic-spawner',
		
		constructor: function(definition){
			this.state = this.owner.state;
			this.stateName = definition.state || 'spawning';
			var className = this.owner.spawneeClass || definition.spawneeClass;
			this.entityClass = platformer.settings.entities[className];
			this.speed = definition.speed || this.owner.speed || 0;

			this.state[this.stateName] = false;
			
			this.spawneeProperties = {
				x:0,
				y:0,
				z:0,
				dx: 0,
				dy: 0
			};
			
			var prop;
			if (definition.passOnProperties) {
				for (var x = 0; x < definition.passOnProperties.length; x++) {
					prop = definition.passOnProperties[x];
					if (this.owner[prop]) {
						this.spawneeProperties[prop] = this.owner[prop];
					}
				}
			}
			
			
			this.propertiesContainer = {
				properties: this.spawneeProperties
			};
			
			this.offsetX = this.owner.offsetX || definition.offsetX || 0;
			this.offsetY = this.owner.offsetY || definition.offsetY || 0;
			
			this.firing = false;
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(){
				var offset = 0;
				var classZ = 0;
				var state = this.state;
				
				if(this.firing){
					this.spawneeProperties.x = this.owner.x;
					this.spawneeProperties.y = this.owner.y;
					classZ = (this.entityClass.properties && this.entityClass.properties.z) ? this.entityClass.properties.z : 0;
					this.spawneeProperties.z = this.owner.z + classZ;
					
					offset = this.offsetX;
					if(state.left){
						offset *= -1;
					}
					this.spawneeProperties.x += offset;
					
					offset = this.offsetY;
					if(state.top){
						offset *= -1;
					}
					this.spawneeProperties.y += offset;
					
					if(this.speed){
						if(state.top){
							this.spawneeProperties.dy = -this.speed;
						} else if (state.bottom) {
							this.spawneeProperties.dy = this.speed;
						} else {
							delete this.spawneeProperties.dy;
						}
						if(state.left){
							this.spawneeProperties.dx = -this.speed;
						} else if (state.right) {
							this.spawneeProperties.dx = this.speed;
						} else {
							delete this.spawneeProperties.dx;
						}
					}
					
					this.owner.parent.addEntity(new platformer.classes.entity(this.entityClass, this.propertiesContainer));
				}
				
				if(state[this.stateName] !== this.firing){
					state[this.stateName] = this.firing;
				}

				this.firing = false;
			},
			"spawn": function(value){
				this.firing = !value || (value.pressed !== false);
			}
		}
	});
})();
