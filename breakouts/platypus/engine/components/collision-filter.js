/**
# COMPONENT **collision-filter**
This component will listen for a particular collision message and, depending on a given entity.state attribute, retrigger the collision as another collision message.

## Dependencies:
- [[Collision-Basic]] (on entity) - This component listens for a particular collision event triggered by the collision-basic component.

### Listens for:
- **animation-complete** - On receiving this message, the component match the animation id with its animation id setting and destroy the entity if they match.
  - @param animationId (string) - animation id for the animation that just finished.

## JSON Definition:
    {
      "type": "chaff",
      
      "state": "allergic",
      // The entity state that should cause the following list of collisions to trigger events. If this state is not true, no events are triggered.
      
      "collisions": {
      // One or more collision events for which to listen.
        
        "hitting-flowers": "sneeze",
        // Listen for "hitting-flowers", and if the entity is "allergic", trigger a "sneeze" event.
        
        "in-the-weeds": "cough"
        // Another collision event that triggers "cough" if the entity is "allergic".
      }
    }
*/
(function(){
	var collide = function(entity, state, event){
		return function(collInfo){
			if (entity.state[state]) {
				entity.trigger(event, collInfo);
			}
		};
	};
	
	return platformer.createComponentClass({
		id: 'collision-filter',
		constructor: function(definition){
			var event = null;
			
			if(definition.collisions) {
				for(event in definition.collisions){
					this[event] = collide(this.owner, definition.state, definition.collisions[event]);
					this.addListener(event);
				}
			}
		}
	});
})();
