/**
# COMPONENT **handler-render-createjs**
A component that handles updating rendering for components that are rendering via createjs. Each tick it calls all the entities that accept 'handle-render' messages.

## Dependencies
- **Needs a 'tick' or 'render' call** - This component doesn't need a specific component, but it does require a 'tick' or 'render' call to function. It's usually used as a component of an action-layer.
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas functionality.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added to the parent and should be considered for addition to the handler. If the entity has a 'handle-render' or 'handle-render-load' message id it's added to the list of entities. Entities are sent a reference to the stage that we're rendering to, so they can add their display objects to it. 
  - @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick, render** - Sends a 'handle-render' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list. This function also sorts the display objects in the stage according to their z value. We detect when new objects are added by keeping track of the first element. If it changes the list gets resorted. Finally the whole stage is updated by CreateJS.
  - @param resp (object) - An object containing deltaT which is the time passed since the last tick. 
- **camera-update** - Called when the camera moves in the world, or if the window is resized. This function sets the canvas size and the stage transform.
  - @param cameraInfo (object) - An object containing the camera information. 

### Local Broadcasts:
- **mousedown** - This component captures this event on the canvas and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - This component captures this event on the canvas and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - This component captures this event on the canvas and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  

### Child Broadcasts:
- **handle-render** - Sent to entities to run their render for the tick.
  - @param object (object) - An object containing a deltaT variable that is the time that's passed since the last tick.
- **handle-render-load** - Sent to entities when they are added to the handler. Sends along the stage object so the entity can add its display objects. It also sends the parent DOM element of the canvas.
  - @param object.stage ([createjs.Stage][link2]) - The createjs stage object.
  - @param object.parentElement (object) - The DOM parent element of the canvas. 

## JSON Definition
    {
      "type": "handler-render-createjs",
      
      "acceptInput": {
      	//Optional - What types of input the object should take. This component defaults to not accept any input.
      	"touch": false, // Whether to listen for touch events (triggers mouse events)
      	"click": false, // Whether to listen for mouse events
      	"camera": false // Whether camera movement while the mouse (or touch) is triggered should result in a mousemove event
      },
      "autoClear": false, //By default this is set to false. If true the canvas will be cleared each tick.
      
      "buffer" : 12,		//The buffer area around the camera in which entities are rendered. This value changes the buffer in all directions. Defaults to the camera width / 12.
      "bufferWidth" : 12, 	//The buffer area around the camera in which entities are rendered. This value changes the buffer in width only and overrides the buffer value. Defaults to the camera width / 12.
      "bufferHeight" : 12, 	//The buffer area around the camera in which entities are rendered. This value changes the buffer in height only and overrides the buffer value. Defaults to the camera width / 12.
      "bufferLeft" : 12,	//The buffer area around the camera in which entities are rendered. This value changes the buffer at the left of the camera and overrides buffer and bufferWidth. Defaults to the camera width / 12.
      "bufferRight" : 12,	//The buffer area around the camera in which entities are rendered. This value changes the buffer at the right of the camera and overrides buffer and bufferWidth. Defaults to the camera width / 12.
      "bufferTop" : 12,		//The buffer area around the camera in which entities are rendered. This value changes the buffer at the top of the camera and overrides buffer and bufferHeight. Defaults to the camera width / 12.
      "bufferBottom" : 12	//The buffer area around the camera in which entities are rendered. This value changes the buffer at the bottom of the camera and overrides buffer and bufferHeight. Defaults to the camera width / 12.
    }
    
[link1]: http://www.createjs.com/Docs/EaselJS/module_EaselJS.html
[link2]: http://createjs.com/Docs/EaselJS/Stage.html
*/
(function(){

	return platformer.createComponentClass({

		id: "handler-render-createjs",
		
		constructor: function(definition){
			var self = this;
			
			this.entities = [];
			
			this.canvas = this.owner.canvas = document.createElement('canvas');
			this.owner.canvasParent = null;
			if(this.owner.element){
				this.owner.canvasParent = this.owner.element;
				this.owner.element.appendChild(this.canvas);
			} else {
				this.owner.canvasParent = this.owner.rootElement;
				this.owner.rootElement.appendChild(this.canvas);
				this.owner.element = this.canvas; 
			}
			
			this.stage = new createjs.Stage(this.canvas);
			
			if(definition.autoClear !== true){
				this.stage.autoClear = false; //since most tile maps are re-painted every time, the canvas does not require clearing.
			}
			
			// The following appends necessary information to displayed objects to allow them to receive touches and clicks
			if(definition.acceptInput){
				if(definition.acceptInput.click || definition.acceptInput.touch){
					this.setupInput(definition.acceptInput.touch, definition.acceptInput.camera);
				}
			}
			
			this.camera = {
				left: 0,
				top: 0,
				width: 0,
				height: 0,
				bufferLeft: 	definition.bufferLeft 	|| definition.bufferWidth || definition.buffer || -1,
				bufferRight: 	definition.bufferRight 	|| definition.bufferWidth || definition.buffer || -1,
				bufferTop: 		definition.bufferTop 	|| definition.bufferHeight || definition.buffer || -1,
				bufferBottom: 	definition.bufferBottom || definition.bufferHeight || definition.buffer || -1
			};
			
			this.timeElapsed = {
				name: 'Render',
				time: 0
			};
			
			this.renderMessage = {
				deltaT: 0,
				stage:  this.stage
			};
		},
		
		events:{
			"child-entity-added": function(entity){
				var self = this,
				messageIds = entity.getMessageIds(); 
				
				for (var x = 0; x < messageIds.length; x++)
				{
					if ((messageIds[x] == 'handle-render') || (messageIds[x] == 'handle-render-load')){
						this.entities.push(entity);
						entity.trigger('handle-render-load', {
							stage: self.stage,
							parentElement: self.owner.rootElement
						});
						break;
					}
				}
			},
			"pause-render": function(resp){
				if(resp && resp.time){
					this.paused = resp.time;
				} else {
					this.paused = -1;
				}
			},
			"unpause-render": function(){
				this.paused = 0;
			},
			"tick": (function(){
				var sort = function(a, b) {
					return a.z - b.z;
				};
				
				return function(resp){
					var child = undefined,
					time      = new Date().getTime(),
					message   = this.renderMessage;
					
					message.deltaT = resp.deltaT;

					if(this.paused > 0){
						this.paused -= resp.deltaT;
						if(this.paused < 0){
							this.paused = 0;
						}
					}

					for (var x = this.entities.length - 1; x > -1; x--){
						if(!this.entities[x].trigger('handle-render', message)) {
							this.entities.splice(x, 1);
						}
					}
					if(this.stage){
						for (var x = this.stage.children.length - 1; x > -1; x--){
							child = this.stage.children[x];
							if (child.hidden) {
								if(child.visible) child.visible = false;
							} else if(child.name !== 'entity-managed'){
								if((child.x >= this.camera.x - this.camera.bufferLeft) && (child.x <= this.camera.x + this.camera.width + this.camera.bufferRight) && (child.y >= this.camera.y - this.camera.bufferTop) && (child.y <= this.camera.y + this.camera.height + this.camera.bufferBottom)){
									if(!child.visible) child.visible = true;
								} else {
									if(child.visible) child.visible = false;
								}
							}
							
							if(child.visible){
								if (child.paused && !this.paused){
									child.paused = false;
								} else if (this.paused) {
									child.paused = true;
								}
							}
							
							if(!child.scaleX || !child.scaleY || (this.children && !this.children.length)){
								console.log ('uh oh', child);
//								this.cacheCanvas || this.children.length;
			//					return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
							}
						}

						if (this.stage.reorder) {
							this.stage.reorder = false;
							this.stage.sortChildren(sort);
						}
						
						this.timeElapsed.name = 'Render-Prep';
						this.timeElapsed.time = new Date().getTime() - time;
						platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
						time += this.timeElapsed.time;

						this.stage.update();
						this.timeElapsed.name = 'Render';
						this.timeElapsed.time = new Date().getTime() - time;
						platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
					} 
				};
			})(),
			"camera-update": function(cameraInfo){
				var dpr = (window.devicePixelRatio || 1);
				
				this.camera.x = cameraInfo.viewportLeft;
				this.camera.y = cameraInfo.viewportTop;
				this.camera.width = cameraInfo.viewportWidth;
				this.camera.height = cameraInfo.viewportHeight;
				if(this.camera.bufferLeft == -1) {
					this.camera.bufferLeft = this.camera.width / 12; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				if(this.camera.bufferRight == -1) {
					this.camera.bufferRight = this.camera.width / 12; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				if(this.camera.bufferTop == -1) {
					this.camera.bufferTop = this.camera.width / 12; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				if(this.camera.bufferBottom == -1) {
					this.camera.bufferBottom = this.camera.width / 12; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				
				this.canvas.width  = this.canvas.offsetWidth * dpr;
				this.canvas.height = this.canvas.offsetHeight * dpr;
				this.stage.setTransform(-cameraInfo.viewportLeft * cameraInfo.scaleX * dpr, -cameraInfo.viewportTop * cameraInfo.scaleY * dpr, cameraInfo.scaleX * dpr, cameraInfo.scaleY * dpr);
				
				if(this.moveMouse){
					this.moveMouse(cameraInfo);
				}
			}
		},
		methods:{
			setupInput: function(enableTouch, cameraMovementMovesMouse){
				var self = this,
				originalEvent   = null,
				x        = 0,
				y        = 0,
				setXY   = function(event){
					originalEvent = event;
					x  = event.stageX / self.stage.scaleX + self.camera.x;
					y  = event.stageY / self.stage.scaleY + self.camera.y;
				},
				mousedown = function(event) {
					setXY(event);
					self.owner.trigger('mousedown', {
						event: event.nativeEvent,
						x: x,
						y: y,
						entity: self.owner
					});
					
					// This function is used to trigger a move event when the camera moves and the mouse is still triggered.
					if(cameraMovementMovesMouse){
						self.moveMouse = function(){
							setXY(originalEvent);
							self.owner.trigger('mousemove', {
								event: event.nativeEvent,
								x: x,
								y: y,
								entity: self.owner
							});
						};
					}
				},
				mouseup = function(event){
					setXY(event);
					self.owner.trigger('mouseup', {
						event: event.nativeEvent,
						x: x,
						y: y,
						entity: self.owner
					});
					if(cameraMovementMovesMouse){
						self.moveMouse = null;
					}
				},
				mousemove = function(event){
					setXY(event);
					if(event.nativeEvent.which || event.nativeEvent.touches){
						self.owner.trigger('mousemove', {
							event: event.nativeEvent,
							x: x,
							y: y,
							entity: self.owner
						});
					}
				};
				
				if(enableTouch && createjs.Touch.isSupported()){
					createjs.Touch.enable(this.stage);
				}

				this.stage.addEventListener('stagemousedown', mousedown);
				this.stage.addEventListener('stagemouseup', mouseup);
				this.stage.addEventListener('stagemousemove', mousemove);
				
				this.removeStageListeners = function(){
					this.stage.removeEventListener('stagemousedown', mousedown);
					this.stage.removeEventListener('stagemouseup', mouseup);
					this.stage.removeEventListener('stagemousemove', mousemove);
				};
			},
			
			destroy: function(){
				if(this.removeStageListeners){
					this.removeStageListeners();
				}
				this.stage = undefined;
				this.owner.canvasParent.removeChild(this.canvas);
				this.owner.canvasParent = null;
				this.owner.element = null;
				this.canvas = undefined;
				this.entities.length = 0;
			}
		}
	});
})();