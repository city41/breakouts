/**
# COMPONENT **camera**
This component controls the game camera deciding where and how it should move. The camera also broadcasts messages when the window resizes or its orientation changes.

## Dependencies:
- **rootElement** property (on entity) - This component requires a DOM element which it uses as the "window" determining the camera's aspect ratio and size.

## Messages

### Listens for:
- **tick, camera** - On a `tick` or `camera` step message, the camera updates its location according to its current state.
  - @param message.deltaT - If necessary, the current camera update function may require the length of the tick to adjust movement rate.
- **follow** - On receiving this message, the camera begins following the requested object.
  - @param message.mode (string) - Required. Can be "locked", "forward", "bounding", or "static". "static" suspends following, but the other three settings require that the entity parameter be defined. Also set the bounding area parameters if sending "bounding" as the following method and the movement parameters if sending "forward" as the following method.
  - @param message.entity ([[Entity]]) - The entity that the camera should commence following.
  - @param message.top (number) - The top of a bounding box following an entity.
  - @param message.left (number) - The left of a bounding box following an entity.
  - @param message.width (number) - The width of a bounding box following an entity.
  - @param message.height (number) - The height of a bounding box following an entity.
  - @param message.movementX (number) - Movement multiplier for focusing the camera ahead of a moving entity in the horizontal direction.
  - @param message.movementY (number) - Movement multiplier for focusing the camera ahead of a moving entity in the vertical direction.
  - @param message.offsetX (number) - How far to offset the camera from the entity horizontally.
  - @param message.offsetY (number) - How far to offset the camera from the entity vertically.
  - @param message.time (number) - How many milliseconds to follow the entity.
- **resize, orientationchange** - The camera listens for these events passed along from [[Game]] (who receives them from `window`). It adjusts the camera viewport according to the new size and position of the window.
- **world-loaded** - On receiving this message, the camera updates its world location and size as necessary. An example of this message is triggered by the [[Tiled-Loader]] component.
  - @param message.width (number) - Optional. The width of the loaded world.
  - @param message.height (number) - Optional. The height of the loaded world.
  - @param message.camera ([[Entity]]) - Optional. An entity that the camera should follow in the loaded world.
- **child-entity-added** - If children entities are listening for a `camera-update` message, they are added to an internal list.
  - @param message ([[Entity]]} - Expects an entity as the message object to determine whether to trigger `camera-update` on it.
- **child-entity-removed** - If children are removed from the entity, they are also removed from this component.
  - @param message ([[Entity]]} - Expects an entity as the message object to determine the entity to remove from its list.

### Child Broadcasts:
- **camera-loaded** - On receiving a "world-loaded" message, the camera broadcast the world size to all children in the world.
  - @param message.width (number) - The width of the loaded world.
  - @param message.height (number) - The height of the loaded world.
- **camera-update** - This component fires this message when the position of the camera in the world has changed.
  - @param message.viewportTop (number) - The top of the camera viewport in world coordinates.
  - @param message.viewportLeft (number) - The left of the camera viewport in world coordinates.
  - @param message.viewportWidth (number) - The width of the camera viewport in world coordinates.
  - @param message.viewportHeight (number) - The height of the camera viewport in world coordinates.
  - @param message.scaleX (number) - Number of window pixels that comprise a single world coordinate on the x-axis.
  - @param message.scaleY (number) - Number of window pixels that comprise a single world coordinate on the y-axis.

### Local Broadcasts:
- **camera-stationary** - This event is triggered when the camera stops moving.
- **camera-update** - This component fires this message when the position of the camera in the world has changed or if the window has been resized.
  - @param message.viewportTop (number) - The top of the camera viewport in world coordinates.
  - @param message.viewportLeft (number) - The left of the camera viewport in world coordinates.
  - @param message.viewportWidth (number) - The width of the camera viewport in world coordinates.
  - @param message.viewportHeight (number) - The height of the camera viewport in world coordinates.
  - @param message.scaleX (number) - Number of window pixels that comprise a single world coordinate on the x-axis.
  - @param message.scaleY (number) - Number of window pixels that comprise a single world coordinate on the y-axis.

## JSON Definition:
    {
      "type": "camera",
      
      "top": 100,
      // Optional number specifying top of viewport in world coordinates
      
      "left": 100,
      // Optional number specifying left of viewport in world coordinates
      
      "width": 100,
      // Optional number specifying width of viewport in world coordinates
      
      "height": 100,
      // Optional number specifying height of viewport in world coordinates
      
      "stretch": true,
      // Optional boolean value that determines whether the camera should stretch the world viewport when window is resized. Defaults to false which maintains the proper aspect ratio.
      
      "scaleWidth": 480,
      // Optional. Sets the size in window coordinates at which the world zoom should snap to a larger multiple of pixel size (1,2, 3, etc). This is useful for maintaining a specific game pixel viewport width on pixel art games so pixels use multiples rather than smooth scaling. Default is 0 which causes smooth scaling of the game world in a resizing viewport.
      
      "transitionX": 400,
      // Optional. Sets how quickly the camera should pan to a new position in the horizontal direction. Default is 400.
      
      "transitionY": 400,
      // Optional. Sets how quickly the camera should pan to a new position in the vertical direction. Default is 600.
      
      "threshold": 3
      // Optional. Sets how many units the followed entity can move before the camera will re-center. Default is 1.
    }
*/
(function(){
	var resize = function (self){
		
		//The dimensions of the camera in the window
		self.window.viewportTop = self.element.offsetTop;
		self.window.viewportLeft = self.element.offsetLeft;
		self.window.viewportWidth = self.element.offsetWidth || self.worldWidth;
		self.window.viewportHeight = self.element.offsetHeight || self.worldHeight;

		if(self.scaleWidth){
			self.world.viewportWidth = self.window.viewportWidth / Math.ceil(self.window.viewportWidth / self.scaleWidth);
		}
		
		if(!self.stretch || self.scaleWidth){
			self.world.viewportHeight = self.window.viewportHeight * self.world.viewportWidth / self.window.viewportWidth;
		}
		
		self.worldPerWindowUnitWidth  = self.world.viewportWidth / self.window.viewportWidth;
		self.worldPerWindowUnitHeight = self.world.viewportHeight / self.window.viewportHeight;
		self.windowPerWorldUnitWidth  = self.window.viewportWidth / self.world.viewportWidth;
		self.windowPerWorldUnitHeight = self.window.viewportHeight/ self.world.viewportHeight;
		
		self.windowResized = true;
	};

	return platformer.createComponentClass({
		id: 'camera',
		constructor: function(definition){
			this.entities = [];

			// on resize should the view be stretched or should the world's initial aspect ratio be maintained?
			this.stretch = definition.stretch || false;
			
			this.transitionX = definition.transitionX || definition.transition;
			this.transitionY = definition.transitionY || definition.transition;
			if(isNaN(this.transitionX)){
				this.transitionX = 400;
			}
			if(isNaN(this.transitionY)){
				this.transitionY = 600;
			}

			this.threshold = definition.threshold || 1;
			this.element = null;
	
			//The dimensions of the camera in the window
			this.window = {
				viewportTop:    0,
				viewportLeft:   0,
				viewportWidth:  0,
				viewportHeight: 0
			};
			
			//The dimensions of the camera in the game world
			this.world = {
				viewportWidth:       definition.width       || 0,
				viewportHeight:      definition.height      || 0,
				viewportLeft:        definition.left        || 0,
				viewportTop:         definition.top         || 0
			};
			
			this.message = { //defined here so it can be reused
				viewportWidth:  0,
				viewportHeight: 0,
				viewportLeft:   0,
				viewportTop:    0,
				scaleX: 0,
				scaleY: 0
			};
	
			// on resize should the game snap to certain sizes or should it be fluid?
			// 0 == fluid scaling
			// set the windowWidth multiple that triggers zooming in
			this.scaleWidth = definition.scaleWidth || 0;
			
			//Whether the map has finished loading.
			this.worldIsLoaded = false;
			// The dimensions of the entire world
			this.worldWidth  = definition.worldWidth  || definition.width       || 0;
			this.worldHeight = definition.worldHeight || definition.height      || 0;
			
			this.following = undefined;
			this.state = 'static';//'roaming';
			
			//FOLLOW MODE VARIABLES
			
			//--Bounding
			this.bBBorderX = 0;
			this.bBBorderY = 0;
			this.bBInnerWidth = 0;
			this.bBInnerHeight = 0;
			this.setBoundingArea();
			
			//Forward Follow
			this.lastLeft = this.world.viewportLeft;
			this.lastTop = this.world.viewportTop;
			this.forwardX = 0;
			this.forwardY = 0;
			this.averageOffsetX = 0;
			this.averageOffsetY = 0;
			this.offsetX = 0;
			this.offsetY = 0;
			this.forwardFollower = {
				x: this.lastLeft,
				y: this.lastTop
			};
			
			this.lastFollow = {
				entity: null,
				mode: null,
				offsetX: 0,
				offsetY: 0,
				begin: 0
			};
			
			this.direction = true;
			this.stationary = false;
			
			this.newChild = false;
		},
		events: {
			"load": function(){
				this.element = this.owner.canvas || this.owner.element || this.owner.rootElement;
				this.resize();
			},
			"child-entity-added": function(entity){
				var messageIds = entity.getMessageIds(); 
				
				for (var x = 0; x < messageIds.length; x++)
				{
					if (messageIds[x] == 'camera-update') {
						this.entities.push(entity);
						this.newChild = true;
						
						if(this.worldIsLoaded){
							entity.trigger('camera-loaded', {
								width: this.worldWidth,
								height: this.worldHeight
							});
						}

						break;
					}
				}
			},
			"child-entity-removed": function(entity){
				var x = 0;

				for (x in this.entities) {
					if(this.entities[x] === entity){
						this.entities.splice(x, 1);
						break;
					}
				}
			},
			"world-loaded": function(values){
				this.worldIsLoaded = true;
				this.worldWidth   = this.owner.worldWidth  = values.width;
				this.worldHeight  = this.owner.worldHeight = values.height;
				if(values.camera){
					this.follow(values.camera);
				}
				for (var x = this.entities.length - 1; x > -1; x--) {
					this.entities[x].trigger('camera-loaded', values);
				}
			},
			"tick": function(resp){
				var broadcastUpdate = this.newChild;
				
				this.newChild = false;
				
				switch (this.state)
				{
				case 'following':
					broadcastUpdate = this.followingFunction(this.following, resp.deltaT);
					break;
				case 'static':
				default:
					break;
				}
				
				if(broadcastUpdate || this.windowResized){
					this.stationary = false;
					
					this.message.viewportLeft   = this.world.viewportLeft;
					this.message.viewportTop    = this.world.viewportTop;
					this.message.viewportWidth  = this.world.viewportWidth;
					this.message.viewportHeight = this.world.viewportHeight;
					this.message.scaleX         = this.windowPerWorldUnitWidth;
					this.message.scaleY         = this.windowPerWorldUnitHeight;

					this.windowResized = false;
					this.owner.trigger('camera-update', this.message);

					if(broadcastUpdate){
						for (var x = this.entities.length - 1; x > -1; x--)
						{
							if(!this.entities[x].trigger('camera-update', this.message)){
								this.entities.splice(x, 1);
							}
						}
					}
				} else if (!this.stationary){
					this.owner.trigger('camera-stationary', this.message);
					this.stationary = true;
				}
				
				if(this.lastFollow.begin){
					if(this.lastFollow.begin < new Date().getTime()){
						this.follow(this.lastFollow);
					}
				}
			},
			"resize": function(){
				resize(this);
			},
			"orientationchange": function(){
				resize(this);
			},
			"follow": function (def){
				if (def.time){ //save current follow
					if(!this.lastFollow.begin){
						this.lastFollow.entity = this.following;
						this.lastFollow.mode   = this.mode;
						this.lastFollow.offsetX = this.offsetX;
						this.lastFollow.offsetY = this.offsetY;
					}
					this.lastFollow.begin  = new Date().getTime() + def.time;
				} else {
					if(this.lastFollow.begin){
						this.lastFollow.begin = 0;
					}
				}
				
				this.mode = def.mode;
				
				switch (def.mode) {
				case 'locked':
					this.state = 'following';
					this.following = def.entity;
					this.followingFunction = this.lockedFollow;
					this.offsetX = def.offsetX || 0;
					this.offsetY = def.offsetY || 0;
					break;
				case 'forward':
					this.state = 'following';
					this.followFocused = false;
					this.following = def.entity;
					this.lastLeft  = def.entity.x;
					this.lastTop   = def.entity.y;
					this.forwardX  = def.movementX || (this.transitionX / 10);
					this.forwardY  = def.movementY || 0;
					this.averageOffsetX = 0;
					this.averageOffsetY = 0;
					this.offsetX = def.offsetX || 0;
					this.offsetY = def.offsetY || 0;
					this.followingFunction = this.forwardFollow;
					break;
				case 'bounding':
					this.state = 'following';
					this.following = def.entity;
					this.offsetX = def.offsetX || 0;
					this.offsetY = def.offsetY || 0;
					this.setBoundingArea(def.top, def.left, def.width, def.height);
					this.followingFunction = this.boundingFollow;
					break;
				case 'static':
				default:
					this.state = 'static';
					this.following = undefined;
					this.followingFunction = undefined;
					break;
				}
				
				if(def.begin){ // get rid of last follow
					def.begin = 0;
				}

			}
		},
		
		methods: {
			move: function (newLeft, newTop){
				var moved = this.moveLeft(newLeft);
				moved = this.moveTop(newTop) || moved;
				return moved;
			},
			
			moveLeft: function (newLeft){
				if(Math.abs(this.world.viewportLeft - newLeft) > this.threshold){
					if (this.worldWidth < this.world.viewportWidth){
						this.world.viewportLeft = (this.worldWidth - this.world.viewportWidth) / 2;
					} else if (this.worldWidth && (newLeft + this.world.viewportWidth > this.worldWidth)) {
						this.world.viewportLeft = this.worldWidth - this.world.viewportWidth;
					} else if (this.worldWidth && (newLeft < 0)) {
						this.world.viewportLeft = 0; 
					} else {
						this.world.viewportLeft = newLeft;
					}
					return true;
				}
				return false;
			},
			
			moveTop: function (newTop) {
				if(Math.abs(this.world.viewportTop - newTop) > this.threshold){
					if (this.worldHeight < this.world.viewportHeight){
						this.world.viewportTop = (this.worldHeight - this.world.viewportHeight) / 2;
					} else if (this.worldHeight && (newTop + this.world.viewportHeight > this.worldHeight)) {
						this.world.viewportTop = this.worldHeight - this.world.viewportHeight;
					} else if (this.worldHeight && (newTop < 0)) {
						this.world.viewportTop = 0; 
					} else {
						this.world.viewportTop = newTop;
//						console.log(newTop + ',' + this.world.viewportHeight + ',' + this.worldHeight);
					}
					return true;
				}
				return false;
			},
			
			lockedFollow: function (entity, time, slowdown){
				var newLeft = entity.x - (this.world.viewportWidth / 2),
				newTop      = entity.y - (this.world.viewportHeight / 2),
				ratioX      = (this.transitionX?Math.min(time / this.transitionX, 1):1),
				iratioX     = 1 - ratioX,
				ratioY      = (this.transitionY?Math.min(time / this.transitionY, 1):1),
				iratioY     = 1 - ratioY;

				return this.move(ratioX * newLeft + iratioX * this.world.viewportLeft, ratioY * newTop + iratioY * this.world.viewportTop);
			},
			
			forwardFollow: function (entity, time){
				var ff = this.forwardFollower,
				standardizeTimeDistance = 15 / time, //This allows the camera to pan appropriately on slower devices or longer ticks
				moved  = false,
				x = entity.x + this.offsetX,
				y = entity.y + this.offsetY;
				
				if(this.followFocused && (this.lastLeft === x) && (this.lastTop === y)){
//					ff.x = this.world.viewportLeft + (this.world.viewportWidth  / 2); 
//					ff.y = this.world.viewportTop  + (this.world.viewportHeight / 2); 

					return this.lockedFollow(ff, time);
				} else {
					// span over last 10 ticks to prevent jerkiness
					this.averageOffsetX *= 0.9;
					this.averageOffsetY *= 0.9;
					this.averageOffsetX += 0.1 * (x - this.lastLeft) * standardizeTimeDistance;
					this.averageOffsetY += 0.1 * (y - this.lastTop)  * standardizeTimeDistance;

					if (Math.abs(this.averageOffsetX) > (this.world.viewportWidth / (this.forwardX * 2))){
						this.averageOffsetX = 0;
					}
					if (Math.abs(this.averageOffsetY) > (this.world.viewportHeight / (this.forwardY * 2))){
						this.averageOffsetY = 0;
					}
					
					ff.x = this.averageOffsetX * this.forwardX + x;
					ff.y = this.averageOffsetY * this.forwardY + y;
					
					this.lastLeft = x;
					this.lastTop  = y;
					
					moved = this.lockedFollow(ff, time);

					if(!this.followFocused && !moved){
						this.followFocused = true;
					}
					
					return moved;
				}
				
				
			},
			
			setBoundingArea: function (top, left, width, height){
				this.bBBorderY = (typeof top !== 'undefined') ? top : this.world.viewportHeight  * 0.25;
				this.bBBorderX = (typeof left !== 'undefined') ? left : this.world.viewportWidth * 0.4;
				this.bBInnerWidth = (typeof width !== 'undefined') ? width : this.world.viewportWidth - (2 * this.bBBorderX);
				this.bBInnerHeight = (typeof height !== 'undefined') ? height : this.world.viewportHeight - (2 * this.bBBorderY);
			},
			
			boundingFollow: function (entity, time){
				var newLeft = null,
				newTop      = null,
				ratioX      = (this.transitionX?Math.min(time / this.transitionX, 1):1),
				iratioX     = 1 - ratioX,
				ratioY      = (this.transitionY?Math.min(time / this.transitionY, 1):1),
				iratioY     = 1 - ratioY;
				
				if (entity.x > this.world.viewportLeft + this.bBBorderX + this.bBInnerWidth){
					newLeft = entity.x -(this.bBBorderX + this.bBInnerWidth);
				} else if (entity.x < this.world.viewportLeft + this.bBBorderX) {
					newLeft = entity.x - this.bBBorderX;
				}
				
				if (entity.y > this.world.viewportTop + this.bBBorderY + this.bBInnerHeight){
					newTop = entity.y - (this.bBBorderY + this.bBInnerHeight);
				} else if (entity.y < this.world.viewportTop + this.bBBorderY) {
					newTop = entity.y - this.bBBorderY;
				}
				
				if (typeof newLeft !== 'null'){
					newLeft = this.moveLeft(ratioX * newLeft + iratioX * this.world.viewportLeft);
				}
				
				if (typeof newTop !== 'null'){
					newTop = this.moveTop(ratioY * newTop + iratioY * this.world.viewportTop);
				}
				
				return newLeft || newTop;
			},
			
			windowToWorld: function (sCoords){
				var wCoords = [];
				wCoords[0] = Math.round((sCoords[0] - this.window.viewportLeft) * this.worldPerWindowUnitWidth);
				wCoords[1] = Math.round((sCoords[1] - this.window.viewportTop)  * this.worldPerWindowUnitHeight);
				return wCoords; 
			},
			
			worldToWindow: function (wCoords){
				var sCoords = [];
				sCoords[0] = Math.round((wCoords[0] * this.windowPerWorldUnitWidth) + this.window.viewportLeft);
				sCoords[1] = Math.round((wCoords[1] * this.windowPerWorldUnitHeight) + this.window.viewportTop);
				return sCoords;
			},
			
			destroy: function(){
				this.entities.length = 0;
			}
		}
	});
})();
