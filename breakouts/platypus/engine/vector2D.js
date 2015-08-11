/**
# CLASS vector2D
This class defines a two-dimensional vector object and a variety of methods for manipulating the vector.

## Properties
- **x** - The x component of the vector.
- **y** - The y component of the vector.

## Methods
- **constructor** - Creates an object from the vector2D class.
  - @param x (number) - The x component of the vector.
  - @param y (number) - The y component of the vector.
- **set** - Sets the x and y component of the vector.
  - @param x (number) - The x component.
  - @param y (number) - The y component.
- **copyValues** - Sets the x and y component of the vector to values of the parameter vector.
  - @param x (number) - The x component.
  - @param y (number) - The y component.
  - @return vector2D - This.
- **setX** - Sets the x component of the vector.
  - @param x (number) - The x component.
  - @return vector2D - This.
- **setY** - Sets the y component of the vector.
  - @param y (number) - The y component.
  - @return vector2D - This.
- **magnitude** - Returns the magnitude of the vector.
  - @return number - The magnitude of the vector.
- **direction** - Returns the direction of the vector.
  - @return number - The direction of the vector.
- **getUnit** - Returns a normalized copy of the vector.
  - @return vector2D - A normalized vector in the same direction as this vector.
- **normalize** - Normalizes the vector.
  - @return vector2D - This.
- **rotate** - Rotates the vector by the given amount.
  - @param angle (number) - The amount to rotate the vector in radians.
  - @return vector2D - This.
- **add** - Adds the given components to this vector.
  - @param x (number) - The x component to add.
  - @param y (number) - The y component to add.
  - @return vector2D - This.
- **addVector** - Adds the given vector to this vector.
  - @param otherVector (vector2D) - The vector to add.
  - @return vector2D - This.
- **subtractVector** - Subtracts the given vector from this vector.
  - @param otherVector (vector2D) - The vector to subtract.  
  - @return vector2D - This.
- **scaleVector** - Scales the vector by the given factor.
  - @param factor (number) - The factor to scale by. 
  - @return vector2D - This.
- **dot** - Finds the dot product of the two vectors.
  - @param otherVector (vector2D) - The other vector. 
  - @return number - The dot product.
- **shortestAngleTo** - Finds the shortest angle between the two vectors .
  - @param otherVector (vector2D) - The other vector. 
  > return number - The angle between this vector and the received vector.     
- **scalarProjection** - Find the scalar value of projecting this vector onto the parameter vector or onto a vector at the specified angle away.
  - @param vectorOrAngle (vector2D or number) - The other vector or the angle between the vectors. 
  > return number - The magnitude of the projection. 
- **copy** - Returns a copy of this vector.
  - @return vector2D - A copy of this vector.
*/

platformer.classes.vector2D = (function(){
	var vector2D = function(x, y){
		this.x = x || 0;
		this.y = y || 0;
	};
	var proto = vector2D.prototype;
	
	proto.set = function(x, y){
		this.x = x;
		this.y = y;
		return this;
	};
	
	proto.copyValues = function(otherVector){
		this.x = otherVector.x;
		this.y = otherVector.y;
		return this;
	};
	
	proto.setX = function(x){
		this.x = x;
		return this;
	};
	
	proto.setY = function(y){
		this.y = y;
		return this;
	};
	
	proto.getX = function(){
		return this.x;
	};
	
	proto.getY = function(){
		return this.y;
	};
	
	proto.magnitude = function(){
		return Math.sqrt( Math.pow(this.x, 2) + Math.pow(this.y, 2));
	};
	
	proto.direction = function(){
		var mag = this.magnitude();
        var angle = 0;

        if (mag != 0){
                angle = Math.acos(this.x / mag);
                if (this.y < 0){
                        angle = (Math.PI * 2) - angle;
                }
        }
        return angle; 
	};
	
	proto.getUnit = function(){
		var mag = this.magnitude();
		if (mag == 0) {
			return new platformer.classes.vector2D(0, 0);
		} else {
			return new platformer.classes.vector2D(this.x / mag, this.y / mag);
		}
	};
	
	proto.getInverse = function(){
		return new platformer.classes.vector2D(-this.x, -this.y);
	};
	
	proto.normalize = function(){
		var mag = this.magnitude();
		if (mag != 0)
		{
			this.x /= mag;
			this.y /= mag;
		}
		return this;
	};
	
	proto.rotate = function(angle){
		var x = this.x;
		var y = this.y;
		this.x = x * Math.cos(angle) - y * Math.sin(angle);
		this.y = x * Math.sin(angle) + y * Math.cos(angle);
		return this;
	};
	
	proto.add = function (x, y){
		this.x += x;
		this.y += y;
		return this;
	};
	
	proto.addVector = function(otherVector){
		this.x += otherVector.x;
		this.y += otherVector.y;
		return this;
	};
	
	proto.subtractVector = function(otherVector){
		this.x -= otherVector.x;
		this.y -= otherVector.y;
		return this;
	};
	
	proto.scale = function(factor) {
		this.x *= factor;
		this.y *= factor;
		return this;
	};
	
	proto.dot = function(otherVector) {
		return this.x * otherVector.x + this.y * otherVector.y;
	};
	
	proto.shortestAngleTo = function(otherVector) {
		return Math.acos(this.dot(otherVector) / (this.magnitude() * otherVector.magnitude()));
	};
	
	proto.scalarProjection = function(vectorOrAngle) {
		var angle = 0;
		var vector = null;
		if (typeof vectorOrAngle == "number")
		{
			angle = vectorOrAngle;
		} else {
			vector = vectorOrAngle;
			angle = this.shortestAngleTo(vector);
		}
		return this.magnitude() * Math.cos(angle);
	};
	
	proto.copy = function() {
		return new vector2D(this.x, this.y);
	};
	
	return vector2D;
})();