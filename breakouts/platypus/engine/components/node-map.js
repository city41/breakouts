/**
# COMPONENT **node-map**
This component sets up a node-map to be used by the [[node-resident]] component on this entity's child entities.

## Dependencies
- [[entity-container]] - This component expects the entity to have an `entity-container` component so it knows when `node-resident` children are added.

## Messages

### Listens for:
- **add-node** - Expects a node definition to create a node in the node-map.
  - @param definition.id (string or array) - This value becomes the id of the Node. Arrays are joined using "|" to create the id string.
  - @param definition.type (string) - This determines the type of the node.
  - @param definition.x (number) - Sets the x axis position of the node.
  - @param definition.y (number) - Sets the y axis position of the node.
  - @param definition.z (number) - Sets the z axis position of the node.
  - @param definition.neighbors (object) - A list of key/value pairs where the keys are directions from the node and values are node ids. For example: {"west": "node12"}.
- **child-entity-added** - Checks the child entity for a nodeId and if found adds the child to the corresponding node.
  - @param entity (Entity) - The entity that may be placed on a node.

## JSON Definition
    {
      "type": "node-map"
      
      "map": [
      // Optional. An array of node definitions to create the node-map.
        
        {
          "id": "node1",
          // A string or array that becomes the id of the Node. Arrays are joined using "|" to create the id string.
          
          "type": "path",
          // A string that determines the type of the node.
          
          "x": 0,
          // Sets the x axis position of the node.
          
          "y": 0,
          // Sets the y axis position of the node.
          
          "z": 0,
          // Sets the z axis position of the node.

          "neighbors": {
          // A list of key/value pairs where the keys are directions from the node and values are node ids.
            
            "west": "node0",
            "east": "node2"
          }
        }
      ]
    }
*/
(function(){
	var Node = function(definition, map){
		if(definition.id){
			if(typeof definition.id === 'string'){
				this.id = definition.id;
			} else if (definition.id.length) {
				this.id = definition.id.join('|');
			} else {
				id = '' + Math.random();
			}
		} else {
			id = '' + Math.random();
		}
		
		this.isNode = true;
		this.map = map;
		this.contains = [];
		this.type = definition.type || '';
		this.x = definition.x || 0;
		this.y = definition.y || 0;
		this.z = definition.z || 0;
		
		this.neighbors = definition.neighbors || {};
	},
	proto = Node.prototype;
	
	proto.getNode = function(desc){
		var neighbor = null;
		
		if(this.neighbors[desc]){
			neighbor = this.neighbors[desc];
			if(neighbor.isNode){
				return neighbor;
			} else if(typeof neighbor === 'string'){
				neighbor = this.map.getNode(neighbor);
				if(neighbor){
					this.neighbors[desc] = neighbor;
					return neighbor;
				}
			} else if (neighbor.length) {
				neighbor = this.map.getNode(neighbor.join('|'));
				if(neighbor){
					this.neighbors[desc] = neighbor;
					return neighbor;
				}
			}
			return null;
		} else {
			return null;
		}
	};

	proto.add = function(entity){
		for(var i = 0; i < this.contains.length; i++){
			if(this.contains[i] === entity){
				return false;
			}
		}
		this.contains.push(entity);
		return entity;
	};
	
	proto.remove = function(entity){
		for(var i = 0; i < this.contains.length; i++){
			if(this.contains[i] === entity){
				return this.contains.splice(i,1)[0];
			}
		}
		return false;
	};
	
	return platformer.createComponentClass({
		id: 'node-map',
		
		constructor: function(definition){
			var i = 0;
			
			this.map = [];
			
			if(definition.map){
				for(; i < definition.map.length; i++){
					this["add-node"](definition.map[i]);
				}
			}
		},

		events: {
			"add-node": function(nodeDefinition){
				this.map.push(new Node(nodeDefinition, this));
			},
			"child-entity-added": function(entity){
				if(entity.nodeId){
					entity.node = this.getNode(entity.nodeId);
					entity.trigger('on-node', entity.node);
				}
			}
		},
		
		methods: {
			getNode: function(){
				var i   = 0,
				id      = '',
				divider = '',
				args    = arguments;
				
				if(args.length === 1){
					if((typeof args[0] !== 'string') && args[0].length){
						args = args[0];
					}
				}
				
				for (i = 0; i < args.length; i++){
					id += divider + args[i];
					divider = '|';
				}
				for (i = 0; i < this.map.length; i++){
					if(this.map[i].id === id){
						return this.map[i];
					}
				}
				return null;
			}
		}
	});
})();
