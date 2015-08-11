/**
# CLASS collision-shape
This class defines a collision shape, which defines the 'space' an entity occupies in the collision system. Currently only rectangle shapes can be created (some code exists for right-triangles and circles, but the precise collision checking needed for these is not in place). Collision shapes include an axis-aligned bounding box (AABB) that tightly wraps the shape. The AABB is used for initial collision checks.

## Fields
- **offset** (number []) - An array of length 2 that holds the x and y offset of the collision shape from the owner entity's location.
- **x** (number) - The x position of the shape. The x is always located in the center of the object.
- **y** (number) - The y position of the shape. The y is always located in the center of the object.
- **prevX** (number) - The previous x position of the shape.
- **prevY** (number) - The previous y position of the shape.
- **type** (string) - The type of shape this is. Currently 'rectangle' is the default and only valid type.
- **subType** (string) - **Not Used** Only used for triangles, specifies which corner the right angle is in. Can be: tl, tr, bl, br.
- **points** (number [][]) - Points describing the shape. These points should describe the shape so that the center of the AABB will be at (0,0). For rectangles and circles you only need two points, a top-left and bottom-right. For triangles, you need three. The first should be the right angle, and it should proceed clockwise from there.
- **aABB** (object) - The AABB for this shape.
- **prevAABB** (object) - The previous location of the AABB for this shape.

## Methods
- **constructor** - Creates an object from the collisionShape class.
  - @param ownerLocation (number []) - An array [x,y] of the position.
  - @param type (string) - The type of shape this is. Currently 'rectangle' is the default and only valid type.
  - @param points (number [][]) - Points describing the shape. These points should describe the shape so that the center of the AABB will be at (0,0). For rectangles and circles you only need two points, a top-left and bottom-right. For triangles, you need three. The first should be the right angle, and it should proceed clockwise from there.
  - @param offset (number []) - An array of length 2 that holds the x and y offset of the shape from the owner's location.
- **update** - Updates the location of the shape and AABB. The position you send should be that of the owner, the offset of the shape is added inside the function.
  - @param ownerX (number) - The x position of the owner.
  - @param ownerY (number) - The y position of the owner.
- **reset** - Resets the location of the shape and AABBs so that the current and previous position are the same. The position you send should be that of the owner, the offset of the shape is added inside the function.
  - @param ownerX (number) - The x position of the owner.
  - @param ownerY (number) - The y position of the owner.
- **getXY** - Returns an array containing the position of the shape.
  - @return number [] - An array [x,y] of the position.
- **getX** - Returns the x position of the shape.
  - @return number - The x position.
- **getY** - Return the y position of the shape.
  - @return number - The y position.
- **getPrevXY** - Returns the previous position of the shape.
  - @return number [] - An array [x,y] of the previous position.
- **getPrevX** - Returns the previous x position of the shape.
  - @return number - The previous x position.
- **getPrevY** - Returns the previous y position of the shape.
  - @return number - The previous x position.
- **getAABB** - Returns the AABB of the shape.
  - @return AABB object - The AABB of the shape.
- **getPreviousAABB** - Returns the previous AABB of the shape.
  - @return AABB object - The previous AABB of the shape.
- **getXOffset** - Returns the x offset of the shape.
  - @return number - The x offset.
- **getYOffset** - Returns the y offset of the shape.
  - @return number - The y offset.
- **destroy** - Destroys the shape so that it can be memory collected safely.
*/

platformer.classes.collisionShape = (function(){
	var collisionShape = function(owner, definition, collisionType){
		var regX = definition.regX,
		regY     = definition.regY;
		
		this.owner = owner;
		this.collisionType = collisionType;
		
		this.width  = definition.width  || definition.radius || 0;
		this.height = definition.height || definition.radius || 0;
		this.radius = definition.radius || 0;
		
		if(typeof regX !== 'number'){
			regX = this.width / 2;
		}
		if(typeof regY !== 'number'){
			regY = this.height / 2;
		}
		this.offsetX = definition.offsetX || ((this.width  / 2) - regX);
		this.offsetY = definition.offsetY || ((this.height / 2) - regY);
		
		if(owner){
			this.x = owner.x + this.offsetX;
			this.y = owner.y + this.offsetY;
		} else {
			this.x = definition.x + this.offsetX;
			this.y = definition.y + this.offsetY;
		}

		this.type = definition.type || 'rectangle';
		this.subType = '';
		this.points = definition.points; //Points should distributed so that the center of the AABB is at (0,0).
		this.aABB = undefined;
		
		var width = 0;
		var height = 0; 
		switch (this.type)
		{
		case 'circle': //need TL and BR points
			width = height = this.radius * 2;
			break;
		case 'rectangle': //need TL and BR points
			width = this.width;
			height = this.height;
			break;
		case 'triangle': //Need three points, start with the right angle corner and go clockwise.
			if (this.points[0][1] == this.points[1][1] && this.points[0][0] == this.points[2][0])
			{
				if (this.points[0][0] < this.points[1][0])
				{
					//TOP LEFT CORNER IS RIGHT
					this.subType = 'tl';
					width = this.points[1][0] - this.points[0][0];
					height = this.points[2][1] - this.points[0][1];
				} else {
					//BOTTOM RIGHT CORNER IS RIGHT
					this.subType = 'br';
					width = this.points[0][0] - this.points[1][0];
					height = this.points[0][1] - this.points[2][1];
				}
				
			} else if (this.points[0][1] == this.points[2][1] && this.points[0][0] == this.points[1][0]) {
				if (this.points[0][1] < this.points[1][1])
				{
					//TOP RIGHT CORNER IS RIGHT
					this.subType = 'tr';
					width = this.points[0][0] - this.points[2][0];
					height = this.points[1][1] - this.points[0][1];
				} else {
					//BOTTOM LEFT CORNER IS RIGHT
					this.subType = 'bl';
					width = this.points[2][0] - this.points[0][0];
					height = this.points[0][1] - this.points[1][1];
				}
			} 
		}
		
		this.aABB     = new platformer.classes.aABB(this.x, this.y, width, height);
	};
	var proto = collisionShape.prototype;
	
	proto.update = function(ownerX, ownerY){
		this.x = ownerX + this.offsetX;
		this.y = ownerY + this.offsetY;
		this.aABB.move(this.x, this.y);
	};
	
	proto.moveX = function(x){
		this.x = x;
		this.aABB.moveX(this.x);
	};
	
	proto.moveY = function(y){
		this.y = y;
		this.aABB.moveY(this.y);
	};
	
	proto.moveXBy = function(deltaX){
		this.x += deltaX;
		this.aABB.moveX(this.x);
	};
	
	proto.moveYBy = function(deltaY){
		this.y += deltaY;
		this.aABB.moveY(this.y);
	};
	
	proto.getXY = function () {
		return [this.x, this.y];
	};
	
	proto.getX = function () {
		return this.x;
	};
	
	proto.getY = function () {
		return this.y;
	};
	
	proto.getAABB = function(){
		return this.aABB;
	};

	proto.getXOffset = function(){
		return this.offsetX;
	};
	
	proto.getYOffset = function(){
		return this.offsetY;
	};
	
	proto.setXWithEntityX = function(entityX){
		this.x = entityX + this.offsetX;
		this.aABB.moveX(this.x);
	};
	
	proto.setYWithEntityY = function(entityY){
		this.y = entityY + this.offsetY;
		this.aABB.moveY(this.y);
	};
	
	proto.destroy = function(){
		this.aABB = undefined;
		this.points = undefined;
	};
	
	return collisionShape;
})();