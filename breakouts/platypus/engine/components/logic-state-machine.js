/**
# COMPONENT **logic-state-machine**
This component is a general purpose state-machine for an entity, taking in various message inputs to determine the entity's state and triggering messages as necessary when a certain state occurs or several state combinations are in place.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component checks sustained inputs for changes in state.
- **update-state** - Updates the entity's state according to this message's state information.
  - @param message (object) - This is an object of key/value pairs where keys are states and the values are booleans to turn on and off states.
- **logical-state** - Updates the entity's state according to this message's state information, and broadcasts any applicable messages.
  - @param message (object) - This is an object of key/value pairs where keys are states and the values are booleans to turn on and off states.
- **[input messages]** - This component listens for messages as determined by the JSON settings.

### Local Broadcasts:
- **[output messages]** - This component triggers output messages as determined by the JSON settings.

## JSON Definition
    {
      "type": "logic-state-machine",
      
      "inputs":{
      // This is a list of messages that this component should listen for to change states.
      
        "smell-toast":{
        // If the entity triggers "smell-toast", this component will change the state of the entity as follows:
        
          "smelling-food": true,
          "smelling-nothing": false
        },
        
        "go-to-store":{
          "at-store": true
        }
      },
      
      "sustained-inputs":{
      // These are messages that must be triggered every tick for the state to remain true: if not, they become false.
        "near-grover": "smelling-trash"
      },
      
      "outputs":{
      //These are messages that should be triggered when certain conditions are met. The messages are only triggered the instant the condition is met, until the conditions are no longer met and then once again met.
      
        "smelling-food":{
        // Keys map to states, and if true, the value of the key is processed. In this case, the value of the "smelling-food" key is another object of key/value pairs, giving us another layer of checks.
        
          "!smelling-trash": "time-to-eat",
          // This key is an inverse check, meaning that the "smelling-trash" state of the entity must be false to continue along this path. This time the value is a string, so the string "time-to-eat" is treated as a message to be broadcast if the entity is both "smelling-food" and not "smelling-trash".
          
          "true": "belly-rumble"
          // In some cases, a message should be triggered for a set of states, while still doing deeper state checks like above. "true" will always handle the next layer of values if the parent key was true. 
        },
        
        "smelling-trash": "feeling-sick"
        // Multiple states can be handled to multiple depths, like a list of if() statements
        
        "!smelling-nothing":{
          "!smelling-trash":{
            "!at-store": "go-to-store",
            // Note that the "go-to-store" message will change this entity's state to "at-store" according to "inputs" above, but logic-state-machine uses a cache of states when broadcasting output messages, so the next section will not be processed until the next state check.
            
            "at-store":{
              "have-money": "buy-more-food",
              "!have-money": "buy-less-food"
            }
          }
        }
      }
    }
*/
(function(){
	var changeState = function(changes, state){
		return function(value){
			var i = null;
			
			for (i in changes){
				state[i] = changes[i];
			}
		};
	},
	changeSustainedState = function(change, state){
		return function(value){
			state[change] = true;
		};
	},
	handleResult = function(title, state, last, checks, changed, self, queue){
		var i = 0,
		resolved = false,
		message = checks.message || (checks.message === 0) || (checks.message === false);
		
		if(changed){
			if(typeof checks === 'string') {
				self.trigger(checks);
				resolved = true;
			} else if (checks.length) {
				for (i = 0; i < checks.length; i++){
					handleResult(title, state, last, checks[i], changed, self, queue);
				}
				resolved = true;
			} else if (checks.event && (message || checks.delay)){
				if(checks.delay){
					queue.push(checks);
				} else {
					self.trigger(checks.event, checks.message);
				}
				resolved = true;
			} else if (checks['true']){
				handleResult(title, state, last, checks['true'], changed, self, queue);
			}
		}
		
		if(!resolved) {
			for (i in checks) {
				if(i !== 'true'){
					handleOutput(i, state, last, checks[i], changed, self, queue);
				}
			}
		}
	},
	handleOutput = function(title, state, last, checks, changed, self, queue){
		var c = changed, 
		value = false;
		
		if(title.charAt(0) === '!') {
			value = (state[title.substring(1)] === false);
			if ((title !== 'outputs') && (last[title.substring(1)] !== state[title.substring(1)])) {
				c = true;
			}
		} else {
			value = (state[title] === true);
			if ((title !== 'outputs') && (last[title] !== state[title])) {
				c = true;
			}
		}
		
		if(value || (title === 'outputs')){
			handleResult(title, state, last, checks, c, self, queue);
		}
	};
	
	return platformer.createComponentClass({
		id: 'logic-state-machine',
		
		constructor: function(definition){
			var i = null;
			
			this.state = this.owner.state;
			
			if(definition.inputs){
				for (i in definition.inputs){
					this.addListener(i);
					this[i] = changeState(definition.inputs[i], this.state);
				}
			}

			this.sustainedState = {};
			if(definition["sustained-inputs"]){
				for (i in definition["sustained-inputs"]){
					this.addListener(i);
					this[i] = changeSustainedState(definition["sustained-inputs"][i], this.sustainedState);
					this.sustainedState[definition["sustained-inputs"][i]] = false;
				}
			}

			this.snapshot = {};
			this.last = {};
			this.tempQueue = [];
			this.queueTimes = [];
			this.queue = [];
			this.outputs = definition.outputs || null;
		},

		events: {
			"handle-logic":  function(resp){
				var i = null;
				
				for (i in this.sustainedState){
					if (this.owner.state[i] !== this.sustainedState[i]) {
						this.owner.state[i] = this.sustainedState[i];
					}
					this.sustainedState[i] = false;
				}
				
				for (i = this.queue.length - 1; i > -1; i--){
					this.queueTimes[i] -= resp.deltaT;
					
					if(this.queueTimes[i] <= 0){
						this.owner.trigger(this.queue[i].event, this.queue[i].message);
						this.queueTimes.splice(i,1);
						this.queue.splice(i,1);
					}
				}
			},
			
			"update-state": function(state){
				var i = null;
				
				for (i in state){
					this.state[i] = state[i];
				}
			},
			
			"logical-state": function(state){
				var i = null;
				
				if (this.outputs){
					for (i in state){
						if(state[i] !== this.snapshot[i]){
							this.snapshot[i] = state[i];
						}
					}
					this.tempQueue.length = 0;
					handleOutput('outputs', this.snapshot, this.last, this.outputs, false, this.owner, this.tempQueue);
					for (i = 0; i < this.tempQueue.length; i++){
						this.queue.push(this.tempQueue[i]);
						this.queueTimes.push(this.tempQueue[i].delay);
					}
					for (i in this.snapshot){
						if(this.snapshot[i] !== this.last[i]){
							this.last[i] = this.snapshot[i];
						}
					}
				}
			}
		}		
	});
})();
