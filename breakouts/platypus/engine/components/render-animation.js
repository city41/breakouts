/**
# COMPONENT **render-animation**
This component is attached to entities that will appear in the game world. It renders an animated image. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.

## Dependencies:
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas animation functionality.
- [[handler-render-createjs]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render-load** - This event is triggered when the entity is added to the render handler before 'handle-render' is called. It adds the animation to the Stage and sets up the mouse input if necessary.
  - @param message.stage ([createjs.Stage][link2]) - Required. Provides the render component with the CreateJS drawing [Stage][link2].
- **handle-render** - On each `handle-render` message, this component checks to see if there has been a change in the state of the entity. If so, it updates its animation play-back accordingly.
- **logical-state** - This component listens for logical state changes and tests the current state of the entity against the animation map. If a match is found, the matching animation is played. Has some reserved values used for special functionality.
  - @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages. Reserved values: 'orientation' and 'hidden'. Orientation is used to set the angle value in the object, the angle value will be interpreted differently based on what the 'rotate', 'mirror', and 'flip' properties are set to. Hidden determines whether the animation is rendered.
- **pin-me** - If this component has a matching pin location, it will trigger "attach-pin" on the entity with the matching pin location.
  - @param pinId (string) - Required. A string identifying the id of a pin location that the render-animation wants to be pinned to.
- **attach-pin** - On receiving this message, the component checks whether it wants to be pinned, and if so, adds itself to the provided container.
  - @param pinId (string) - Pin Id of the received pin location.
  - @param container ([createjs.Container][link3]) - Container that render-animation should be added to.
- **remove-pin** - On receiving this message, the component checks whether it is pinned, and if so, removes itself from the container.
  - @param pinId (string) - Pin Id of the pin location to remove itself from.
- **hide-animation** - Makes the animation invisible.
- **show-animation** - Makes the animation visible.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, begins playing the corresponding animations.

### Local Broadcasts:
- **mousedown** - This component captures this event from CreateJS and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - This component captures this event from CreateJS and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - This component captures this event from CreateJS and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **pin-me** - If this component should be pinned to another animation, it will trigger this event in an attempt to initiate the pinning.
  - @param pinId (string) - Required. A string identifying the id of a pin location that this render-animation wants to be pinned to.
- **attach-pin** - This component broadcasts this message if it has a list of pins available for other animations on the entity to attach to.
  - @param pinId (string) - Pin Id of an available pin location.
  - @param container ([createjs.Container][link3]) - Container that the render-animation should be added to.
- **remove-pin** - When preparing to remove itself from an entity, render-animation broadcasts this to all attached animations.
  - @param pinId (string) - Pin Id of the pin location to be removed.

## JSON Definition
    {
      "type": "render-animation",

      "animationMap":{
      //Optional. If the animation sequence will change, this is required. This defines a mapping from either triggered messages or one or more states for which to choose a new animation to play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation).
      
          "standing": "default-animation"
          // On receiving a "standing" message, or a "logical-state" where message.standing == true, the "default" animation will begin playing.
          
          "ground,moving": "walking",
          // Comma separated values have a special meaning when evaluating "logical-state" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
          
          "ground,striking": "swing!",
          // Putting an exclamation after an animation name causes this animation to complete before going to the next animation. This is useful for animations that would look poorly if interrupted.

          "default": "default-animation",
          // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
      }  

      "spriteSheet": {
      //Required. Defines an EaselJS sprite sheet to use for rendering. See http://www.createjs.com/Docs/EaselJS/SpriteSheet.html for the full specification.

	      "images": ["example0", "example1"],
	      //Required: An array of ids of the images from the asset list in config.js.
	      
	      "frames": {
	      //Required: The dimensions of the frames on the image and how to offset them around the entity position. The image is automatically cut up into pieces based on the dimensions. 
	      	"width":  100,
			"height": 100,
			"regY":   100,
			"regX":   50
	      },
	      
	      "animations":{
	      //Required: The list of animation ids and the frames that make up that animation. The frequency determines how long each frame plays. There are other possible parameters. Additional parameters and formatting info can be found in createJS.
			"default-animation":[2],
			"walking": {"frames": [0, 1, 2], "frequency": 4},
			"swing": {"frames": [3, 4, 5], "frequency": 4}
		  }
      }
      
      "acceptInput": {
      	//Optional - What types of input the object should take. This component defaults to not accept any input.
      	"hover": false;
      	"click": false; 
      },
      
      "pins": [{
      //Optional. Specifies whether other animations can pin themselves to this animation. This is useful for puppet-like dynamics
      
        "pinId": "head",
        //Required. How this pin location should be referred to by other animations in order to link up.
        
        "x": 15,
        "y": -30,
        //These two values are required unless "frames" is provided below. Defines where the other animation's regX and regY should be pinned to this animation.
        
        "frames": [{"x": 12, "y": -32}, null, {"x": 12}]
        //Alternatively, pin locations can be specified for every frame in this animation by providing an array. If a given index is null or a parameter is undefined, the x/y/z values above are used. If they're not specified, the pinned animation is hidden.
      }],

      "pinTo": "body",
      //Optional. Pin id of another animation on this entity to pin this animation to.
      
      "scaleX": 1,
      //Optional - The X scaling factor for the image. Will default to 1.
      
      "scaleY": 1
      //Optional - The Y scaling factor for the image. Will default to 1.

      "offsetZ": -1
      //Optional - How much the z-index of the animation should be relative to the entity's z-index. Will default to 0.

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
	var changeState = function(state){
		return function(value){
			//9-23-13 TML - Commenting this line out to allow animation events to take precedence over the currently playing animation even if it's the same animation. This is useful for animations that should restart on key events.
			//				We may eventually want to add more complexity that would allow some animations to be overridden by messages and some not.
			//if(this.currentAnimation !== state){
				if(this.animationFinished || (this.lastState >= -1)){
					this.currentAnimation = state;
					this.lastState = -1;
					this.animationFinished = false;
					this.anim.gotoAndPlay(state);
				} else {
					this.waitingAnimation = state;
					this.waitingState = -1;
				}
			//}
		};
	},
	createTest = function(testStates, animation){
		var states = testStates.replace(/ /g, '').split(',');
		if(testStates === 'default'){
			return function(state){
				return animation;
			};
		} else {
			return function(state){
				for(var i = 0; i < states.length; i++){
					if(!state[states[i]]){
						return false;
					}
				}
				return animation;
			};
		}
	};
	
	return platformer.createComponentClass({
		
		id: 'render-animation',
		
		constructor: function(definition){
			var spriteSheet = {
				images: definition.spriteSheet.images.slice(),
				frames: definition.spriteSheet.frames,
				animations: definition.spriteSheet.animations
			},
			self = this,
			x = 0,
			animation = '',
			lastAnimation = '',
			map = definition.animationMap,
			regX = 0,
			regY = 0;
			
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
			
			this.followThroughs = {};
			
			if(!map){ // create animation map if none exists
				map = {};
				for (x in spriteSheet.animations){
					map[x] = x;
				}
			}
			
			this.checkStates = [];
			for(var i in map){
				this.addListener(i);
				animation = map[i];
				
				if(animation[animation.length - 1] === '!'){
					animation = animation.substring(0, animation.length - 1);
					this.followThroughs[animation] = true;
				} else {
					this.followThroughs[animation] = false;
				}
				
				this[i] = changeState(animation);
				this.checkStates.push(createTest(i, animation));
			}
			lastAnimation = animation;
			
			this.stage = undefined;
			for (x = 0; x < spriteSheet.images.length; x++){
				spriteSheet.images[x] = platformer.assets[spriteSheet.images[x]];
			}
			var scaleX = spriteSheet.images[0].scaleX || 1,
			scaleY     = spriteSheet.images[0].scaleY || 1;
			if((scaleX !== 1) || (scaleY !== 1)){
				if(spriteSheet.frames.length){ //frames are an array
					var arr = [];
					regX = [];
					regY = [];
					for (var i = 0; i < spriteSheet.frames.length; i++){
						arr.push([
						  spriteSheet.frames[i][0] * scaleX,
						  spriteSheet.frames[i][1] * scaleY,
						  spriteSheet.frames[i][2] * scaleX,
						  spriteSheet.frames[i][3] * scaleY,
						  spriteSheet.frames[i][4],
						  spriteSheet.frames[i][5] * scaleX,
						  spriteSheet.frames[i][6] * scaleY
						]);
						regX.push(spriteSheet.frames[i][5]);
						regY.push(spriteSheet.frames[i][6]);
					}
					spriteSheet.frames = arr;
				} else {
					regX = spriteSheet.frames.regX;
					regY = spriteSheet.frames.regY;
					spriteSheet.frames = {
						width: spriteSheet.frames.width * scaleX,	
						height: spriteSheet.frames.height * scaleY,	
						regX: spriteSheet.frames.regX * scaleX,	
						regY: spriteSheet.frames.regY * scaleY
					};
				}
			} else {
				if(spriteSheet.frames.length){ //frames are an array
					regX = [];
					regY = [];
					for (var i = 0; i < spriteSheet.frames.length; i++){
						regX.push(spriteSheet.frames[i][5]);
						regY.push(spriteSheet.frames[i][6]);
					}
				} else {
					regX = spriteSheet.frames.regX;
					regY = spriteSheet.frames.regY;
				}
			}

			spriteSheet = new createjs.SpriteSheet(spriteSheet);
			this.anim = new createjs.BitmapAnimation(spriteSheet);

			if(definition.pins){
				this.container = new createjs.Container();
				this.container.addChild(this.anim);
				this.anim.z = 0;
				this.addPins(definition.pins, regX, regY);
			} else {
				this.container = this.anim;
			}

			this.pinTo = definition.pinTo || false;
			if(this.pinTo){
				this.owner.trigger('pin-me', this.pinTo);
			}
			
			this.anim.onAnimationEnd = function(animationInstance, lastAnimation){
				self.owner.trigger('animation-ended', lastAnimation);
				if(self.waitingAnimation){
					self.currentAnimation = self.waitingAnimation;
					self.waitingAnimation = false;
					self.lastState = self.waitingState;
					
					self.animationFinished = false;
					self.anim.gotoAndPlay(self.currentAnimation);
				} else {
					self.animationFinished = true;
				}
			};
			this.anim.hidden = definition.hidden   || false;
			this.currentAnimation = map['default'] || lastAnimation;
			this.forcePlaythrough = this.owner.forcePlaythrough || definition.forcePlaythrough || false;

			this.worldScaleX = definition.scaleX;
			this.worldScaleY = definition.scaleY;
			this.imageScaleX = scaleX;
			this.imageScaleY = scaleY;
			this.lastOwnerScaleX = this.owner.scaleX;
			this.lastOwnerScaleY = this.owner.scaleY;
			
			//This applies scaling to the correct objects if container and animation are separate, and applies them both to the animation if the container is also the animation. - DDD
			this.container.scaleX = (this.worldScaleX || 1) * (this.owner.scaleX || 1);
			this.container.scaleY = (this.worldScaleY || 1) * (this.owner.scaleY || 1);
			this.anim.scaleX /= this.imageScaleX;
			this.anim.scaleY /= this.imageScaleY;
			this.scaleX = this.container.scaleX;
			this.scaleY = this.container.scaleY;

			this.skewX = this.owner.skewX || definition.skewX;
			this.skewY = this.owner.skewY || definition.skewY;
			
			this.offsetZ = definition.offsetZ || 0;

			this.state = this.owner.state;
			this.stateChange = false;
			this.lastState = -1;

			this.waitingAnimation = false;
			this.waitingState = 0;
			this.playWaiting = false;
			this.animationFinished = false;
			if(this.currentAnimation){
				this.anim.gotoAndPlay(this.currentAnimation);
			}

			//Check state against entity's prior state to update animation if necessary on instantiation.
			this['logical-state'](this.state);
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
					var testCase = false, i = 0,
					angle = null;
					
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
						this.anim.scaleX /= this.imageScaleX;
						this.anim.scaleY /= this.imageScaleY;
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
					
					if(this.stateChange){
						if(this.checkStates){
							for(; i < this.checkStates.length; i++){
								testCase = this.checkStates[i](this.state);
								if(testCase){
									if(this.currentAnimation !== testCase){
										if(!this.followThroughs[this.currentAnimation] && (!this.forcePlaythrough || (this.animationFinished || (this.lastState >= +i)))){
											this.currentAnimation = testCase;
											this.lastState = +i;
											this.animationFinished = false;
											this.anim.gotoAndPlay(testCase);
										} else {
											this.waitingAnimation = testCase;
											this.waitingState = +i;
										}
									} else if(this.waitingAnimation && !this.followThroughs[this.currentAnimation]) {// keep animating this animation since this animation has already overlapped the waiting animation.
										this.waitingAnimation = false;
									}
									break;
								}
							}
						}
						this.stateChange = false;
					}
				};
			})(),
			
			"logical-state": function(state){
				this.stateChange = true;
				if(state['hidden'] !== undefined) {
					this.container.hidden = state['hidden'];
				}
			},
			
			"hide-animation": function(){
				this.container.hidden = true;
			},

			"show-animation": function(){
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

					this.anim.addEventListener('mousedown', function(event) {
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
					this.anim.addEventListener('mouseout', function(){over = false;});
					this.anim.addEventListener('mouseover', function(){over = true;});
				}
				if(this.hover){
					this.stage.enableMouseOver();
					this.anim.addEventListener('mouseout', function(event){
						over = false;
						self.owner.trigger('mouseout', {
							event: event.nativeEvent,
							over: over,
							x: event.stageX,
							y: event.stageY,
							entity: self.owner
						});
					});
					this.anim.addEventListener('mouseover', function(event){
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
			
			addPins: function(pins, regXs, regYs){
				var i = 0, j = 0, pin = null, regX = 0, regY = 0,
				isRegArray = !((typeof regXs === 'number') && (typeof regYs === 'number'));
				
				if(!isRegArray){
					regX = regXs;
					regY = regYs;
				}
				
				this.pinsToRemove = this.pinsToRemove || [];
				
				this.pins = {};
				
				for (; i < pins.length; i++){
					this.pinsToRemove.push(pins[i].pinId);

					if(isRegArray){
						regX = regXs[i];
						regY = regYs[i];
					}
					
					this.pins[pins[i].pinId] = pin = {
						pinId: pins[i].pinId,
						animation: this.anim,
						container: this.container
					};
					if((typeof pins[i].x === 'number') && (typeof pins[i].y === 'number')){
						pin.defaultPin = {
							x: (pins[i].x - regX),
							y: (pins[i].y - regY),
							z: pins[i].z || 0.00000001 //force z to prevent flickering z-order issues.
						};
					}
					
					if(pins[i].frames){
						pin.frames = [];
						for (j = 0; j < pins[i].frames.length; j++){
							if(pins[i].frames[j]){
								if((typeof pins[i].frames[j].x === 'number') && (typeof pins[i].frames[j].y === 'number')){
									pin.frames.push({
										x: (pins[i].frames[j].x - regX),
										y: (pins[i].frames[j].y - regY),
										z: pins[i].frames[j].z || (pin.defaultPin?pin.defaultPin.z:0.00000001)
									});
								} else if (pin.defaultPin) {
									if(typeof pins[i].frames[j].x === 'number'){
										pin.frames.push({
											x: (pins[i].frames[j].x - regX),
											y: pin.defaultPin.y,
											z: pins[i].frames[j].z || pin.defaultPin.z
										});
									} else if(typeof pins[i].frames[j].y === 'number'){
										pin.frames.push({
											x: pin.defaultPin.x,
											y: (pins[i].frames[j].y - regY),
											z: pins[i].frames[j].z || pin.defaultPin.z
										});
									} else {
										pin.frames.push(null);
									} 
								} else {
									pin.frames.push(null);
	 							}
							} else {
								pin.frames.push(null);
							}
						}
					}
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
				this.followThroughs = null;
				this.anim = undefined;
				this.container = undefined;
			}
		}
	});
})();
