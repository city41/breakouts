/**
# COMPONENT **entity-controller**
This component listens for input messages triggered on the entity and updates the state of any controller inputs it is listening for. It then broadcasts messages on the entity corresponding to the input it received.

## Dependencies:
- [[Handler-Controller]] (on entity's parent) - This component listens for a controller "tick" message in order to trigger messages regarding the state of its inputs.

## Messages

### Listens for:
- **handle-controller** - On each `handle-controller` message, this component checks its list of actions and if any of their states are currently true or were true on the last call, that action message is triggered.
- **mousedown** - This message triggers a new message on the entity that includes what button on the mouse was pressed: "mouse:left-button:down", "mouse:middle-button:down", or "mouse:right-button:down".
  - @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mouseup** - This message triggers a new message on the entity that includes what button on the mouse was released: "mouse:left-button:up", "mouse:middle-button:up", or "mouse:right-button:up".
  - @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mousemove** - Updates mouse action states with whether the mouse is currently over the entity.
  - @param message.over (boolean) - Whether the mouse is over the input entity.
- **pause-controls** - This message will stop the controller from triggering messages until "unpause-controls" is triggered on the entity.
- **unpause-controls** - This message will allow the controller to trigger messages until "pause-controls" is triggered on the entity.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, sets the appropriate state and broadcasts the associated message on the next `handle-controller` message. These messages come in pairs and typically have the form of "keyname:up" and "keyname:down" specifying the current state of the input.
  
### Local Broadcasts:
- **mouse:mouse-left:down, mouse:mouse-left:up, mouse:mouse-middle:down, mouse:mouse-middle:up, mouse:mouse-right:down, mouse:mouse-right:up** - This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
  - @param message (DOM Event object) - The original mouse event object is passed along with the control message.
- **north, north-northeast, northeast, east-northeast, east, east-southeast, southeast, south-southeast, south, south-southwest, southwest, west-southwest, west, west-northwest, northwest, north-northwest** - If the soft joystick is enabled on this component, it will broadcast these directional messages if the joystick is in use.
  - @param message (DOM Event object) - Mirrors the mouse event object that moved the joystick.
- **joystick-orientation** - If the soft joystick is enabled on this component, this message will trigger to provide the current orientation of the joystick.
  - @param orientation (number) - A number in radians representing the orientation of the joystick.
- **[Messages specified in definition]** - Broadcasts active states using the JSON-defined message on each `handle-controller` message. Active states include `pressed` being true or `released` being true. If both of these states are false, the message is not broadcasted.
  - @param message.pressed (boolean) - Whether the current input is active.
  - @param message.released (boolean) - Whether the current input was active last tick but is no longer active.
  - @param message.triggered (boolean) - Whether the current input is active but was not active last tick.
  - @param message.over (boolean) - Whether the mouse was over the entity when pressed, released, or triggered. This value is always false for non-mouse input messages.

## JSON Definition:
    {
      "type": "entity-controller",
      
      "paused": true,
      // Optional. Whether input controls should start deactivated. Default is false.
      
      "controlMap":{
      // Required. Use the controlMap property object to map inputs to messages that should be triggered. At least one control mapping should be included. The following are a few examples:
      
        "key:x": "run-left",
        // This causes an "x" keypress to fire "run-left" on the entity. For a full listing of key names, check out the `handler-controller` component.
        
        "button-pressed": "throw-block",
        // custom input messages can be fired on this entity from other entities, allowing for on-screen input buttons to run through the same controller channel as other inputs.
        
        "mouse:left-button"
        // The controller can also handle mouse events on the entity if the entity's render component triggers mouse events on the entity (for example, the `render-animation` component).
      },
	  
	  "joystick":{
	  // Optional. Determines whether this entity should listen for mouse events to trigger directional events. Can be set simply to "true" to accept all joystick defaults
	      
	      "directions": 8,
		  // Optional: 4, 8, or 16. Determines how many directions to broadcast. Default is 4 ("north", "east", "south", and "west").
		  
		  "innerRadius": 30,
		  // Optional. Number determining how far the mouse must be from the entity's position before joystick events should be triggered. Default is 0.
		  
		  "outerRadius": 60
		  // Optional. Number determining how far the mouse can move away from the entity's position before the joystick stops triggering events. Default is Infinity.
	  }
    }
*/
(function(){
	var distance = function(origin, destination){
		var x = destination.x - origin.x,
		y = destination.y - origin.y;
		
		return Math.sqrt(x*x + y*y);
	},
	angle = function(origin, destination, distance){
		var x = destination.x - origin.x,
		y     = destination.y - origin.y,
		a     = 0,
		circle= Math.PI * 2;
		
		if(!distance){
			return a;
		}

		a = Math.acos(x/distance);
		if (y < 0){
			a = circle - a;
		}
		return a;
	},
	directions = [null,null,null,null, //joystick directions
		['east', 'south', 'west', 'north'], null, null, null,
		['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'], null, null, null, null, null, null, null,
		['east', 'east-southeast', 'southeast', 'south-southeast', 'south', 'south-southwest', 'southwest', 'west-southwest', 'west', 'west-northwest', 'northwest', 'north-northwest', 'north', 'north-northeast', 'northeast', 'east-northeast']
	],
	mouseMap = ['left-button', 'middle-button', 'right-button'],
	state = function(event, trigger){
	    this.event = event;
	    this.trigger = trigger;
	    this.filters = false;
		this.current = false;
		this.last    = false;
		this.state   = false;
		this.stateSummary = {
			pressed:   false,
			released:  false,
			triggered: false,
			over:      false
		};
	},
	createUpHandler = function(state){
		if(state.length){
			return function(value){
				for (var i = 0; i < state.length; i++){
					state[i].state = false;
				}
			};
		} else {
			return function(value){
				state.state = false;
			};
		}
	},
	createDownHandler = function(state){
		if(state.length){
			return function(value){
				for (var i = 0; i < state.length; i++){
					state[i].current = true;
					state[i].state   = true;
					if(value && (typeof (value.over) !== 'undefined')) state[i].over = value.over;
				}
			};
		} else {
			return function(value){
				state.current = true;
				state.state   = true;
				if(value && (typeof (value.over) !== 'undefined')) state.over = value.over;
			};
		}
	},
	addActionState = function(actionList, action, trigger, requiredState){
		var actionState = actionList[action]; // If there's already a state storage object for this action, reuse it: there are multiple keys mapped to the same action.
		if(!actionState){                                // Otherwise create a new state storage object
			actionState = actionList[action] = new state(action, trigger);
		}
		if(requiredState){
			actionState.setFilter(requiredState);
		}
		return actionState;
	},
	stateProto = state.prototype;
	
	stateProto.update = function(){
		var i = 0;
		
		if(this.current || this.last){
			this.stateSummary.pressed   = this.current;
			this.stateSummary.released  = !this.current && this.last;
			this.stateSummary.triggered = this.current && !this.last;
			this.stateSummary.over      = this.over;
			if(this.filters){
				for(; i < this.filters.length; i++){
					if(this.stateSummary[this.filters[i]]){
						this.trigger(this.event, this.stateSummary);
					}
				}
			} else {
				this.trigger(this.event, this.stateSummary);
			}
		}
		
		this.last    = this.current;
		this.current = this.state;
	};
	
	stateProto.setFilter = function(filter){
		if(!this.filters){
			this.filters = [filter];
		} else {
			this.filters.push(filter);
		}
		return this;
	};

	stateProto.isPressed = function(){
		return this.current;
	};
	
	stateProto.isTriggered = function(){
		return this.current && !this.last;
	};

	stateProto.isReleased = function(){
		return !this.current && this.last;
	};

	return platformer.createComponentClass({
		id: 'entity-controller',
		
		constructor: function(definition){
			var i       = 0,
			j           = 0,
			k           = 0,
			key         = '',
			actionState = undefined,
			self        = this,
			trigger     = function(event, obj){
				if(!self.paused){
					self.owner.trigger(event, obj);
				}
			};
			
			this.paused = definition.paused || false;
			
			if(definition && definition.controlMap){
				this.owner.controlMap = definition.controlMap; // this is used and expected by the handler-controller to handle messages not covered by key and mouse inputs.
				this.actions  = {};
				for(key in definition.controlMap){
					if(typeof definition.controlMap[key] === 'string'){
						actionState = addActionState(this.actions, definition.controlMap[key], trigger);
					} else {
						actionState = [];
						if(definition.controlMap[key].length){
							for (i = 0; i < definition.controlMap[key].length; i++){
								actionState[i] = addActionState(this.actions, definition.controlMap[key][i], trigger);
							}
						} else {
							k = 0;
							for (j in definition.controlMap[key]){
								if(typeof definition.controlMap[key][j] === 'string'){
									actionState[k] = addActionState(this.actions, definition.controlMap[key][j], trigger, j);
									k += 1;
								} else {
									for (i = 0; i < definition.controlMap[key][j].length; i++){
										actionState[k] = addActionState(this.actions, definition.controlMap[key][j][i], trigger, j);
										k += 1;
									}
								}
							}
						}
					}
					this[key + ':up']   = createUpHandler(actionState);
					this[key + ':down'] = createDownHandler(actionState);
					this.addListener(key + ':up');
					this.addListener(key + ':down');
				}
			}
			
			if(definition.joystick){
				this.joystick = {};
				this.joystick.directions  = definition.joystick.directions  || 4; // 4 = n,e,s,w; 8 = n,ne,e,se,s,sw,w,nw; 16 = n,nne,ene,e...
				this.joystick.handleEdge  = definition.joystick.handleEdge  || false;
				this.joystick.innerRadius = definition.joystick.innerRadius || 0;
				this.joystick.outerRadius = definition.joystick.outerRadius || Infinity;
			}
		},
		
		events:{
			'handle-controller': function(){
				var action    = '';
				
				if(this.actions){
					for (action in this.actions){
						this.actions[action].update();
					}
				}
			},
			
			'mousedown': function(value){
				this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':down', value.event);
				if(this.joystick){
					this.owner.trigger('joystick:down', value.event);
					this.handleJoy(value);
				}
			},
			
			'mouseup': function(value){
				this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':up', value.event);
				if(this.joystick){
					this.owner.trigger('joystick:up', value.event);
					this.handleJoy(value);
				}
			},
			
			'mousemove': function(value){
				if(this.actions['mouse:left-button'] && (this.actions['mouse:left-button'].over !== value.over))     this.actions['mouse:left-button'].over = value.over;
				if(this.actions['mouse:middle-button'] && (this.actions['mouse:middle-button'].over !== value.over)) this.actions['mouse:middle-button'].over = value.over;
				if(this.actions['mouse:right-button'] && (this.actions['mouse:right-button'].over !== value.over))   this.actions['mouse:right-button'].over = value.over;
				if(this.joystick){
					this.handleJoy(value);
				}
			},
			
			'pause-controls': function(){
				this.paused = true;
			},
			
			'unpause-controls': function(){
				this.paused = false;
			}
		},
		
		methods:{
			handleJoy: function(event){
				// The following translate CreateJS mouse and touch events into messages that this controller can handle in a systematic way
				var segment = Math.PI / (this.joystick.directions / 2),
				dist        = distance(this.owner, event),
				orientation = 0,
				direction   = '',
				accuracy    = '';
				
				if((dist > this.joystick.outerRadius) || (dist < this.joystick.innerRadius)){
					return;
				} else if(!this.paused){
					orientation = angle(this.owner, event, dist);
					direction   = directions[this.joystick.directions][Math.floor(((orientation + segment / 2) % (Math.PI * 2)) / segment)];
					
					if(this.joystick.handleEdge){
						segment  = Math.PI / this.joystick.directions;
						accuracy = directions[this.joystick.directions * 2][Math.floor(((orientation + segment / 2) % (Math.PI * 2)) / segment)];
						if(accuracy !== direction){
							this.owner.trigger(accuracy.replace(direction, '').replace('-',''), event);  //There's probably a better way to perform this, but the current method is functional. - DDD
						}
					}
					this.owner.trigger(direction, event);
					this.owner.trigger("joystick-orientation", orientation);
				}
			}
		}
	});
})();
