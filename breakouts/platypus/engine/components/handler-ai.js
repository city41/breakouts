/**
# COMPONENT **handler-ai**
A component that handles updating ai components. Each tick it calls all the entities that accept 'handle-ai' messages.

## Dependencies
- **Needs a 'tick' call** - This component doesn't need a specific component, but it does require a 'tick' call to function. It's usually used as a component of an action-layer.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-ai' message id it's added to the list of entities. 
  - @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick** - Sends a 'handle-ai' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
  - @param obj (object) - An object containing deltaT which is the time passed since the last tick. 

### Child Broadcasts:
- **handle-ai** - Sent to entities to run their ai for the tick.
  - @param object - An object containing a deltaT variable that is the time that's passed since the last tick.

## JSON Definition
    {
      "type": "handler-ai",
    }
*/

platformer.components['handler-ai'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['child-entity-added', 'tick']);  
		
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'handle-ai')
			{
				this.entities.push(entity);
				break;
			}
		}
	};

	proto['tick'] = function(obj){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('handle-ai', obj))
			{
				this.entities.splice(x, 1);
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value, debug){
			self[messageId](value, debug);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
