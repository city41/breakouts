/**
# COMPONENT **logic-region-spawner**
This component spawns new entities within a given area at set intervals.

## Dependencies
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to determine whether to spawn another entity.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component determines whether to spawn another entity.
  - @param message.deltaT - To determine whether to spawn, the component keeps a running count of tick lengths.

## JSON Definition
    {
      "type": "logic-spawner",
      // List all additional parameters and their possible values here.
      
      "spawn": "teddy-bear",
      // Required. String identifying the type of entity to spawn.
      
      "interval": 30000,
      // Optional. Time in milliseconds between spawning an entity. Defaults to 1000.
      
      "regions": {
      // If spawning entity covers a large area, the spawned entities can be randomly spawned over a regional grid, so that the whole area gets a somewhat uniform coverage of spawned entities

        "width": 4000,
        "height": 5000,
        // Optional. Dimensions of a spawning region in world units. Defaults to entity's dimensions. The entity's dimensions are sliced into chunks of this size for spawn distribution.
      }
    }
*/
(function(){
	return platformer.createComponentClass({
		
		id: 'logic-region-spawner',
		
		constructor: function(definition){
			var x   = 0,
			y       = 0,
			columns = 1,
			rows    = 1,
			width   = 0,
			height  = 0,
			rw      = 0,
			rh      = 0;
			
			this.spawnPosition = {
				x: 0,
				y: 0
			};
			this.spawnProperties = {
				properties: this.spawnPosition
			};
			
			this.regions = null;
			this.usedRegions = null;
			this.regionWidth = 0;
			this.regionHeight = 0;
			if(definition.regions){
				this.regions = [];
				this.usedRegions = [];
				this.regionWidth  = width  = definition.regions.width  || this.owner.width;
				this.regionHeight = height = definition.regions.height || this.owner.height;
				columns = Math.round(this.owner.width  / width);
				rows    = Math.round(this.owner.height / height);
				for (x = 0; x < columns; x++){
					for (y = 0; y < rows; y++){
						rw = Math.min(width,  this.owner.width  - x * width);
						rh = Math.min(height, this.owner.height - y * height);
						this.regions.push({
							x: x * width,
							y: y * height,
							width: rw,
							height: rh
						});
					}
				}
			}
			
			this.entityClass = platformer.settings.entities[definition.spawn];
			
			this.interval = this.owner.interval || definition.interval || 1000;
			this.time = 0;
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(resp){
				var regions = this.regions,
				region = null;
				
				this.time += resp.deltaT;
				
				if (this.time > this.interval){
					this.time -= this.interval;
					
					if(regions){
						if(!regions.length){
							this.regions = this.usedRegions;
							this.usedRegions = regions;
							regions = this.regions;
						}
						
						region = regions[Math.floor(regions.length * Math.random())];
						
						this.spawnPosition.x = this.owner.x - (this.owner.regX || 0) + (region.x + (Math.random() * region.width));
						this.spawnPosition.y = this.owner.y - (this.owner.regY || 0) + (region.y + (Math.random() * region.height));
					} else {
						this.spawnPosition.x = this.owner.x - (this.owner.regX || 0) + (Math.random() * this.owner.width);
						this.spawnPosition.y = this.owner.y - (this.owner.regY || 0) + (Math.random() * this.owner.height);
					}

					this.owner.parent.addEntity(new platformer.classes.entity(this.entityClass, this.spawnProperties));
				}
			}
		}
	});
})();
