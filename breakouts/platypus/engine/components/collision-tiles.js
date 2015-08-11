/**
# COMPONENT **collision-tiles**
This component causes the tile-map to collide with other entities. It must be part of a collision group and will cause "hit-by-tile" messages to fire on colliding entities.

## Dependencies:
- [[handler-collision]] (on entity's parent) - This component handles the collision state of the map for the [[handler-collision]] component on the parent entity.
- [[Collision-Shape]] object - This component uses collisionShape objects to expose individual tiles to the collision group.

## Methods

- **getTiles** - Returns all the collision tiles within the provided axis-aligned bounding box.
  - @param aabb ([[Aabb]]) - The axis-aligned bounding box for which tiles should be returned.
  - @return tiles (Array of objects) - Each returned object provides the shape [[collisionShape]] of the tile and the grid coordinates of the returned tile.
- **getAABB** - Returns the axis-aligned bounding box of the entire map.
  - @return aabb (object) - The returned object provides the top, left, width, and height of the collision map.
- **isTile** - Confirms whether a particular map grid coordinate contains a tile.
  - @param x (number) - Integer specifying the row of tiles in the collision map to check.
  - @param y (number) - Integer specifying the column of tiles in the collision map to check.
  - @return isTile (boolean) - Returns `true` if the coordinate contains a collision tile, `false` if it does not.

## JSON Definition:
    {
      "type": "collision-tiles",
      
      "collisionMap": [[-1,-1,-1], [1,-1,-1], [1,1,1]],
      // Required. A 2D array describing the tile-map with off (-1) and on (!-1) states. Numbers > -1 are solid and numbers -2, -3, -4, and -5 provide for jumpthrough tiles with the solid side being top, right, bottom, and left respectively.
      
      "tileWidth": 240,
      // Optional. The width of tiles in world coordinates. Defaults to 10.
      
      "tileHeight": 240,
      // Optional. The height of tiles in world coordinates. Defaults to 10.
    }
*/
(function(){
	var storedTiles = [],
	storedTileIndex = 0,
	serveTiles = [];

	return platformer.createComponentClass({
		id: 'collision-tiles',
		
		constructor: function(definition){
			this.collisionMap   = definition.collisionMap  || [];
			this.tileWidth      = definition.tileWidth  || this.owner.tileWidth  || 10;
			this.tileHeight     = definition.tileHeight || this.owner.tileHeight || 10;
			this.tileHalfWidth  = this.tileWidth  / 2;
			this.tileHalfHeight = this.tileHeight / 2;
		},
		
		methods:{
			getShape: function(prevAABB, x, y){
				var shape = null;
				
				if(storedTileIndex < storedTiles.length){
					shape = storedTiles[storedTileIndex];
					storedTileIndex += 1;
					shape.update(x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight);
				} else {
					storedTiles.push(new platformer.classes.collisionShape(null, {
						x:      x * this.tileWidth  + this.tileHalfWidth,
						y:      y * this.tileHeight + this.tileHalfHeight,
						type:   'rectangle',
						width:  this.tileWidth,
						height: this.tileHeight
					}, 'tiles'));
					shape = storedTiles[storedTileIndex];
				}
				
				return shape;
			},
			
			addShape: function(shapes, prevAABB, x, y){
				if (this.collisionMap[x][y] > -1) {
					shapes.push(this.getShape(prevAABB, x, y));
				} else if (this.collisionMap[x][y] < -1) {
					switch(this.collisionMap[x][y]){
					case -2: //Top
						if(prevAABB.bottom <= y * this.tileHeight){
							shapes.push(this.getShape(prevAABB, x, y));
						}
						break;
					case -3: //Right
						if(prevAABB.left >= (x + 1) * this.tileWidth){
							shapes.push(this.getShape(prevAABB, x, y));
						}
						break;
					case -4: //Bottom
						if(prevAABB.top >= (y + 1) * this.tileHeight){
							shapes.push(this.getShape(prevAABB, x, y));
						}
						break;
					case -5: //Left
						if(prevAABB.right <= x * this.tileWidth){
							shapes.push(this.getShape(prevAABB, x, y));
						}
						break;
					}
				}
				return shapes;
			}
		},
		
		publicMethods:{
			getAABB: function(){
				return {
					left: 0,
					top:  0,
					right: this.tileWidth * this.collisionMap.length,
					bottom: this.tileHeight * this.collisionMap.length[0]
				};
			},
			
			isTile: function (x, y) {
				return !((x < 0) || (y < 0) || (x >= this.collisionMap.length) || (y >= this.collisionMap[0].length) || (this.collisionMap[x][y] === -1));
			},
			
			getTileShapes: function(aabb, prevAABB){
				var left = Math.max(Math.floor(aabb.left   / this.tileWidth),  0),
				top      = Math.max(Math.floor(aabb.top    / this.tileHeight), 0),
				right    = Math.min(Math.ceil(aabb.right   / this.tileWidth),  this.collisionMap.length),
				bottom   = Math.min(Math.ceil(aabb.bottom  / this.tileHeight), this.collisionMap[0].length),
				x        = 0,
				y        = 0,
				shapes   = serveTiles;
				
				serveTiles.length = 0;
				storedTileIndex   = 0;
				
				for (x = left; x < right; x++){
					for (y = top; y < bottom; y++){
						this.addShape(shapes, prevAABB, x, y);
					}
				}
				
				return shapes;
			}
		}
	});
})();