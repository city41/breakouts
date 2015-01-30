/**
# COMPONENT **collision-group**
This component groups other entities with this entity for collision checking. This is useful for carrying and moving platforms. It uses `entity-container` component messages if triggered to add to its collision list and also listens for explicit add/remove messages (useful in the absence of an `entity-container` component).

## Dependencies:
- [[handler-collision]] (on entity's parent) - The collision handler uses the methods this component exposes to perform collision for this entity as a group before performing collision on each entity in the group.

## Messages

### Listens for:
- **child-entity-added, add-collision-entity** - On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
  - @param message ([[Entity]] object) - The entity to be added.
- **child-entity-removed, remove-collision-entity** - On receiving this message, the component looks for the entity in its collision group and removes it.
  - @param message ([[Entity]] object) - The entity to be removed.
- **relocate-entity** - When this message is triggered, the collision group updates its record of the owner's last (x, y) coordinate.

## JSON Definition:
    {
      "type": "collision-group"
      // This component has no customizable properties.
    }
*/
(function(){
	//set here to make them reusable objects
	var appendUniqueItems = function(hostArray, insertArray){
		var i  = 0,
		j      = 0,
		length = hostArray.length,
		found  = false;
		
		for(; i < insertArray.length; i++){
			found = false;
			for(j = 0; j < length; j++){
				if(insertArray[i] === hostArray[j]){
					found = true;
					break;
				}
			}
			if(!found){
				hostArray.push(insertArray[i]);
			}
		}
		
		return hostArray;
	};
	
	return platformer.createComponentClass({
		id: 'collision-group',
		
		constructor: function(definition){
			var self = this;
			
			this.solidEntities = [];
			
			this.terrain = undefined;
			this.aabb     = new platformer.classes.aABB(this.owner.x, this.owner.y);
			this.prevAABB = new platformer.classes.aABB(this.owner.x, this.owner.y);
			this.owner.previousX = this.owner.previousX || this.owner.x;
			this.owner.previousY = this.owner.previousY || this.owner.y;
			
			this.collisionGroup = this.owner.collisionGroup = {
				getAllEntities: function(){
					var count = 0,
					childEntity = null;
					
					for (var x = 0; x < self.solidEntities.length; x++){
						childEntity = self.solidEntities[x];
						if((childEntity !== self.owner) && childEntity.collisionGroup){
							count += childEntity.collisionGroup.getAllEntities();
						} else {
							count += 1;
						}
					}

					return count;
				},
				getSize: function(){
					return self.solidEntities.length;
				},
				getCollisionTypes: function(){
					return self.getCollisionTypes();
				},
				getSolidCollisions: function(){
					return self.getSolidCollisions();
				},
				getAABB: function(collisionType){
					return self.getAABB(collisionType);
				},
				getPreviousAABB: function(collisionType){
					return self.getPreviousAABB(collisionType);
				},
				getShapes: function(collisionType){
					return self.getShapes(collisionType);
				},
				getPrevShapes: function(collisionType){
					return self.getPrevShapes(collisionType);
				},
				prepareCollision: function(x, y){
					return self.prepareCollision(x, y);
				},
				relocateEntity: function(x, y, collisionData){
					return self.relocateEntity(x, y, collisionData);
				},
				movePreviousX: function(x){
					return self.movePreviousX(x);
				},
				getSolidEntities: function(){
					return self.solidEntities;
				},
				jumpThrough: false //TODO: this introduces odd behavior - not sure how to resolve yet. - DDD
			};
		},
		
		events:{
			"child-entity-added": function(entity){
				this['add-collision-entity'](entity);
			},
			
			"add-collision-entity": function(entity){
				var i = 0,
				types = entity.collisionTypes;
				
				if(types){
					for(; i < types.length; i++){
						if(entity.solidCollisions[types[i]].length && !entity.immobile){
							this.solidEntities[this.solidEntities.length] = entity;
						}
					}
					this.updateAABB();
				}
			},
			
			"child-entity-removed": function(entity){
				this['remove-collision-entity'](entity);
			},
			
			"remove-collision-entity": function(entity){
				var x = 0,
				i     = 0,
				types = entity.collisionTypes;

				if (types) {
					for(; i < types.length; i++){
						if(entity.solidCollisions[types[i]].length){
							for (x in this.solidEntities) {
								if(this.solidEntities[x] === entity){
									this.solidEntities.splice(x, 1);
									break;
								}
							}
						}
					}
					this.updateAABB();
				}
				
			},
			
			"relocate-entity": function(resp){
				this.owner.previousX = this.owner.x;
				this.owner.previousY = this.owner.y;
				this.updateAABB();
			}
		},
		
		methods: {
			getCollisionTypes: function(){
				var childEntity = null,
				compiledList = [];
				
				for (var x = 0; x < this.solidEntities.length; x++){
					childEntity = this.solidEntities[x];
					if((childEntity !== this.owner) && childEntity.collisionGroup){
						childEntity = childEntity.collisionGroup;
					}
					compiledList = appendUniqueItems(compiledList, childEntity.getCollisionTypes());
				}
				
				return compiledList;
			},

			getSolidCollisions: function(){
				var childEntity = null,
				compiledList = {},
				entityList = null;
				
				for (var x = 0; x < this.solidEntities.length; x++){
					childEntity = this.solidEntities[x];
					if((childEntity !== this.owner) && childEntity.collisionGroup){
						childEntity = childEntity.collisionGroup;
					}
					entityList = childEntity.getSolidCollisions();
					for (var z in entityList){
						compiledList[z] = appendUniqueItems(compiledList[z] || [], entityList[z]);
					}
				}
				
				return compiledList;
			},
			
			getAABB: function(collisionType){
				var childEntity = null;
				
				if(!collisionType){
					return this.aabb;
				} else {
					var aabb = new platformer.classes.aABB();
					for (var x = 0; x < this.solidEntities.length; x++){
						childEntity = this.solidEntities[x];
						if((childEntity !== this.owner) && childEntity.collisionGroup){
							childEntity = childEntity.collisionGroup;
						}
						
						aabb.include(childEntity.getAABB(collisionType));
					}
					return aabb;
				}
			},

			getPreviousAABB: function(collisionType){
				var childEntity = null;
				
				if(!collisionType){
					return this.prevAABB;
				} else {
					var aabb = new platformer.classes.aABB();
					for (var x = 0; x < this.solidEntities.length; x++){
						childEntity = this.solidEntities[x];
						if((childEntity !== this.owner) && childEntity.collisionGroup){
							childEntity = childEntity.collisionGroup;
						}

						aabb.include(childEntity.getPreviousAABB(collisionType));
					}
					return aabb;
				}
			},
			
			updateAABB: function(){
				this.aabb.reset();
				for (var x = 0; x < this.solidEntities.length; x++){
					this.aabb.include(((this.solidEntities[x] !== this.owner) && this.solidEntities[x].getCollisionGroupAABB)?this.solidEntities[x].getCollisionGroupAABB():this.solidEntities[x].getAABB());
				}
			},
			
			getShapes: function(collisionType){
				var childEntity = null,
				shapes = [],
				newShapes = null;
				
				for (var x = 0; x < this.solidEntities.length; x++){
					childEntity = this.solidEntities[x];
					if((childEntity !== this.owner) && childEntity.collisionGroup){
						childEntity = childEntity.collisionGroup;
					}
					newShapes = childEntity.getShapes(collisionType);
					if(newShapes){
						shapes = shapes.concat(newShapes);
					}
				}
				return shapes;
			},

			getPrevShapes: function(collisionType){
				var childEntity = null,
				shapes = [];
				
				for (var x = 0; x < this.solidEntities.length; x++){
					childEntity = this.solidEntities[x];
					if((childEntity !== this.owner) && childEntity.collisionGroup){
						childEntity = childEntity.collisionGroup;
					}
					newShapes = childEntity.getPrevShapes(collisionType);
					if(newShapes){
						shapes = shapes.concat(newShapes);
					}
				}
				return shapes;
			},
			
			prepareCollision: function(x, y){
				var childEntity = null,
				oX = 0,
				oY = 0;
				
				for (var i = 0; i < this.solidEntities.length; i++){
					childEntity = this.solidEntities[i];
					childEntity.saveDX = childEntity.x - childEntity.previousX;
					childEntity.saveDY = childEntity.y - childEntity.previousY;
					oX = childEntity.saveOX = this.owner.previousX - childEntity.previousX;
					oY = childEntity.saveOY = this.owner.previousY - childEntity.previousY;
					if((childEntity !== this.owner) && childEntity.collisionGroup){
						childEntity = childEntity.collisionGroup;
					}
					childEntity.prepareCollision(x - oX, y - oY);
				}
			},
			
			movePreviousX: function(x){
				var childEntity = null,
				offset = 0,
				i = 0;
				
				for (; i < this.solidEntities.length; i++){
					childEntity = this.solidEntities[i];
					offset = childEntity.saveOX;
					if((childEntity !== this.owner) && childEntity.collisionGroup){
						childEntity = childEntity.collisionGroup;
					}
					childEntity.movePreviousX(x - offset);
				}
			},
			
			relocateEntity: function(x, y, collisionData){
				var childEntity = null,
				entity = null,
				i = 0;
				
				this.owner.saveDX -= x - this.owner.previousX;
				this.owner.saveDY -= y - this.owner.previousY;

				for(i = 0; i < collisionData.xCount; i++){
					if(collisionData.getXEntry(i).thisShape.owner === this.owner){
						this.owner.saveDX = 0;
						break;
					}
				}
				
				for(i = 0; i < collisionData.yCount; i++){
					if(collisionData.getYEntry(i).thisShape.owner === this.owner){
						this.owner.saveDY = 0;
						break;
					}
				}
				
				for (var i = 0; i < this.solidEntities.length; i++){
					childEntity = entity = this.solidEntities[i];
					if((childEntity !== this.owner) && childEntity.collisionGroup){
						childEntity = childEntity.collisionGroup;
					}
					childEntity.relocateEntity(x - entity.saveOX, y - entity.saveOY, collisionData);
					entity.x += entity.saveDX;
					entity.y += entity.saveDY;
					if(entity !== this.owner){
						entity.x += this.owner.saveDX;
						entity.y += this.owner.saveDY;
					}
				}
			},

			destroy: function(){
				this.solidEntities.length = 0;
			}
		},
		
		publicMethods: {
			getCollisionGroupAABB: function(){
				return this.getAABB();
			},
			
			getWorldEntities: function(){
				return this.owner.parent.getWorldEntities();
			},
			
			getWorldTerrain: function(){
				return this.owner.parent.getWorldTerrain();
			}
		}
	});
})();