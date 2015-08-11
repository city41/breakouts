/**
# COMPONENT **handler-logic**
A component that handles updating logic components. Each tick it calls all the entities that accept 'handle-logic' messages.

## Dependencies
- **Needs a 'tick' or 'logic' call** - This component doesn't need a specific component, but it does require a 'tick' or 'logic' call to function. It's usually used as a component of an action-layer.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-logic' message id it's added to the list of entities. 
  - @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick** - Sends a 'handle-logic' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
  - @param resp (object) - An object containing deltaT which is the time passed since the last tick. 
- **pause-logic** - `handle-logic` messages cease to be triggered on each tick
  - @param resp.time (number) - If set, this will pause the logic for this number of milliseconds. If not set, logic is paused until an `unpause-logic` message is triggered. 
- **unpause-logic** - `handle-logic` messages begin firing each tick.
- **camera-update** - Changes the active logic area when the camera location changes.
  - @param resp.viewportLeft (number) - The left side of the camera viewport in world units. 
  - @param resp.viewportTop (number) - The top side of the camera viewport in world units. 
  - @param resp.viewportWidth (number) - The width of the camera viewport in world units. 
  - @param resp.viewportHeight (number) - The height of the camera viewport in world units. 

### Child Broadcasts:
- **handle-logic** - Sent to entities to run their logic.
  - @param object - An object containing a deltaT variable that is the time that's passed since the last tick.

## JSON Definition
    {
      "type": "handler-logic",
      
      "buffer" : 12,		//The buffer area around the camera in which entity logic is active. This value changes the buffer in all directions. Defaults to the camera width / 10.
      "bufferWidth" : 12, 	//The buffer area around the camera in which entity logic is active. This value changes the buffer in width only and overrides the buffer value. Defaults to the camera width / 10.
      "bufferHeight" : 12, 	//The buffer area around the camera in which entity logic is active. This value changes the buffer in height only and overrides the buffer value. Defaults to the camera width / 10.
      "bufferLeft" : 12,	//The buffer area around the camera in which entity logic is active. This value changes the buffer at the left of the camera and overrides buffer and bufferWidth. Defaults to the camera width / 10.
      "bufferRight" : 12,	//The buffer area around the camera in which entity logic is active. This value changes the buffer at the right of the camera and overrides buffer and bufferWidth. Defaults to the camera width / 10.
      "bufferTop" : 12,		//The buffer area around the camera in which entity logic is active. This value changes the buffer at the top of the camera and overrides buffer and bufferHeight. Defaults to the camera width / 10.
      "bufferBottom" : 12	//The buffer area around the camera in which entity logic is active. This value changes the buffer at the bottom of the camera and overrides buffer and bufferHeight. Defaults to the camera width / 10.
    }
*/

(function(){
	var updateState = function(entity){
		var state = null,
		changed   = false;
		
		for (state in entity.state){
			if (entity.state[state] !== entity.lastState[state]){
				entity.lastState[state] = entity.state[state];
				changed = true;
			}
		}
		
		return changed;
	};

	return platformer.createComponentClass({
		id: "handler-logic",
	
		constructor: function(definition){
			this.entities = [];
			this.activeEntities = this.entities;
			
			this.paused = 0;
			this.stepLength    = definition.stepLength || 30;//15;
			this.leftoverTime = 0;
			this.maximumStepsPerTick = 10; //Math.ceil(500 / this.stepLength);
			this.camera = {
				left: 0,
				top: 0,
				width: 0,
				height: 0,
				bufferLeft: 	definition.bufferLeft 	|| definition.bufferWidth || definition.buffer || -1,
				bufferRight: 	definition.bufferRight 	|| definition.bufferWidth || definition.buffer || -1,
				bufferTop: 		definition.bufferTop 	|| definition.bufferHeight || definition.buffer || -1,
				bufferBottom: 	definition.bufferBottom || definition.bufferHeight || definition.buffer || -1,
				active: false
			};
			this.message = {
				deltaT: this.stepLength,
				tick: null,
				camera: this.camera,
				movers: this.activeEntities
			};
			this.timeElapsed = {
				name: 'Logic',
				time: 0
			};
		},
		
		events:{
			"child-entity-added": function(entity){
				var messageIds = entity.getMessageIds(); 
				
				for (var x = 0; x < messageIds.length; x++)
				{
					if (messageIds[x] == 'handle-logic'){
						this.entities.push(entity);
						this.updateNeeded = this.camera.active;
						break;
					}
				}
			},

			"pause-logic": function(resp){
				if(resp && resp.time){
					this.paused = resp.time;
				} else {
					this.paused = -1;
				}
//				console.log('paused-logic');
			},
			"unpause-logic": function(){
				this.paused = 0;
			},

			"camera-update": function(camera){
				this.camera.left = camera.viewportLeft;
				this.camera.top = camera.viewportTop;
				this.camera.width = camera.viewportWidth;
				this.camera.height = camera.viewportHeight;
				
				if(this.camera.bufferLeft == -1) {
					this.camera.bufferLeft = this.camera.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				if(this.camera.bufferRight == -1) {
					this.camera.bufferRight = this.camera.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				if(this.camera.bufferTop == -1) {
					this.camera.bufferTop = this.camera.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				if(this.camera.bufferBottom == -1) {
					this.camera.bufferBottom = this.camera.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				
				this.camera.active = true;
				
				this.updateNeeded = true;
			},

			"tick": function(resp){
				var cycles = 0,
				child   = undefined,
				time    = new Date().getTime();
				
				this.leftoverTime += resp.deltaT;
				cycles = Math.floor(this.leftoverTime / this.stepLength) || 1;
		
				// This makes the frames smoother, but adds variance into the calculations
		//		this.message.deltaT = this.leftoverTime / cycles;
		//		this.leftoverTime = 0;
				
				// This makes the frames more exact, but varying step numbers between ticks can cause movement to be jerky
				this.message.deltaT = Math.min(this.leftoverTime, this.stepLength);
				this.leftoverTime = Math.max(this.leftoverTime - (cycles * this.stepLength), 0);
		
				if(this.paused > 0){
					this.paused -= resp.deltaT;
					if(this.paused < 0){
						this.paused = 0;
					}
				}
				
				if(!this.paused) {
					if(!this.message.tick){
						this.message.tick = resp;
					}
					
					//if(this.updateNeeded){//causes blocks to fall through dirt - not sure the connection here, so leaving out this optimization for now. - DDD
						if(this.activeEntities === this.entities){
							this.message.movers = this.activeEntities = [];
						}
						
						this.activeEntities.length = 0;
						for (var j = this.entities.length - 1; j > -1; j--) {
							child = this.entities[j];
							if(child.alwaysOn || (typeof child.x === 'undefined') || ((child.x >= this.camera.left - this.camera.bufferLeft) && (child.x <= this.camera.left + this.camera.width + this.camera.bufferRight) && (child.y >= this.camera.top - this.camera.bufferTop) && (child.y <= this.camera.top + this.camera.height + this.camera.bufferBottom))){
								this.activeEntities.push(child);
							}
						}
					//}
					
					//Prevents game lockdown when processing takes longer than time alotted.
					cycles = Math.min(cycles, this.maximumStepsPerTick);
					
					for(var i = 0; i < cycles; i++){
						for (var j = this.activeEntities.length - 1; j > -1; j--) {
							child = this.activeEntities[j];
							if(child.triggerEvent('handle-logic', this.message)){
								if(updateState(child)){
									child.trigger('logical-state', child.state);
								}
								child.checkCollision = true;
							} else {
								for (var k = this.entities.length - 1; k > -1; k--) {
								    if(this.entities[k] === this.activeEntities[j]){
								    	this.entities.splice(k, 1);
								    	this.updateNeeded = this.camera.active;
								    	break;
								    }
								}
							}
						}
						
						this.timeElapsed.name = 'Logic';
						this.timeElapsed.time = new Date().getTime() - time;
						platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
						time += this.timeElapsed.time;
						
						this.owner.trigger('check-collision-group', this.message); // If a collision group is attached, make sure collision is processed on each logic tick.

						this.timeElapsed.name = 'Collision';
						this.timeElapsed.time = new Date().getTime() - time;
						platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
						time += this.timeElapsed.time;
					}
				}
				
				this.timeElapsed.time = new Date().getTime() - time;
				platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			}
		}
	});
})();