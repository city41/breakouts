/**
# COMPONENT **handler-render-dom**
A component that handles the rendering of DOM elements. It creates a div element that it then shares with entities to add themselves too. It then alerts these entities when they should load and update their rendering.

## Dependencies
- **Needs a 'tick' or 'render' call** - This component doesn't need a specific component, but it does require a 'tick' or 'render' call to function. It's usually used as a component of an action-layer.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-render' or 'handle-render-load' message id it's added to the list of entities. Also the 'handle-render-load' message is called immediately.
  - @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick, render** - Sends a 'handle-render' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
  - @param resp (object) - An object containing deltaT which is the time passed since the last tick. 

### Child Broadcasts:
- **handle-render-load** - Sent to an entity that has been added to the handler. Passes the entity a div element that it can add itself to.
  - @param obj.element (Object) - An object containing a DOM element that the entity should add child elements to.
- **handle-render** - Sent to entities to have them prepare to be rendered.
  - @param object - An object containing a deltaT variable that is the time that's passed since the last tick.

## JSON Definition
    {
      "type": "handler-render-dom",

      "className": "top-band",
      //Optional. Any standard properties of the element can be set by listing property names and their values. "className" is one example, but other element properties can be specified in the same way.
      
      "onmousedown": "turn-green",
      //Optional. If specified properties begin with "on", it is assumed that the property is an event handler and the listed value is broadcast as a message on the entity where the message object is the event handler's event object.
    }
*/

platformer.components['handler-render-dom'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['tick', 'child-entity-added', 'render']);
		
		this.element = this.owner.element = document.createElement('div');
		this.owner.rootElement.appendChild(this.element);
		this.owner.element = this.element;

		for(var i in definition){
			if(i === 'style'){
				for(var j in definition[i]){
					this.element.style[j] = definition[i][j]; 
				}
			} else if(i !== 'type'){
				if(i.indexOf('on') === 0){
					this.element[i] = createFunction(definition[i], this.owner);
				} else {
					this.element[i] = definition[i];
				}
			}
		}

	},
	proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if ((messageIds[x] == 'handle-render') || (messageIds[x] == 'handle-render-load')){
				this.entities.push(entity);
				entity.trigger('handle-render-load', {
					element: self.element
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('handle-render', resp))
			{
				this.entities.splice(x, 1);
			}
			
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.owner.rootElement.removeChild(this.element);
		this.owner.element = null;
		this.element = undefined;
		this.entities.length = 0;
		this.owner = undefined;
	};
	
	/*********************************************************************************************************
	 * The stuff below here can be left alone. 
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
