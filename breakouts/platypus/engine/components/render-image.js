/**
# COMPONENT **render-image**
This component is attached to entities that will appear in the game world. It renders a static image. It can render a whole image or a portion of a larger images depending on the definition.

## Dependencies
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas animation functionality.
- [[handler-render-createjs]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render** - Repositions the image in preparation for rendering
- **handle-render-load** - The image added to the stage. Setting up the mouse input stuff.
  - @param obj.stage ([createjs.Stage][link2]) - This is the stage on which the component will be displayed.
- **logical-state** - This component listens for logical state changes. Handles orientation of the object and visibility.
  - @param message (object) - Required. Lists parameters and their values. For example: {hidden: false, orientation: 90}. Accepted parameters: 'orientation' and 'hidden'. Orientation is used to set the angle value in the object, the angle value will be interpreted differently based on what the 'rotate', 'mirror', and 'flip' properties are set to. Hidden determines whether the image is rendered.
- **pin-me** - If this component has a matching pin location, it will trigger "attach-pin" on the entity with the matching pin location.
  - @param pinId (string) - Required. A string identifying the id of a pin location that the render-image wants to be pinned to.
- **attach-pin** - On receiving this message, the component checks whether it wants to be pinned, and if so, adds itself to the provided container.
  - @param pinId (string) - Pin Id of the received pin location.
  - @param container ([createjs.Container][link3]) - Container that render-image should be added to.
- **remove-pin** - On receiving this message, the component checks whether it is pinned, and if so, removes itself from the container.
  - @param pinId (string) - Pin Id of the pin location to remove itself from.
- **hide-image** - Makes the image invisible.
- **show-image** - Makes the image visible.

### Local Broadcasts:
- **mousedown** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **pin-me** - If this component should be pinned to another image, it will trigger this event in an attempt to initiate the pinning.
  - @param pinId (string) - Required. A string identifying the id of a pin location that this render-image wants to be pinned to.
- **attach-pin** - This component broadcasts this message if it has a list of pins available for other images on the entity to attach to.
  - @param pinId (string) - Pin Id of an available pin location.
  - @param container ([createjs.Container][link3]) - Container that the render-image should be added to.
- **remove-pin** - When preparing to remove itself from an entity, render-image broadcasts this to all attached images.
  - @param pinId (string) - Pin Id of the pin location to be removed.

## JSON Definition
    {
      "type": "render-image",
      
      "image": "example",
      //Required: The id of the image from the asset list in config.js.
      
      "source": {
      //Optional - The portion of the image you are going to use.
		
		"width":  100,
		"height": 100,
		"y": 100,
		"x": 100   
      },
      
      "acceptInput": {
      	//Optional - What types of input the object should take.
      
      	"hover": false,
      	"click": false 
      },
       
      "pins": [{
      //Optional. Specifies whether other rendering components can pin themselves to this component. This is useful for puppet-like dynamics
      
        "pinId": "head",
        //Required. How this pin location should be referred to by other rendering components in order to link up.
        
        "x": 15,
        "y": -30
        //Required. Where the other component's regX and regY should be pinned to this image.
      }],

      "pinTo": "body",
      //Optional. Pin id of another component on this entity to pin this image to.
      
      "regX": 0,
      //Optional - The X offset from X position for the image.
      
      "regY": 0,
      //Optional - The Y offset from Y position for the image.
      
      "scaleX": 1,
      //Optional - The X scaling factor for the image.  Will default to 1.
      
      "scaleY": 1
      //Optional - The Y scaling factor for the image.  Will default to 1.
      
      "offsetZ": -1
      //Optional - How much the z-index of the image should be relative to the entity's z-index. Will default to 0.

      "rotate": false,
      //Optional - Whether this object can be rotated. It's rotational angle is set by sending an orientation value in the logical state.
      
      "mirror": true,
      //Optional - Whether this object can be mirrored over X. To mirror it over X set the orientation value in the logical state to be great than 90 but less than 270.
      
      "flip": false,
      //Optional - Whether this object can be flipped over Y. To flip it over Y set the orientation value in the logical state to be great than 180.
      
      "hidden": false
      //Optional - Whether this object is visible or not. To change the hidden value dynamically add a 'hidden' property to the logical state object and set it to true or false.
    }
    
[link1]: http://www.createjs.com/Docs/EaselJS/module_EaselJS.html
[link2]: http://createjs.com/Docs/EaselJS/Stage.html
[link3]: http://createjs.com/Docs/EaselJS/Container.html
*/
(function(){
	return platformer.createComponentClass({
		
		id: 'render-image',
		
		constructor: function(definition){
			var image = definition.image,
			source    = definition.source;
			
			this.rotate = definition.rotate || false;
			this.mirror = definition.mirror || false;
			this.flip   = definition.flip   || false;
			
			if(definition.acceptInput){
				this.hover = definition.acceptInput.hover || false;
				this.click = definition.acceptInput.click || false;
				this.touch = definition.acceptInput.touch || false;
			} else {
				this.hover = false;
				this.click = false;
				this.touch = false;
			}
			
			this.stage = undefined;
			this.image = new createjs.Bitmap(platformer.assets[image]);
			var scaleX = platformer.assets[image].scaleX || 1,
			scaleY     = platformer.assets[image].scaleY || 1;

			if(definition.pins){
				this.container = new createjs.Container();
				this.container.addChild(this.image);
				this.image.z = 0;
				this.addPins(definition.pins, definition.regX || 0, definition.regY || 0);
			} else {
				this.container = this.image;
			}

			this.pinTo = definition.pinTo || false;
			if(this.pinTo){
				this.owner.trigger('pin-me', this.pinTo);
			}
			
			if(source){
				source.x = source.x || 0;
				source.y = source.y || 0;
				this.image.sourceRect = new createjs.Rectangle(source.x * scaleX, source.y * scaleY, source.width * scaleX, source.height * scaleY);
			}
			this.image.hidden = definition.hidden || false;
			this.image.regX   = (definition.regX || 0) * scaleX;
			this.image.regY   = (definition.regY || 0) * scaleY;
			
			this.worldScaleX = definition.scaleX;
			this.worldScaleY = definition.scaleY;
			this.imageScaleX = scaleX;
			this.imageScaleY = scaleY;
			this.lastOwnerScaleX = this.owner.scaleX;
			this.lastOwnerScaleY = this.owner.scaleY;
			
			//This applies scaling to the correct objects if container and image are separate, and applies them both to the image if the container is also the image. - DDD
			this.container.scaleX = (this.worldScaleX || 1) * (this.owner.scaleX || 1);
			this.container.scaleY = (this.worldScaleY || 1) * (this.owner.scaleY || 1);
			this.image.scaleX /= this.imageScaleX;
			this.image.scaleY /= this.imageScaleY;
			this.scaleX = this.container.scaleX;
			this.scaleY = this.container.scaleY;

			this.skewX = this.owner.skewX || definition.skewX;
			this.skewY = this.owner.skewY || definition.skewY;
			
			this.offsetZ = definition.offsetZ || 0;
		},
		
		events: {
			"handle-render-load": function(obj){
				if(!this.pinTo){
					this.stage = obj.stage;
					if(!this.stage){
						return;
					}
					this.stage.addChild(this.container);
					this.addInputs();				
				} else {
					return;
				}
			},
			
			"handle-render": (function(){
				var sort = function(a, b) {
					return a.z - b.z;
				};
				
				return function(resp){
					var angle = null;
					
					if(!this.stage){
						if(!this.pinTo) { //In case this component was added after handler-render is initiated
							this['handle-render-load'](resp);
							if(!this.stage){
								console.warn('No CreateJS Stage, removing render component from "' + this.owner.type + '".');
								this.owner.removeComponent(this);
								return;
							}
						} else {
							return;
						}
					}
					
					if(this.pinnedTo){
						if(this.pinnedTo.frames && this.pinnedTo.frames[this.pinnedTo.animation.currentFrame]){
							this.container.x = this.pinnedTo.frames[this.pinnedTo.animation.currentFrame].x;
							this.container.y = this.pinnedTo.frames[this.pinnedTo.animation.currentFrame].y;
							if(this.container.z !== this.pinnedTo.frames[this.pinnedTo.animation.currentFrame].z){
								this.stage.reorder = true;
								this.container.z = this.pinnedTo.frames[this.pinnedTo.animation.currentFrame].z;
							}
							this.container.visible = true;
						} else if (this.pinnedTo.defaultPin) {
							this.container.x = this.pinnedTo.defaultPin.x;
							this.container.y = this.pinnedTo.defaultPin.y;
							if(this.container.z !== this.pinnedTo.defaultPin.z){
								this.stage.reorder = true;
								this.container.z = this.pinnedTo.defaultPin.z;
							}
							this.container.visible = true;
						} else {
							this.container.visible = false;
						}
					} else {
						this.container.x = this.owner.x;
						this.container.y = this.owner.y;
						if(this.container.z !== (this.owner.z + this.offsetZ)){
							this.stage.reorder = true;
							this.container.z = (this.owner.z + this.offsetZ);
						}
	
						if(this.owner.opacity || (this.owner.opacity === 0)){
							this.container.alpha = this.owner.opacity;
						}
					}		
					
					if(this.container.reorder){
						this.container.reorder = false;
						this.container.sortChildren(sort);
					}
	
					if(this.skewX){
						this.container.skewX = this.skewX;
					}
					if(this.skewY){
						this.container.skewY = this.skewY;
					}
					
					if (this.owner.scaleX != this.lastOwnerScaleX || this.owner.scaleY != this.lastOwnerScaleY) {
						this.container.scaleX = (this.worldScaleX || 1) * (this.owner.scaleX || 1);
						this.container.scaleY = (this.worldScaleY || 1) * (this.owner.scaleY || 1);
						this.image.scaleX /= this.imageScaleX;
						this.image.scaleY /= this.imageScaleY;
						this.scaleX = this.container.scaleX;
						this.scaleY = this.container.scaleY;
						
						this.lastOwnerScaleX = this.owner.scaleX;
						this.lastOwnerScaleY = this.owner.scaleY;
					}
			
					//Special case affecting rotation of the animation
					if(this.rotate || this.mirror || this.flip){
						angle = ((this.owner.orientation * 180) / Math.PI + 360) % 360;
						
						if(this.rotate){
							this.container.rotation = angle;
						}
						
						if(this.mirror){
							if((angle > 90) && (angle < 270)){
								this.container.scaleX = -this.scaleX;
							} else {
								this.container.scaleX = this.scaleX;
							}
						}
						
						if(this.flip){
							if(angle > 180){
								this.container.scaleY = this.scaleY;
							} else {
								this.container.scaleY = -this.scaleY;
							}
						}
					}
				};
			})(),
			
			"logical-state": function(state){
				if(state['hidden'] !== undefined) {
					this.container.hidden = state['hidden'];
				}
			},
			
			"hide-image": function(){
				this.container.hidden = true;
			},

			"show-image": function(){
				this.container.hidden = false;
			},
			
			"pin-me": function(pinId){
				if(this.pins && this.pins[pinId]){
					this.owner.trigger("attach-pin", this.pins[pinId]);
				}
			},
			
			"attach-pin": function(pinInfo){
				if(pinInfo.pinId === this.pinTo){
					this.stage = pinInfo.container;
					this.stage.addChild(this.container);
					this.addInputs();				
					this.pinnedTo = pinInfo;
				}
			},
			
			"remove-pin": function(pinInfo){
				if(pinInfo.pinId === this.pinTo){
					this.stage.removeChild(this.container);
					this.stage = null;
					this.pinnedTo = null;
				}
			}
		},
		
		methods: {
			addInputs: function(){
				var self = this, over = false;
				
				// The following appends necessary information to displayed objects to allow them to receive touches and clicks
				if(this.click || this.touch){
					if(this.touch && createjs.Touch.isSupported()){
						createjs.Touch.enable(this.stage);
					}

					this.image.addEventListener('mousedown', function(event) {
						self.owner.trigger('mousedown', {
							//debug: true,
							event: event.nativeEvent,
							over: over,
							x: event.stageX,
							y: event.stageY,
							entity: self.owner
						});
						event.addEventListener('mouseup', function(event){
							self.owner.trigger('mouseup', {
								//debug: true,
								event: event.nativeEvent,
								over: over,
								x: event.stageX,
								y: event.stageY,
								entity: self.owner
							});
						});
						event.addEventListener('mousemove', function(event){
							self.owner.trigger('mousemove', {
								event: event.nativeEvent,
								over: over,
								x: event.stageX,
								y: event.stageY,
								entity: self.owner
							});
						});
					});
					this.image.addEventListener('mouseout', function(){over = false;});
					this.image.addEventListener('mouseover', function(){over = true;});
				}
				if(this.hover){
					this.stage.enableMouseOver();
					this.image.addEventListener('mouseout', function(event){
						over = false;
						self.owner.trigger('mouseout', {
							event: event.nativeEvent,
							over: over,
							x: event.stageX,
							y: event.stageY,
							entity: self.owner
						});
					});
					this.image.addEventListener('mouseover', function(event){
						over = true;
						self.owner.trigger('mouseover', {
							event: event.nativeEvent,
							over: over,
							x: event.stageX,
							y: event.stageY,
							entity: self.owner
						});
					});
				}
			},
			
			addPins: function(pins, regX, regY){
				var i = 0, pin = null;
				
				this.pinsToRemove = this.pinsToRemove || [];
				
				this.pins = {};
				
				for (; i < pins.length; i++){
					this.pinsToRemove.push(pins[i].pinId);
					this.pins[pins[i].pinId] = pin = {
						pinId: pins[i].pinId,
						container: this.container,
						defaultPin: {
							x: pins[i].x - regX,
							y: pins[i].y - regY,
							z: pins[i].z || 0.00000001 //force z to prevent flickering z-order issues.
						}
					};
					this.owner.trigger('attach-pin', pin);
				}
			},

			removePins: function(){
				var i = 0;
				
				if(this.pins && this.pinsToRemove){
					for (; i < this.pinsToRemove.length; i++){
						this.owner.trigger('remove-pin', this.pins[this.pinsToRemove[i]].pinId);
						delete this.pins[this.pinsToRemove[i]];
					}
					this.pinsToRemove.length = 0;
				}
			},
			
			destroy: function(){
				if (this.stage){
					this.stage.removeChild(this.container);
					this.stage = undefined;
				}
				this.removePins();
				this.image = undefined;
				this.container = undefined;
			}
		}
	});
})();
