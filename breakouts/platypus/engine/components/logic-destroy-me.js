/**
# COMPONENT **logic-destroy-me**
This component allows an entity to be removed from the stage when "destroy-me" is triggered.

## Dependencies
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message on which to enact its removal if necessary.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component checks whether it should be removed or not.
  - @param message.deltaT - To measure delay before removal, the component keeps a running count of tick lengths.
- **destroy-me** - This component will set itself up for removal on hearing this message.

## JSON Definition
    {
      "type": "logic-destroy-me",
      
      "delay": 3000,
      // Optional. Time in milliseconds after the "destroy-me" message is heard before entity should be removed. Defaults to 0.
    }
*/

(function(){
	return platformer.createComponentClass({	
		id: 'logic-destroy-me',
		
		constructor: function(definition){
			this.destroyed = false;
			this.delay = definition.delay || 0;
		},

		events: {// These are messages that this component listens for
			
			"handle-logic": function(tick){
				var dT = tick.deltaT;
				if (this.destroyed)
				{
					this.delay -= dT;
					if (this.delay <= 0) {
						this.owner.parent.removeEntity(this.owner);
					}
				}
			},
			"destroy-me": function(){
				this.destroyed = true;
			}
				   
		}
	});
})();
