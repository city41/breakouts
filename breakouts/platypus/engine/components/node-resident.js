/**
# COMPONENT **node-resident**
This component connects an entity to its parent's [[node-map]]. It manages navigating the node-map and triggering events on the entity related to its position.

## Dependencies
- [[node-map]] (on entity's parent) - This component uses the `node-map` to determine its location and navigate to other nodes.
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location and triggers messages regarding its neighbors.
  - @param message.deltaT (Number) - This component uses the current time to determine its progress along an edge if moving from node to node on the map.
- **on-node** - Sets the entity's position to the sent node, updates its coordinates, and triggers messages regarding its neighbors if any.
  - @param node (Node) - The node that this entity should be located on.
- **leave-node** - Removes the entity from its current node if it's on one.
- **goto-node** - Begins moving the entity along edges to get to sent node.
  - @param node (Node) - The node that this entity should move to.
- **follow** - Causes this entity to follow another entity. The leading entity must also have a `node-resident` component and exist in the node-map.
  - @param entity (Entity) - The entity that this entity should follow.

### Local Broadcasts:
- **next-to-[entity-type]** - This message is triggered when the entity is placed on a node. It will trigger on all neighboring entities, as well as on itself on behalf of neighboring entities.
  - @param entity (Entity) - The entity that is next to the listening entity.
- **with-[entity-type]** - This message is triggered when the entity is placed on a node. It will trigger on all entities residing on the same node, as well as on itself on behalf of all resident entities.
  - @param entity (Entity) - The entity that is with the listening entity.
- **left-node** - Triggered when the entity leaves a node.
  - @param node (Node) - The node that the entity just left.
- **[Messages specified in definition]** - When the entity is placed on a node, it checks out the type of node and triggers a message on the entity if an event is listed for the current node type.

## States
- **on-node** - This state is true when the entity is on a node.
- **moving** - This state is true when the entity is moving from one node to another.
- **going-[direction]** - This state is true when the entity is moving (or has just moved) in a direction (determined by the node-map) from one node to another.
  
## JSON Definition
    {
      "type": "node-resident",
      
      "nodeId": "city-hall",
      // Optional. The id of the node that this entity should start on. Uses the entity's nodeId property if not set here.
      
      "nodes": ['path','sidewalk','road'],
      // Optional. This is a list of node types that this entity can reside on. If not set, entity can reside on any type of node.
      
      "shares": ['friends','neighbors','city-council-members'],
      // Optional. This is a list of entities that this entity can reside with on the same node. If not set, this entity cannot reside with any entities on the same node.
      
      "speed": 5,
      // Optional. Sets the speed with which the entity moves along an edge to an adjacent node. Default is 0 (instantaneous movement).
      
      "updateOrientation": true
      // Optional. Determines whether the entity's orientation is updated by movement across the node-map. Default is false.
    }
*/
(function(){
	var createGateway = function(node, map, gateway){
		return function(resp){
			this.gotoNode(map.getNode(node), gateway); // ensure it's a node if one is available at this gateway
		};
	},
	distance = function(origin, destination){
		var x = destination.x - origin.x,
		y = destination.y - origin.y,
		z = destination.z - origin.z;
		
		return Math.sqrt(x*x + y*y + z*z);
	},
	angle = function(origin, destination, distance){
		var x = destination.x - origin.x,
		y     = destination.y - origin.y,
		a     = 0;
		
		if(!distance){
			return a;
		}

		a = Math.acos(x/distance);
		if (y < 0){
			a = (Math.PI * 2) - a;
		}
		return a;
	},
	axisProgress = function(r, o, d){
		return o * (1 - r) + d * r;
	},
	isFriendly = function(entities, kinds){
		var x = 0,
		y     = 0,
		found = false;
		
		if(!kinds){
			return false;
		}
		
		for(; x < entities.length; x++){
			for(y = 0; y < kinds.length; y++){
				if(entities[x].type === kinds[y]){
					found = true;
				}
			}
			if(!found){
				return false;
			} else {
				found = false;
			}
		}
		
		return true;
	};
	
	return platformer.createComponentClass({
		
		id: 'node-resident',
		
		constructor: function(definition){
			this.nodeId = definition.nodeId || this.owner.nodeId;
			
			this.friendlyNodes = definition.nodes || null;
			this.friendlyEntities = definition.shares || null;
			this.speed = definition.speed || 0;
			this.updateOrientation = definition.updateOrientation || false;
			this.distance = 0;
			this.progress = 0;
			
			this.state = this.owner.state;
			this.currentState = '';
		},
		
		events: {
			"handle-logic": function(resp){
				var ratio = 0,
				node = null;
				
				if(this.destinationNode){
					this.state.moving = true;
					
					//console.log('--- destination --- ' + this.destinationNode.id + ' ---');
					if(this.node){
						//console.log('Leaving ' + this.node.id);
						this['leave-node']();
					}
					if(!this.speed || !this.lastNode){
						//console.log('On Node ' + this.destinationNode.id);
						this['on-node'](this.destinationNode);
						this.destinationNode = null;
					} else {
						this.progress += resp.deltaT * this.speed;
						ratio = this.progress / this.distance;
						
						if(ratio > 1){
							//console.log('On Node ' + this.destinationNode.id + ' ratio: ' + this.progress + ' / ' + this.distance);
							this['on-node'](this.destinationNode);
							this.destinationNode = null;
						} else {
							//console.log('Onward ' + this.lastNode.id + ' to ' + this.destinationNode.id);
							this.owner.x = axisProgress(ratio, this.lastNode.x, this.destinationNode.x);
							this.owner.y = axisProgress(ratio, this.lastNode.y, this.destinationNode.y);
							this.owner.z = axisProgress(ratio, this.lastNode.z, this.destinationNode.z);
						}
					}
				} else {
					if(this.followEntity){
						node = this.followEntity.node || this.followEntity;
						console.log('Following (' + (node && node.isNode && (node !== this.node)) + ')', node);
						if(node && node.isNode && (node !== this.node)){
							this.state.moving = this['goto-node'](node);
						} else {
						    this.followEntity = null;
						}
					} else {
						this.state.moving = false;
					}
				}
			},
			"on-node": function(node){
				var i = '',
				j     = 0,
				entities = null;
				
				this.owner.node = this.node = node; //TODO: not sure if this needs to be accessible outside this component.
				this.node.add(this.owner);
				
				this.setState('on-node');
				
				this.owner.x = this.node.x;
				this.owner.y = this.node.y;
				this.owner.z = this.node.z;
				
				//add listeners for directions
				for (i in node.neighbors){
					this.addListener(i);
					this[i] = createGateway(node.neighbors[i], node.map, i);
					
					//trigger "next-to" events
					entities = node.map.getNode(node.neighbors[i]).contains;
					for (j = 0; j < entities.length; j++){
						entities[j].triggerEvent("next-to-" + this.owner.type, this.owner);
						this.owner.triggerEvent("next-to-" + entities[j].type, entities[j]);
					}
				}
				
				//trigger mapped messages for node types
				if(this.friendlyNodes && this.friendlyNodes[node.type]){
					this.owner.trigger(this.friendlyNodes[node.type]);
				}

				//trigger "with" events
				entities = node.contains;
				for (j = 0; j < entities.length; j++){
					if(this.owner !== entities[j]){
						entities[j].triggerEvent("with-" + this.owner.type, this.owner);
						this.owner.triggerEvent("with-" + entities[j].type, entities[j]);
					}
				}
			},
			"leave-node": function(){
				if(this.node){
					this.node.remove(this.owner);
					this.owner.triggerEvent('left-node', this.node);
					for (var i in this.node.neighbors){
						this.removeListener(i, this.listeners[i]);
						delete this[i];
					}
				}
				this.lastNode = this.node;
				this.node = null;
			},
			"goto-node": function(node){
				var i = '',
				j     = 0,
				k     = 0,
				directions = {},
				foundDirection = false,
				all = [],
				arr = null,
				tempArray = null,
				map = null,
				count = 0,
				depth = 20; //TODO: arbitrary limit
				
				if(this.node && node){
					this.followEntity = node;
					map = this.node.map || node.map;
					for(i in this.node.neighbors){
						directions[i] = this.traverseNode(map.getNode(this.node.neighbors[i]), node);
						if(!directions[i]){
							foundDirection = true;
							for(k = 0; k < all.length; k++){
								map.getNode(all[k]).checked = false;
							}
							return this.gotoNode(map.getNode(this.node.neighbors[i]), i);
						} else {
							all = all.concat(directions[i]);
						}
					}
					while(!foundDirection && (count <= depth)){
						count += 1;
						//console.log(count + ': ' + JSON.stringify(directions));
						for(i in directions){
							tempArray = [];
							for (j = 0; j < directions[i].length; j++){
								arr = this.traverseNode(map.getNode(directions[i][j]), node);
								if(arr){
									tempArray = tempArray.concat(arr);
									all = all.concat(arr);
								} else {
									foundDirection = true;
									for(k = 0; k < all.length; k++){
										map.getNode(all[k]).checked = false;
									}
									return this.gotoNode(map.getNode(this.node.neighbors[i]), i);
								}
							}
							directions[i] = tempArray;
						}
					}
					for(k = 0; k < all.length; k++){
						map.getNode(all[k]).checked = false;
					}
				}
				
				return false;
			},
			"follow": function(entityOrNode){
				this.followEntity = entityOrNode;
			}
		},
		
		methods:{
			isPassable: function(node){
				/*if(log){
					if(!node){
						console.log('No node.'); 
					} else if(this.node === node) {
						console.log(node.id + ': Same as current node.');
					} else if((this.friendlyNodes && (typeof this.friendlyNodes[node.type] === 'undefined'))){
						console.log(node.id + ': Not a friendly node type (' + node.type + ').');
					} else if ((node.contains.length && !isFriendly(node.contains, this.friendlyEntities))){
						console.log(node.id + ': Blocked by Entity', node.contains);
					}
					return node && (this.node !== node) && (!this.friendlyNodes || (typeof this.friendlyNodes[node.type] !== 'undefined')) && (!node.contains.length || isFriendly(node.contains, this.friendlyEntities));
				}*/
				return node && (this.node !== node) && (!this.friendlyNodes || (typeof this.friendlyNodes[node.type] !== 'undefined')) && (!node.contains.length || isFriendly(node.contains, this.friendlyEntities));
			},
			traverseNode: function(node, goal){
				var i = '',
				nodes = [];
				
				if(node === goal){
					return false;
				}
				
				if(this.isPassable(node) && !node.checked){
					for (i in node.neighbors){
						nodes.push(node.neighbors[i]);
					}
					node.checked = true;
				}
				return nodes;
			},
			gotoNode: function(node, gateway){
				if(this.isPassable(node)){
					this.destinationNode = node;
					if(this.node){
						this.distance = distance(this.node, node);
						if(this.updateOrientation){
							this.owner.orientation = angle(this.node, node, this.distance);
						}
					} else {
						this.distance = 0;
					}
					this.progress = 0;
					
					this.setState('going-' + gateway);
					return true;
				}
				
				return false;
			},
			setState: function(state){
				if(state === 'on-node'){
					this.state['on-node'] = true;
				} else {
					this.state['on-node'] = false;
					if(this.currentState){
						this.state[this.currentState] = false;
					}
					this.currentState = state;
					this.state[state] = true;
				}
			}
		}
	});
})();
