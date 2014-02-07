/**
# COMPONENT **random-events**
This component listens for certain messages, picks a message from a related list of events, and triggers it. This is useful for adding random behaviors to an entity, such as having an entity say one thing from a list of audio clips.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for messages and on receiving them, triggers a random message from the JSON-defined list.
  - @param message (any) - If a message object comes in with the event, it is passed along with the selected random message.

### Local Broadcasts:
- **[Messages specified in definition]** - On receiving a recognized message, this component triggers one message from a JSON-defined list.
  - @param message (any) - If a message object comes in with the triggered event, it is passed along with the selected random message.

## JSON Definition
    {
      "type": "random-events"
      
      "events"{
      // This is a key/value list of events to listen for, with each event mapping to an array of events to pick from.
      
        "make-sound": ["scream", "whisper", "talk"]
        //on the component receiving the "make-sound" message, it will trigger one of the three possible messages listed here.
      }
    }
*/
(function(){
	var createTrigger = function(eventList){
		return function(value, debug){
			this.owner.trigger(eventList[Math.floor(Math.random() * eventList.length)], value, debug);
		};
	};

	return platformer.createComponentClass({
		id: 'random-events',
		
		constructor: function(definition){
			if(definition.events){
				for(var event in definition.events){
					this[event] = createTrigger(definition.events[event]);
					this.addListener(event);
				}
			}
		}
	});
})();
