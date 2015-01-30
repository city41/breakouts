/**
# CLASS aabb
This class defines an axis-aligned bounding box (AABB) which is used during the collision process to determine if two objects are colliding. This is used in a few places including [[Collision-Basic]] and [[Collision-Shape]].

## Fields
- **x** (number) - The x position of the AABB. The x is always located in the center of the object.
- **y** (number) - The y position of the AABB. The y is always located in the center of the object.
- **width** (number) - The width of the AABB.
- **height** (number) - The height of the AABB.
- **halfWidth** (number) - Half the width of the AABB.
- **halfHeight** (number) - Half the height of the AABB.
- **left** (number) - The x-position of the left edge of the AABB.
- **right** (number) - The x-position of the right edge of the AABB.
- **top** (number) - The y-position of the top edge of the AABB.
- **bottom** (number) - The y-position of the bottom edge of the AABB.


## Methods
- **constructor** - Creates an object from the aabb class.
  - @param x (number) - The x position of the AABB. The x is always located in the center of the object.
  - @param y (number) - The y position of the AABB. The y is always located in the center of the object.
  - @param width (number) - The width of the AABB.
  - @param height (number) - The height of the AABB.
  - @return aabb (object) - Returns the new aabb object.
- **setAll** - Sets all of the fields in the AABB.
  - @param x (number) - The x position of the AABB. The x is always located in the center of the object.
  - @param y (number) - The y position of the AABB. The y is always located in the center of the object.
  - @param width (number) - The width of the AABB.
  - @param height (number) - The height of the AABB.
- **reset** - Resets all the values in the AABB so that the AABB can be reused.
- **include** - Changes the size and position of the bounding box so that it contains the current area and the area described in the incoming AABB.
  - @param aabb (object) - The AABB who's area will be included in the area of the current AABB.
- **move** - Moves the AABB to the specified location.
  - @param x (number) - The new x position of the AABB.
  - @param y (number) - The new y position of the AABB.
- **getCopy** - Creates a new AABB with the same fields as this object.
  - @return aabb (object) - Returns the new AABB object.
*/

platformer.classes.aABB = (function(){
	var aABB = function(x, y, width, height){
		this.empty = true;
		this.setAll(x, y, width, height);
	};
	var proto = aABB.prototype;
	
	proto.setAll = function(x, y, width, height){
		this.empty = false;
		this.x = x;
		this.y = y;
		this.width  = width || 0;
		this.height = height || 0;
		this.halfWidth = this.width / 2;
		this.halfHeight = this.height / 2;
		if(typeof x === 'undefined'){
			this.empty = true;
		} else {
			this.left = -this.halfWidth + this.x;
			this.right = this.halfWidth + this.x;
		}
		if(typeof y === 'undefined'){
			this.empty = true;
		} else {
			this.top = -this.halfHeight + this.y;
			this.bottom = this.halfHeight + this.y;
		}
		return this;
	};
	
	proto.set = function(aabb){
		this.empty = aabb.empty;
		this.x = aabb.x;
		this.y = aabb.y;
		this.width  = aabb.width;
		this.height = aabb.height;
		this.halfWidth = aabb.halfWidth;
		this.halfHeight = aabb.halfHeight;
		this.left = aabb.left;
		this.right = aabb.right;
		this.top = aabb.top;
		this.bottom = aabb.bottom;
		return this;
	};
	
	proto.reset = function(){
		this.empty = true;
		return this;
	};
	
	proto.include = function(aabb){
		if(aabb){
			if(this.empty){
				this.set(aabb);
			} else {
				if(this.left > aabb.left){
					this.left = aabb.left;
				}
				if(this.right < aabb.right){
					this.right = aabb.right;
				}
				if(this.top > aabb.top){
					this.top = aabb.top;
				}
				if(this.bottom < aabb.bottom){
					this.bottom = aabb.bottom;
				}
				
				this.width      = this.right  - this.left;
				this.height     = this.bottom - this.top;
				this.halfWidth  = this.width / 2;
				this.halfHeight = this.height / 2;
				this.x          = this.left + this.halfWidth;
				this.y          = this.top  + this.halfHeight;
			}
		}
	};
	
	proto.move = function(x, y){
		this.moveX(x);
		this.moveY(y);
		return this;
	};

	proto.moveX = function(x){
		this.x = x;
		this.left   = -this.halfWidth + this.x;
		this.right  = this.halfWidth + this.x;
		return this;
	};

	proto.moveY = function(y){
		this.y = y;
		this.top    = -this.halfHeight + this.y;
		this.bottom = this.halfHeight + this.y;
		return this;
	};
	
	proto.moveXBy = function(deltaX){
		this.x += deltaX;
		this.left   = -this.halfWidth + this.x;
		this.right  = this.halfWidth + this.x;
		return this;
	};

	proto.moveYBy = function(deltaY){
		this.y += deltaY;
		this.top    = -this.halfHeight + this.y;
		this.bottom = this.halfHeight + this.y;
		return this;
	};

	proto.getCopy = function(){
		return new aABB(this.x, this.y, this.width, this.height);
	};

	proto.matches = function(x, y, width, height){
		return !((this.x !== x) || (this.y !== y) || (this.width !== width) || (this.height !== height));
	};

	proto.contains = function(aabb){
		return !((aabb.top < this.top) || (aabb.bottom > this.bottom) || (aabb.left < this.left) || (aabb.right > this.right));
	};
	
	proto.intersects = function(aabb){
		return !((aabb.bottom < this.top) || (aabb.top > this.bottom) || (aabb.right < this.left) || (aabb.left > this.right));
	};
	
	return aABB;
})();