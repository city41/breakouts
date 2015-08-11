/**
# COMPONENT **handler-controller**
This component handles capturing and relaying input information to the entities that care about it. It takes mouse, keyboard, and custom input messages. State messages are sent immediately to the entities when they are received, the 'handler-controller' message is sent to demarcate ticks.

## Dependencies
- **Needs a 'tick' or 'check-inputs' call** - This component doesn't need a specific component, but it does require a 'tick' or 'check-inputs' call to function. It's usually used as a component of an action-layer.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-controller' message id it's added to the list of entities. Once an entity is added to the handler-controller 'controller-load' is called on the entity. If an entity has a control map that includes non-keyboard inputs, we add listeners for those and update functions to alert the entity when they happen. 
  - @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick, check-inputs** - Sends a 'handle-controller' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
  - @param resp (object) - An object containing deltaT which is the time passed since the last tick. 
- **keydown** - Sends a message to the handled entities 'key:' + the key id + ":down". 
  - @param event (DOM event) - The DOM event that triggered the keydown event. 
 - **keyup** - Sends a message to the handled entities 'key:' + the key id + ":up".
  - @param event (DOM event) - The DOM event that triggered the keyup event. 

### Child Broadcasts:
- **handle-controller** - Sent to entities on each tick to handle whatever they need to regarding controls.
  - @param resp (object) - An object containing a deltaT variable that is the time that's passed since the last tick.
- **controller-load** - Sent to entities when they are added to the handler-controller.
- **key:keyid:up** - Message sent to an entity when a key goes from down to up.
  - @param event (DOM event) - The DOM event that triggered the keyup event. 
- **key:keyid:down** - Message sent to an entity when a key goes from up to down.
  - @param event (DOM event) - The DOM event that triggered the keydown event. 
- **custom:up and custom:down messages** - Messages created when an entity has a control map with non-keyboard input. The handler creates these message when it adds the entity and then fires them on the entity when the input is received.
  - @param value (object) - A message object sent by the custom message.

## JSON Definition
    {
      "type": "handler-controller",
    }
*/

platformer.components['handler-controller'] = (function(){
	var relayUpDown = function(event, self){
		return function(value){
			if (value.released){
				event += ':up';
			} else if (value.pressed){
				event += ':down';
			}
			for (var x = 0; x < self.entities.length; x++) {
				self.entities[x].trigger(event, value);
			}
		}; 
	};
	var relay = function(event, self){
		return function(value){
			for (var x = 0; x < self.entities.length; x++) {
				self.entities[x].trigger(event, value);
			}
		}; 
	};
	
	var keyMap = { //Note: if this list is changed, be sure to update https://git.pbs.org/html5-platformer-engine/pages/Handler-Controller-Key-List
		kc0:   'unknown',         
		kc8:   'backspace',
		kc9:   'tab',
		kc12:  'numpad-5-shift',
		kc13:  'enter',
		kc16:  'shift',
		kc17:  'ctrl',
		kc18:  'alt',
		kc19:  'pause',
		kc20:  'caps-lock',
		kc27:  'esc',
		kc32:  'space',
		kc33:  'page-up',
		kc34:  'page-down',
		kc35:  'end',
		kc36:  'home',
		kc37:  'left-arrow',
		kc38:  'up-arrow',
		kc39:  'right-arrow',
		kc40:  'down-arrow',
		kc42:  'numpad-multiply',
		kc43:  'numpad-add',
		kc44:  'print-screen',
		kc45:  'insert',
		kc46:  'delete',
		kc47:  'numpad-division',
		kc48:  '0',
		kc49:  '1',
		kc50:  '2',
		kc51:  '3',
		kc52:  '4',
		kc53:  '5',
		kc54:  '6',
		kc55:  '7',
		kc56:  '8',
		kc57:  '9',
		kc59:  'semicolon',
		kc61:  'equals',
		kc65:  'a',
		kc66:  'b',
		kc67:  'c',
		kc68:  'd',
		kc69:  'e',
		kc70:  'f',
		kc71:  'g',
		kc72:  'h',
		kc73:  'i',
		kc74:  'j',
		kc75:  'k',
		kc76:  'l',
		kc77:  'm',
		kc78:  'n',
		kc79:  'o',
		kc80:  'p',
		kc81:  'q',
		kc82:  'r',
		kc83:  's',
		kc84:  't',
		kc85:  'u',
		kc86:  'v',
		kc87:  'w',
		kc88:  'x',
		kc89:  'y',
		kc90:  'z',
		kc91:  'left-windows-start',
		kc92:  'right-windows-start',
		kc93:  'windows-menu',
		kc96:  'back-quote',
		kc106: 'numpad-multiply',
		kc107: 'numpad-add',
		kc109: 'numpad-minus',
		kc110: 'numpad-period',
		kc111: 'numpad-division',
		kc112: 'f1',
		kc113: 'f2',
		kc114: 'f3',
		kc115: 'f4',
		kc116: 'f5',
		kc117: 'f6',
		kc118: 'f7',
		kc119: 'f8',
		kc120: 'f9',
		kc121: 'f10',
		kc122: 'f11',
		kc123: 'f12',
		kc144: 'num-lock',
		kc145: 'scroll-lock',
		kc186: 'semicolon',
		kc187: 'equals',
		kc188: 'comma',
		kc189: 'hyphen',
		kc190: 'period',
		kc191: 'forward-slash',
		kc192: 'back-quote',
		kc219: 'open-bracket',
		kc220: 'back-slash',
		kc221: 'close-bracket',
		kc222: 'quote'
	};
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners(['tick', 'child-entity-added', 'child-entity-updated', 'check-inputs', 'keydown', 'keyup']);
		
		this.timeElapsed = {
				name: 'Controller',
				time: 0
			};
	};
	var proto = component.prototype; 

	proto['keydown'] = function(event){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('key:' + (keyMap['kc' + event.keyCode] || ('key-code-' + event.keyCode)) + ':down', event);
		}
	}; 
	
	proto['keyup'] = function(event){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('key:' + (keyMap['kc' + event.keyCode] || ('key-code-' + event.keyCode)) + ':up', event);
		}
	};
	
	proto['tick'] = proto['check-inputs'] = function(resp){
		var time    = new Date().getTime();

		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('handle-controller', resp)) {
				this.entities.splice(x, 1);
			}
		}
		
		this.timeElapsed.time = new Date().getTime() - time;
		platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
	};

	proto['child-entity-added'] = proto['child-entity-updated'] = function(entity){
		var messageIds = entity.getMessageIds(),
		alreadyHere = false; 
		
		for (var x = 0; x < messageIds.length; x++){
			if (messageIds[x] == 'handle-controller'){
				for (var j = 0; j < this.entities.length; j++){
					if(this.entities[j] == entity){
						alreadyHere = true;
						break;
					}
				}
				
				if(!alreadyHere){
					// Check for custom input messages that should be relayed from scene.
					if(entity.controlMap){
						for(var y in entity.controlMap){
							if((y.indexOf('key:') < 0) && (y.indexOf('mouse:') < 0)){
								if(!this[y]){
									this.addListeners([y, y + ':up', y + ':down']);
									this[y]           = relayUpDown(y,     this);
									this[y + ':up']   = relay(y + ':up',   this);
									this[y + ':down'] = relay(y + ':down', this);
								}
							}
						}
					}
					
					this.entities.push(entity);
					entity.trigger('controller-load');
				}
				break;
			}
		}
	};

	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
		this.owner = undefined;
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
