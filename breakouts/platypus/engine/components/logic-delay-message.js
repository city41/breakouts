/**
# COMPONENT **logic-delay-message**
This component allows certain messages to trigger new messages at a later time. This is useful for any sort of delayed reaction to events.

## Dependencies
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component checks the running counts on its delayed messages to determine whether to trigger any.
  - @param message.deltaT - To determine whether to trigger messages, the component keeps a running count of tick lengths.
- **[input messages]** - This component listens for messages as determined by the JSON settings.

### Local Broadcasts:
- **[output messages]** - This component triggers output messages as determined by the JSON settings.

## JSON Definition
    {
      "type": "logic-delay-message",
      
      "events": {
      // Required: This is a list of event objects that should be listened for, and the messages that they should trigger at some time in the future.
      
        "saw-clown": {
        // This component will use the following to determine when and what to send on hearing the "saw-clown" event.
        
          "event": "laugh",
          // This component will trigger "laugh"
          
          "message": {"feeling": "happy", "sincerity": "85%"}
          // This can be a value or object to pass as the message content with the "laugh" event.
          
          "delay": 1500,
          // This is the delay in milliseconds before which the new message should be triggered.
          
          "singleInstance": true,
          // This determines whether more "saw-clown" events triggered during the delayed response period should be treated as new messages to be triggered or whether the initial instance prevents additional instances from occurring.

          "cancelEvent": "dropped-popcorn"
          // If set, on receiving this event, the component will not trigger the "laugh" event after all if it's currently planning to.
        },
        
        // Multiple delay messages can be set up on this component.
        "move-right":{
          "event": "look-left",
          "delay": 7000
        }
      
      }
    }
*/
(function(){
	var createMessage = function(event){
		if(event.singleInstance){
			return function(){
				var i = 0,
				add = true;
				
				for (; i < this.queue.length; i++){
					if(this.queue[i] === event){
						add = false;
					}
				}
				
				if(add){
					this.queue.push(event);
					this.queueTimes.push(event.delay);
				}
			};
		} else {
			return function(){
				this.queue.push(event);
				this.queueTimes.push(event.delay);
			};
		}
	},
	createCancellation = function(cancelEvent){
		return function(){
			var i = this.queue.length - 1;
			
			for (; i > -1; i--){
				if(this.queue[i] === cancelEvent){
					this.queueTimes.splice(i,1);
					this.queue.splice(i,1);
				}
			}
		};
	};

	return platformer.createComponentClass({
		id: 'logic-delay-message',
		
		constructor: function(definition){
			this.queueTimes = [];
			this.queue = [];
			
			if(definition.events){
				for(var event in definition.events){
					this[event] = createMessage(definition.events[event]);
					this.addListener(event);
					
					if(definition.events[event].cancelEvent) {
						this[definition.events[event].cancelEvent] = createCancellation(definition.events[event]);
						this.addListener(definition.events[event].cancelEvent);
					}
				}
			}
		},

		events: {// These are messages that this component listens for
			"handle-logic":  function(resp){
				var i = this.queue.length - 1;
				
				for (; i > -1; i--){
					this.queueTimes[i] -= resp.deltaT;
					
					if(this.queueTimes[i] <= 0){
						this.owner.trigger(this.queue[i].event, this.queue[i].message);
						this.queueTimes.splice(i,1);
						this.queue.splice(i,1);
					}
				}
			}
		},
		
		methods: {
			destroy: function(){
				this.queueTimes.length = 0;
				this.queue.length = 0;
			}
		}
	});
})();
