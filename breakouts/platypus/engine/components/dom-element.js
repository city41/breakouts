/**
# COMPONENT **dom-element**
This component creates a DOM element associated with the entity. In addition to allowing for CSS styling, the element can also perform as a controller accepting click and touch inputs and triggering associated messages on the entity.

## Dependencies:
- [[handler-render-dom]] (on entity's parent) - This component listens for a render "handle-render-load" message with a DOM element to setup and display the element.

## Messages

### Listens for:
- **handle-render-load** - This event provides the parent DOM element that this component will require for displaying its DOM element.
  - @param message.element (DOM element) - Required. Provides the render component with the necessary DOM element parent.
- **handle-render** - On each `handle-render` message, this component checks to see if there has been a change in the state of the entity. If so (and updateClassName is set to true in the JSON definition) it updates its className accordingly.
- **logical-state** - This component listens for logical state changes and updates its local record of states.
  - @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages.
- **update-content** - This message updates the innerHTML of the DOM element.
  - @param message (string) - The text that should replace the DOM element's innerHTML.
  - @param message.text (string) - Alternatively an object may be passed in with a text property that should replace the DOM element's innerHTML.
- **set-parent** - This message appends the element to the provided parent element.
  - @param parent (DOM Element) - Required. The DOM Element that this element should be appended to.
- **set-attribute** - This message updates an attribute of the DOM element.
  - @param message.attribute (string) - The attribute that is to be changed.
  - @param message.value (string) - The value the changed attribute should have.
  - @param message (object) - Alternatively, multiple attributes may be changed with a list of key/value pairs where keys match the attributes whose values will be changed.
- **set-style** - This message updates the style of the DOM element.
  - @param message.attribute (string) - The CSS property that is to be changed.
  - @param message.value (string) - The value the changed CSS property should have.
  - @param message (object) - Alternatively, multiple CSS properties may be changed with a list of key/value pairs where keys match the properties whose values will be changed.

### Local Broadcasts:
- **[Messages specified in definition]** - Element event handlers will trigger messages as defined in the JSON definition.
  - @param message (DOM Event object) - When messages are triggered on the entity, the associated message object is the DOM Event object that was provided to the originating DOM Event handler.

## JSON Definition
    {
      "type": "dom-element",

      "element": "div",
      //Required. Sets what type of DOM element should be created.
      
      "innerHTML": "Hi!",
      //Optional. Sets the DOM element's inner text or HTML.
      
      "className": "top-band",
      //Optional. Any standard properties of the element can be set by listing property names and their values. "className" is one example, but other element properties can be specified in the same way.
      
      "updateClassName": true,
      //Optional. Specifies whether the className of the DOM element should be updated to reflect the entity's logical state. This setting will cause the className to equal its setting above followed by a space-delimited list of its `true` valued state names.
      
      "onmousedown": "turn-green",
      //Optional. If specified properties begin with "on", it is assumed that the property is an event handler and the listed value is broadcast as a message on the entity where the message object is the event handler's event object.

      "onmouseup": ["turn-red", "shout"]
      //Optional. In addition to the event syntax above, an Array of strings may be provided, causing multiple messages to be triggered in the order listed.
    }
*/
(function(){
	var createFunction = function(message, entity){
		if(typeof message === 'string'){
			return function(e){
				entity.trigger(message, e);
				e.preventDefault();
			};
		} else if (message.length){
			return function(e){
				for (var i = 0; i < message.length; i++){
					entity.trigger(message[i], e);
				}
				e.preventDefault();
			};
		} else {
			return function(e){
				entity.trigger(message.event, message.message);
				e.preventDefault();
			};
		}
	};
	
	return platformer.createComponentClass({
		id: 'dom-element',
		constructor: function(definition){
			var elementType = definition.element   || 'div';
			
			this.updateClassName = definition.updateClassName || false;
			this.className = '';
			this.states = {};
			this.stateChange = false;
			this.potentialParent = definition.parent;
			this.handleRenderLoadMessage = null;
			
			this.element = document.createElement(elementType);
			if(!this.owner.element){
				this.owner.element = this.element;
			}
			this.element.ondragstart = function() {return false;}; //prevent element dragging by default
			
			for(var i in definition){
				if(i === 'style'){
					for(var j in definition[i]){
						this.element.style[j] = definition[i][j]; 
					}
				} else if(((i !== 'type') || (elementType === 'input')) && (i !== 'element') && (i !== 'parent') && (i !== 'updateClassName') && (i !== 'attributes') && (i !== 'messageMap')){
					if(i.indexOf('on') === 0){
						this.element[i] = createFunction(definition[i], this.owner);
					} else {
						this.element[i] = definition[i];
						if(i == 'className'){
							this.className = definition[i];
						}
					}
				}
			}
			
			if(this.owner.className){
				this.className = this.element.className = this.owner.className;
			}
			if(this.owner.innerHTML){
				this.element.innerHTML = this.owner.innerHTML;
			}
		},
		events:{
			"handle-render-load": (function(){
				var getElementById = function(root, id){
					var i = 0,
					all   = root.getElementsByTagName('*');

					for (; i < all.length; i++) {
					    if(all[i].getAttribute('id') === id){
					    	return all[i];
					    }
					}
					
					return document.getElementById(id);
				};
				
				return function(resp){
					if(resp.element){
						
						if(!this.parentElement){
							if(this.potentialParent){
								this.parentElement = getElementById(resp.element, this.potentialParent);
								this.parentElement.appendChild(this.element);
							} else {
								this.parentElement = resp.element;
								this.parentElement.appendChild(this.element);
							}
						}
			
						if(this.owner.entities){
							var message = this.handleRenderLoadMessage = {};
							for (var item in resp){
								message[item] = resp[item];
							}
							message.element = this.element;
							for (var entity in this.owner.entities){
								this.owner.entities[entity].trigger('handle-render-load', message);
							}
						}
					}
				};
			})(),
			
			"child-entity-added": function(entity){
				if(this.handleRenderLoadMessage){
					entity.trigger("handle-render-load", this.handleRenderLoadMessage);
				}
			},
			
			"set-parent": function(element){
				if(this.parentElement){
					this.parentElement.removeChild(this.element);
				}
				this.parentElement = element;
				this.parentElement.appendChild(this.element);
			},
			
			"handle-render": function(resp){
				var i     = 0,
				className = this.className;
				
				if(this.stateChange && this.updateClassName){
					for(i in this.states){
						if(this.states[i]){
							className += ' ' + i;
						}
					}
					this.element.className = className;
					this.stateChange = false;
				}
			},
			
			"set-attribute": function(resp){
				var attribute = null;
				
				if(resp.attribute){ //Backwards compatibility for {attribute: 'attribute-name', value: 'new-value'} syntax
					this.element.setAttribute(resp.attribute, resp.value);
				} else {
					for (attribute in resp){
						this.element.setAttribute(attribute, resp[attribute]);
					}
				}
			},
			
			"set-style": function(resp){
				var attribute = null;
				
				if(resp.attribute){ //Backwards compatibility for {attribute: 'attribute-name', value: 'new-value'} syntax
					this.element.style[resp.attribute] = resp.value;
				} else {
					for (attribute in resp){
						this.element.style[attribute] = resp[attribute];
					}
				}
			},
			
			"update-content": function(resp){
				var text = resp;
				
				if(text && (typeof text.text === 'string')){
					text = text.text;
				}
				
				if((typeof text === 'string') && (text !== this.element.innerHTML)){
					this.element.innerHTML = text;
				}
			},
		
			"logical-state": function(state){
				for(var i in state){
					if(this.states[i] !== state[i]){
						this.stateChange = true;
						this.states[i] = state[i];
					}
				}
			}
		},
		methods: {
			destroy: function(){
				if(this.parentElement){
					this.parentElement.removeChild(this.element);
					this.parentElement = undefined;
				}
				if(this.owner.element === this.element){
					this.owner.element = undefined;
				}
				this.element = undefined;
			}
		}
	});
})();
