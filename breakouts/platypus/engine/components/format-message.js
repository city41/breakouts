/**
# COMPONENT **format-message**
This component dynamically creates a message from JSON settings and incoming message data. This is useful for simulating a very simple logic component rather than creating a new component to handle a simplistic reformatting of messages. However, this component uses "new Function" to convert a string to a function, which is not recommended behavior.

## JSON Definition
    {
      "type": "format-message",
      
      "messages": {
      // Messages that this component should listen for.
      
        "scene-loaded": {
        // When "scene-loaded" is triggered on this entity, it will trigger a message as follows:
        
          "event": "show-hero",
          // This is the event to trigger.
          
          "message": "{color: source.persistentData.hero.color, name: source.persistentData.hero.name}"
          // This is a message whose contents can change depending on the triggered message's contents. The triggered message contents come in as "source".
        },
        
        "tasted": {
        // When "tasted" is triggered, the following custom event is triggered:
        
          "customEvent": "entity.flavor + \"-burst\""
          // If entity.flavor = "grape", the "tasted" message will trigger "grape-burst"
        }
      }
    }
*/

//TODO: Edit this component to parse strings without using "new Function" - DDD

(function(){
	var createNewMessage = function(messageFormat, entity){
		var convert = null,
		event = messageFormat.event || (new Function('entity', 'return ' + messageFormat.customEvent + ';'))(entity);
		
		if(messageFormat.message){
			convert = new Function('source', 'return ' + messageFormat.message + ';');
			return function(message){
				entity.trigger(event, convert(message));
			};
		} else {
			return function(message){
				entity.trigger(event);
			};
		}
	};

	return platformer.createComponentClass({
		id: 'format-message',
		
		constructor: function(definition){
			var event = null;
			
			if(definition.messages){
				for(event in definition.messages){
					this[event] = createNewMessage(definition.messages[event], this.owner);
					this.addListener(event);
				}
			}
		}
	});
})();
