/**
# COMPONENT **render-tiles**
This component handles rendering tile map backgrounds. When rendering the background, this component figures out what tiles are being displayed as caches them so they are rendered as one image rather than individually. As the camera moves, the cache is updated by blitting the relevant part of the old cached image into the new cached image and then rendering the tiles that have shifted into the camera's view into the cache.

## Dependencies:
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas functionality.
- [[handler-render-createjs]] (on entity's parent) - This component listens for a render "handle-render-load" message to setup and display the content. This component is removed from the Handler-Render-Createjs list after the first tick because it doesn't possess a handle-render function. Instead it uses the camera-update function to update itself.

## Messages

### Listens for:
- **add-tiles** - This event adds a layer of tiles to render on top of the existing layer of rendered tiles.
  - @param message.imageMap (2d array) - Required. This lists a mapping of tile indexes to be rendered.
- **camera-loaded** - Provides the width and height of the world.
- **camera-update** - Triggered when the camera moves, this function updates which tiles need to be rendered and caches the image.
  - @param camera (object) - Required. Provides information about the camera.
- **handle-render-load** - This event is triggered before `handle-render` and provides the CreateJS stage that this component will require to display. In this case it compiles the array of tiles that make up the map and adds the tilesToRender displayObject to the stage.
  - @param message.stage ([createjs.Stage][link2]) - Required. Provides the render component with the CreateJS drawing [Stage][link2].

## JSON Definition
    {
      "type": "render-animation",
      "spritesheet": 
      //Required - The spritesheet for all the tile images.
      "imageMap" : [],
      //Required - This is a two dimensional array of the spritesheet indexes that describe the map that you're rendering.
	  "scaleX" : 1,
	  //Optional - The x-scale the tilemap is being displayed at. Defaults to 1.
	  "scaleY"  : 1,
	  //Optional - The y-scale the tilemap is being displayed at. Defaults to 1.
	  "tileWidth"  : 32,
	  //Optional - The the width in pixels of a tile. Defaults to 10.
	  "tileHeight"  : 32,
	  //Optional - The the height in pixels of a tile. Defaults to 10.
	  "buffer"  : 32
	  //Optional - The amount of space in pixels around the edge of the camera that we include in the buffered image. Is multiplied by the scaleX to get the actual buffersize. Defaults to the tileWidth.
    }
    
[link1]: http://www.createjs.com/Docs/EaselJS/module_EaselJS.html
[link2]: http://createjs.com/Docs/EaselJS/Stage.html
*/
(function(){
	var initializeCanvasConservation = function(displayObject){ //To make CreateJS Display Object have better canvas conservation.
		var canvas = [document.createElement("canvas"), document.createElement("canvas")],
		current    = 0;
		
		if(!displayObject.___cache){ //make sure this is only set up once
			displayObject.___cache = displayObject.cache;
			
			displayObject.cache = function(x, y, width, height, scale) {
				current = 1 - current;
				this.cacheCanvas = canvas[current];
				this.___cache(x, y, width, height, scale);
			};
		}
		
		return displayObject;
	},
	transform = {
		x: 1,
		y: 1,
		t: -1,
		r: 0
	},
	transformCheck = function(value){
		var v = +(value.substring(4)),
		resp  = transform,
		a = !!(0x20000000 & v),
		b = !!(0x40000000 & v),
		c = !!(0x80000000 & v);
		
		resp.t = 0x0fffffff & v;
		resp.x = 1;
		resp.y = 1;
		resp.r = 0;

		if(a || b || c){
			if(a && b && c){
				resp.x = -1;
				resp.r = 90;
			} else if (a && c){
				resp.r = 90;
			} else if (b && c){
				resp.r = 180;
			} else if (a && b){
				resp.r = 270;
			} else if (a){
				resp.y = -1;
				resp.r = 90;
			} else if (b){
				resp.y = -1;
			} else if (c){
				resp.x = -1;
			}
		}
		return resp;
	};

	return platformer.createComponentClass({
		
		id: 'render-tiles',
		
		constructor: function(definition){
			var x = 0,
			images = definition.spriteSheet.images.slice(),
			spriteSheet = null,
			scaleX = 1,
			scaleY = 1;
			
			if(images[0] && (typeof images[0] === 'string')){
				images = images.slice(); //so we do not overwrite settings array
				for (x = 0; x < images.length; x++){
					if(platformer.assets[images[x]]){
						images[x] = platformer.assets[images[x]];
					}
				}
			}
	
			spriteSheet = {
				images: images,
				frames: definition.spriteSheet.frames,
				animations: definition.spriteSheet.animations
			};
			scaleX = spriteSheet.images[0].scaleX || 1;
			scaleY = spriteSheet.images[0].scaleY || 1;
	
			if((scaleX !== 1) || (scaleY !== 1)){
				spriteSheet.frames = {
					width: spriteSheet.frames.width * scaleX,	
					height: spriteSheet.frames.height * scaleY,	
					regX: spriteSheet.frames.regX * scaleX,	
					regY: spriteSheet.frames.regY * scaleY
				};
			}
	
			this.controllerEvents = undefined;
			this.spriteSheet   = new createjs.SpriteSheet(spriteSheet);
			this.imageMap      = definition.imageMap   || [];
			this.tiles         = {};
			this.tilesToRender = undefined;
			this.scaleX        = ((definition.scaleX || 1) * (this.owner.scaleX || 1)) / scaleX;
			this.scaleY        = ((definition.scaleY || 1) * (this.owner.scaleY || 1)) / scaleY;
			this.tileWidth     = definition.tileWidth  || (this.owner.tileWidth / this.scaleX)  || 10;
			this.tileHeight    = definition.tileHeight || (this.owner.tileHeight / this.scaleY) || 10;
			
			// temp values
			this.worldWidth    = this.tilesWidth    = this.tileWidth;
			this.worldHeight   = this.tilesHeight   = this.tileHeight;
			
			
			var buffer = (definition.buffer || (this.tileWidth * 3 / 4)) * this.scaleX;
			this.camera = {
				x: -buffer - 1, //to force camera update
				y: -buffer - 1,
				buffer: buffer
			};
			this.cache = {
				minX: -1,
				minY: -1,
				maxX: -1,
				maxY: -1
			};
			
			this.doubleBuffer = [null, null];
			this.currentBuffer = 0;
		},

		events: {// These are messages that this component listens for
			"handle-render-load": function(resp){
				var x = 0,
				y     = 0,
				stage = this.stage = resp.stage,
				index = '',
				imgMapDefinition = this.imageMap,
				newImgMap = [];
				
				this.tilesToRender = initializeCanvasConservation(new createjs.Container());
				this.tilesToRender.name = 'entity-managed'; //its visibility is self-managed
				
				for(x = 0; x < imgMapDefinition.length; x++){
					newImgMap[x] = [];
					for (y = 0; y < imgMapDefinition[x].length; y++){
						newImgMap[x][y] = index = imgMapDefinition[x][y];
						if(!this.tiles[index]){
							this.tiles[index] = this.createTile(index);
						}
					}
				}
				this.imageMap = newImgMap;
				
				this.tilesWidth  = x * this.tileWidth;
				this.tilesHeight = y * this.tileHeight;
				
				this.tilesToRender.scaleX = this.scaleX;
				this.tilesToRender.scaleY = this.scaleY;
				this.tilesToRender.z = this.owner.z;
		
				stage.addChild(this.tilesToRender);
			},
	
			"add-tiles": function(definition){
				var x = 0,
				y     = 0,
				map   = definition.imageMap,
				index = '',
				newIndex = 0;
				
				if(map){
					for(x = 0; x < this.imageMap.length; x++){
						for (y = 0; y < this.imageMap[x].length; y++){
							newIndex = map[x][y];
							index = this.imageMap[x][y];
							if(this.tiles[index]){
								delete this.tiles[index];
							}
							index = this.imageMap[x][y] += ' ' + newIndex;
							if(!this.tiles[index]){
								this.tiles[index] = this.createTile(index);
							}
						}
					}
				}
			},

			"camera-loaded": function(dimensions){
				this.worldWidth  = dimensions.width;
				this.worldHeight = dimensions.height;
			},

			"camera-update": function(camera){
				var x  = 0,
				y      = 0,
				buffer = this.camera.buffer,
				cache  = this.cache,
				context= null,
				canvas = null,
				width  = 0,
				height = 0,
				maxX   = 0,
				maxY   = 0,
				minX   = 0,
				minY   = 0,
				camL   = this.convertCamera(camera.viewportLeft, this.worldWidth, this.tilesWidth, camera.viewportWidth),
				camT   = this.convertCamera(camera.viewportTop, this.worldHeight, this.tilesHeight, camera.viewportHeight),
				vpL    = Math.floor(camL / this.tileWidth)  * this.tileWidth,
				vpT    = Math.floor(camT / this.tileHeight) * this.tileHeight,
				tile   = null;
				
				this.tilesToRender.x = camera.viewportLeft - camL;
				this.tilesToRender.y = camera.viewportTop  - camT;
						
				if (((Math.abs(this.camera.x - vpL) > buffer) || (Math.abs(this.camera.y - vpT) > buffer)) && (this.imageMap.length > 0)){
					this.camera.x = vpL;
					this.camera.y = vpT;
					
					//only attempt to draw children that are relevant
					maxX = Math.min(Math.ceil((vpL + camera.viewportWidth + buffer) / (this.tileWidth * this.scaleX)), this.imageMap.length) - 1;
					minX = Math.max(Math.floor((vpL - buffer) / (this.tileWidth * this.scaleX)), 0);
					maxY = Math.min(Math.ceil((vpT + camera.viewportHeight + buffer) / (this.tileHeight * this.scaleY)), this.imageMap[0].length) - 1;
					minY = Math.max(Math.floor((vpT - buffer) / (this.tileHeight * this.scaleY)), 0);
		
					if((maxY > cache.maxY) || (minY < cache.minY) || (maxX > cache.maxX) || (minX < cache.minX)){
						if(this.tilesToRender.cacheCanvas){
							canvas = this.tilesToRender.cacheCanvas;
							this.tilesToRender.uncache();
						}
						
						this.tilesToRender.removeChildAt(0);
						this.tilesToRender.cache(minX * this.tileWidth, minY * this.tileHeight, (maxX - minX + 1) * this.tileWidth, (maxY - minY + 1) * this.tileHeight, 1);
						
						for(x = minX; x <= maxX; x++){
							for (y = minY; y <= maxY; y++){
								if((y > cache.maxY) || (y < cache.minY) || (x > cache.maxX) || (x < cache.minX)){
									tile = this.tiles[this.imageMap[x][y]];
									this.tilesToRender.removeChildAt(0); // Leaves one child in the display object so createjs will render the cached image.
									this.tilesToRender.addChild(tile);
									tile.x = (x + 0.5) * this.tileWidth;
									tile.y = (y + 0.5) * this.tileHeight;
									this.tilesToRender.updateCache('source-over');
								}
							}
						}
		
						if(canvas){
							context = this.tilesToRender.cacheCanvas.getContext('2d');
							width   = (cache.maxX - cache.minX + 1) * this.tileWidth;
							height  = (cache.maxY - cache.minY + 1) * this.tileHeight;
							context.drawImage(canvas, 0, 0, width, height, (cache.minX - minX) * this.tileWidth, (cache.minY - minY) * this.tileHeight, width, height);
							cache.minX = minX;
							cache.minY = minY;
							cache.maxX = maxX;
							cache.maxY = maxY;
						}
					}
				}
			}
		},
	
		methods:{
			convertCamera: function(distance, worldDistance, tileDistance, viewportDistance){
				if((worldDistance / this.scaleX) == tileDistance){
					return distance;
				} else {
					return distance * (tileDistance - viewportDistance) / ((worldDistance / this.scaleX) - viewportDistance);
				}
			},
			
			createTile: function(imageName){
				var i = 1,
				imageArray = imageName.split(' '),
				mergedTile = null,
				tile  = new createjs.BitmapAnimation(this.spriteSheet),
				layer = transformCheck(imageArray[0]);
				
				tile.x = 0;
				tile.y = 0;
				tile.regX = this.tileWidth / 2;
				tile.regY = this.tileHeight / 2;
				tile.scaleX = layer.x;
				tile.scaleY = layer.y;
				tile.rotation = layer.r;
				tile.gotoAndStop('tile' + layer.t);
				
				for (; i < imageArray.length; i++){
					if(imageArray[i] !== 'tile-1'){
						if(!mergedTile){
							mergedTile = new createjs.Container();
							mergedTile.addChild(tile);
							mergedTile.cache(-this.tileWidth/2,-this.tileHeight/2,this.tileWidth,this.tileHeight,1);
							
//							document.getElementsByTagName('body')[0].appendChild(mergedTile.cacheCanvas);
//							mergedTile.cacheCanvas.setAttribute('title', imageName + ': ' + mergedTile._cacheOffsetX + 'x' + mergedTile._cacheOffsetY + ', ' + mergedTile.cacheCanvas.width + 'x' + mergedTile.cacheCanvas.height + ', ' + mergedTile._cacheScale + ', ' + mergedTile.cacheID + ', ' + !!mergedTile.filters);
							//console.log(imageName);
						}
						layer = transformCheck(imageArray[i]);
						tile.scaleX = layer.x;
						tile.scaleY = layer.y;
						tile.rotation = layer.r;
						tile.gotoAndStop('tile' + layer.t);
						mergedTile.updateCache('source-over');
					}
				}

				if(mergedTile){
					return mergedTile;
				} else {
					tile.cache(0,0,this.tileWidth,this.tileHeight,1);
					return tile;
				}
			},
			
			destroy: function(){
				this.tilesToRender.removeAllChildren();
				this.stage.removeChild(this.tilesToRender);
				this.imageMap.length = 0;
				this.tiles = undefined;
				this.camera = undefined;
				this.stage = undefined;
				this.tilesToRender = undefined;
			}
		}
	});
})();
