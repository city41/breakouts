/**
//TODO: This should probably be merged with `logic-shield` since it performs a subset of the `logic-shield` behaviors. - DDD
*/
(function(){
	return platformer.createComponentClass({
		id: 'logic-attached-entity',
		constructor: function(definition){
			this.entityType = this.owner.entityType || definition.entityType;
			this.entityProperties = this.owner.entityProperties || definition.entityProperties || {x: 0, y: 0, z: 0};
			this.offsetX = this.owner.offsetX || definition.offsetX || 0;
			this.offsetY = this.owner.offsetY || definition.offsetY || 0;
			var randomizedXRange = this.owner.randomizedXRange || definition.randomizedXRange || 0;
			var randomizedYRange = this.owner.randomizedYRange || definition.randomizedYRange || 0;
			
			this.offsetX += Math.floor(Math.random() * (randomizedXRange + 1));
			this.offsetY += Math.floor(Math.random() * (randomizedYRange + 1));
			
			this.attachedEntity = null;
		},

		events: {// These are messages that this component listens for
			"adopted": function(resp){
				this.entityProperties.x = this.owner.x + this.offsetX;
				this.entityProperties.y = this.owner.y + this.offsetY;
				this.entityProperties.z = this.owner.z + 1;
				this.entityProperties.orientation = this.owner.orientation;
				this.attachedEntity = this.owner.parent.addEntity(new platformer.classes.entity(platformer.settings.entities[this.entityType], {properties:this.entityProperties}));
			},
			"handle-logic": function(resp){
				if (this.attachedEntity && !this.attachedEntity.components.length) {
					this.attachedEntity = null;
				} else if (this.attachedEntity) {
					this.attachedEntity.x = this.owner.x + this.offsetX;
					this.attachedEntity.y = this.owner.y + this.offsetY;
					this.attachedEntity.orientation = this.owner.orientation;
				}
			}
		},
		
		methods: {// These are methods that are called by this component.
			destroy: function(){
				this.entityProperties = null;
				if (this.attachedEntity && this.attachedEntity.parent) {
					this.attachedEntity.parent.removeEntity(this.attachedEntity);
				}
				this.attachedEntity = null;
			}
			
		},
		
		publicMethods: {// These are methods that are available on the entity.
			
		}
	});
})();
