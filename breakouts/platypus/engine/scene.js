/**
# CLASS scene
This class is instantiated by [[Game]] and contains one or more entities as layers. Each layer [[Entity]] handles a unique aspect of the scene. For example, one layer might contain the game world, while another layer contains the game interface. Generally there is only a single scene loaded at any given moment.

## Messages

### Child Broadcasts:
- **[Messages specified in definition]** - Listens for messages and on receiving them, re-triggers them on each entity layer.
  - @param message (object) - sends the message object received by the original message.

## Methods
- **[constructor]** - Creates an object from the scene class and passes in a scene definition containing a list of layers to load and a DOM element where the scene will take place.
  - @param definition (object) - Base definition for the scene, including one or more layers with both properties, filters, and components as shown below under "JSON definition".
  - @param rootElement (DOM element) - DOM element where scene displays layers.
  - @return scene - returns the new scene composed of the provided layers.
- **trigger** - This method is used by external objects to trigger messages on the layers as well as internal entities broadcasting messages across the scope of the scene.
  - @param messageId (string) - This is the message to process.
  - @param value (variant) - This is a message object or other value to pass along to component functions.
- **destroy** - This method destroys all the layers in the scene.

## JSON Definition:
    {
      "layers":[
      // Required array listing the entities that should be loaded as scene layers. These can be actual entity JSON definitions as shown in [[Entity]] or references to entities by using the following specification.

        {
          "type": "entity-id",
          // This value maps to an entity definition with a matching "id" value as shown in [[Entity]] and will load that definition.
          
          "properties":{"x": 400}
          // Optional. If properties are passed in this reference, they override the entity definition's properties of the same name.
        }
      ]
    }
*/
platformer.classes.scene = (function(){
	var scene = function(definition, rootElement){
		var layers = definition.layers,
		supportedLayer = true,
		layerDefinition = false,
		properties = false,
		messages = null;
		
		this.storedMessages = [];
		
		this.rootElement = rootElement;
		this.layers = [];
		for(var layer in layers){
			layerDefinition = layers[layer];
			properties = {rootElement: this.rootElement, parent: this};
			if (layerDefinition.properties){
				for(i in layerDefinition.properties){
					properties[i] = layerDefinition.properties[i];
				}
			}

			if(layerDefinition.type){ // this layer should be loaded from an entity definition rather than this instance
				layerDefinition = platformer.settings.entities[layerDefinition.type];
			}
			
			supportedLayer = true;
			if(layerDefinition.filter){
				if(layerDefinition.filter.includes){
					supportedLayer = false;
					for(var filter in layerDefinition.filter.includes){
						if(platformer.settings.supports[layerDefinition.filter.includes[filter]]){
							supportedLayer = true;
						}
					}
				}
				if(layerDefinition.filter.excludes){
					for(var filter in layerDefinition.filter.excludes){
						if(platformer.settings.supports[layerDefinition.filter.excludes[filter]]){
							supportedLayer = false;
						}
					}
				}
			}
			if (supportedLayer){
				this.layers.push(new platformer.classes.entity(layerDefinition, {
					properties: properties
				}));
			}
		}
		// This allows the layer to gather messages that are triggered as it is loading and deliver them to all the layers once all the layers are in place.
		messages = this.storedMessages;
		this.storedMessages = false;
		for(var i = 0; i < messages.length; i++){
			this.trigger(messages[i].message, messages[i].value);
		}
		messages.length = 0;
		
		this.time = new Date().getTime();
		this.timeElapsed = {
			name: '',
			time: 0
		};
	};
	var proto = scene.prototype;
	
	proto.trigger = function(eventId, event){
		var time = 0;
		
		if(this.storedMessages){
			this.storedMessages.push({
				message: eventId,
				value: event
			});
		} else {
			if(eventId === 'tick'){
				time = new Date().getTime();
				this.timeElapsed.name = 'Non-Engine';
				this.timeElapsed.time = time - this.time;
				this.trigger('time-elapsed', this.timeElapsed);
				this.time = time;
			}
			for(var layer in this.layers){
				this.layers[layer].trigger(eventId, event);
			}
			if(eventId === 'tick'){
				time = new Date().getTime();
				this.timeElapsed.name = 'Engine Total';
				this.timeElapsed.time = time - this.time;
				this.trigger('time-elapsed', this.timeElapsed);
				this.time = time;
			}
		}
	};
	
	proto.destroy = function(){
		for(var layer in this.layers){
			this.layers[layer].destroy();
		}
		this.layers.length = 0;
	};
	
	return scene;
})();
