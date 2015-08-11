/**
# COMPONENT **broadcast-events**
This component listens for specified local entity messages and re-broadcasts them on itself, its parent entity, or at the game level.

**Note:** Make sure that this component is never set up to receive and broadcast identical messages or an infinite loop will result, since it will receive the same message it sent.

## Dependencies:
- [[Entity-Container]] (on entity's parent) - This component can broadcast messages to its parent; `this.parent` is commonly specified by being a member of an entity container.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages.
  - @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Local Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages on the entity.
  - @param message (object) - sends the message object received by the original message.

### Parent Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages on the entity's parent if one exists.
  - @param message (object) - sends the message object received by the original message.

### Game Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages at the top game level.
  - @param message (object) - sends the message object received by the original message.

## JSON Definition:
    {
      "type": "broadcast-events",
      
      // One of the following event mappings must be specified: "events", "parentEvents", or "renameEvents".
      
      "events": {
      // Optional: Maps local messages to trigger global game messages. At least one of the following mappings should be included.
        
        "local-message-1": "global-game-message",
        // On receiving "local-message-1", triggers "global-game-message" at the game level.
        
        "local-message-2": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-2", triggers each message in the array in sequence at the game level.
      }
      
      "parentEvents": {
      // Optional: Maps local messages to trigger messages on the entity's parent. At least one of the following mappings should be included.
        
        "local-message-3": "parent-message",
        // On receiving "local-message-3", triggers "parent-message" on the entity's parent.
        
        "local-message-4": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-4", triggers each message in the array in sequence on the entity's parent.
      }
      
      "renameEvents": {
      // Optional: Maps local messages to trigger alternative messages on the entity itself. This can be useful as a basic fill-in for a logic component to translate an outgoing message from one component into an incoming message for another. At least one of the following mappings should be included.
        
        "local-message-5": "another-local-message",
        // On receiving "local-message-5", triggers "another-local-message" on the entity itself.
        
        "local-message-6": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-6", triggers each message in the array in sequence on the entity itself.
      }
    }
*/
platformer.components['broadcast-events'] = (function(){
	var gameBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value, debug){
				platformer.game.currentScene.trigger(event, value, debug);
			};
		} else {
			return function(value, debug){
				for (var e in event){
					platformer.game.currentScene.trigger(event[e], value, debug);
				}
			};
		}
	};
	
	var parentBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value, debug){
				if(this.owner.parent)
				{
					this.owner.parent.trigger(event, value, debug);
				}
				
			};
		} else {
			return function(value, debug){
				for (var e in event){
					this.owner.parent.trigger(event[e], value, debug);
				}
			};
		}
	};
	
	var entityBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value, debug){
				this.owner.trigger(event, value, debug);
			};
		} else {
			return function(value, debug){
				for (var e in event){
					this.owner.trigger(event[e], value, debug);
				}
			};
		}
	};
	
	var component = function(owner, definition){
		this.owner = owner;

		// Messages that this component listens for and then broadcasts to all layers.
		this.listeners = [];
		if(definition.events){
			for(var event in definition.events){
				this[event] = gameBroadcast(definition.events[event]);
				this.addListener(event);
			}
		}
		
		if(definition.parentEvents){
			for(var event in definition.parentEvents){
				this[event] = parentBroadcast(definition.parentEvents[event]);
				this.addListener(event);
			}
		}
		
		// Messages that this component listens for and then triggers on itself as a renamed message - useful as a logic place-holder for simple entities.
		if(definition.renameEvents){
			for(var event in definition.renameEvents){
				this[event] = entityBroadcast(definition.renameEvents[event]);
				this.addListener(event);
			}
		}
	};
	var proto = component.prototype;
	
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
