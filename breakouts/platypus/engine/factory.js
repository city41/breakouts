/*
 * This file includes a few helper functions to handle component code that is repeated across multiple components.
 * See ec-template.js for an example componentDefinition that can be sent into this component class factory.
 */
(function (ns){
	ns.components = {};
	
	ns.createComponentClass = function(componentDefinition){
		var	createWrapper = function(self, name){
			return function(value, debug){
				self[name](value, debug);
			};
		},
		component = function(owner, definition){
			var func = null,
			alias    = '',
			name     = '',
			wrapped  = null;
			
			this.owner = owner;
			this.listeners = [];
			this.publicMethods = {};
			this.type = componentDefinition.id;
			
			if(componentDefinition.events){
				for(func in componentDefinition.events){
					wrapped = createWrapper(this, func);
					this.addListener(func, wrapped);
					
					if(definition.aliases){
						for (var alias in definition.aliases){
							if(definition.aliases[alias] === func){
								this.addListener(alias, wrapped);
							}
						}
					}
				}
			}
			
			if(componentDefinition.publicMethods){
				for(func in componentDefinition.publicMethods){
					name = func;
					if(definition.aliases){
						for (var alias in definition.aliases){
							if(definition.aliases[alias] === func){
								name = alias;
							}
						}
					}
					this.addMethod(name, componentDefinition.publicMethods[func]);
				}
			}
						
			if (this.constructor){
				this.constructor(definition);
			}
		},
		func  = null,
		proto = component.prototype;
		
		// Have to copy rather than replace so definition is not corrupted
		proto.constructor = componentDefinition.constructor;
		if(componentDefinition.events){
			for(func in componentDefinition.events){
				proto[func] = componentDefinition.events[func];
			}
		}
		if (componentDefinition.methods) for(func in componentDefinition.methods){
			if(func === 'destroy'){
				proto['___' + func] = componentDefinition.methods[func];
			} else {
				proto[func] = componentDefinition.methods[func];
			}
		}
		if (componentDefinition.publicMethods) for(func in componentDefinition.publicMethods){
			proto[func] = componentDefinition.publicMethods[func];
		}

		proto.toString = function(){
			return "[component " + this.type + "]";
		};

		// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
		proto.destroy = function(){
			for(func in this.publicMethods){
				this.removeMethod(func);
			}

			this.removeListeners(this.listeners);
			if(this.___destroy){
				this.___destroy();
			}
		};
		
		proto.setProperty = function(property, value){
			this[property] = value;
		};

		proto.addListeners = function(messageIds){
			for(var message in messageIds) this.addListener(messageIds[message]);
		};
	
		proto.removeListeners = function(listeners){
			if(!listeners){
				listeners = this.listeners;
			}
			for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
		};
		
		proto.addListener = function(messageId, callback){
			var func = callback || createWrapper(this, messageId);
			this.owner.bind(messageId, func);
			this.listeners[messageId] = func;
		};
		
		proto.addMethod = function(name, func){
			var self = this;
			
			if(this.owner[name]){
				console.warn(owner.type + ': Entity already has a method called "' + name + '". Method not added.');
			} else {
				this.owner[name] = function(){
					return func.apply(self, arguments);
				};
				this.publicMethods[name] = func;
			}
		};
	
		proto.removeListener = function(boundMessageId, callback){
			this.owner.unbind(boundMessageId, callback);
		};
		
		proto.removeMethod = function(name){
			if(!this.owner[name]){
				console.warn(owner.type + ': Entity does not have a method called "' + name + '".');
			} else {
				delete this.owner[name];
			}
			delete this.publicMethods[name];
		};

		ns.components[componentDefinition.id] = component;
	};
})(platformer);