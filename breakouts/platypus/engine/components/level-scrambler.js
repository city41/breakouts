/**
# COMPONENT **level-scrambler**
This component works in tandem with [[tiled-loader]] by taking several Tiled maps and combining them before `tiled-loader` processes them.

Note: Set "manuallyLoad" to `true` in the `tiled-loader` component JSON definition so that it will wait for this component's "load-level" call.

## Dependencies
- [[tiled-loader]] - Feeds information into `tiled-loader` to load a combined map.

## Messages

### Listens for:
- **scene-loaded** - On receiving this message, `level-scrambler` uses its JSON definition to create a combined map.
  - @param message (object) - Optional. Data passed into this scene from the last scene.

### Local Broadcasts:
- **load-level** - Once the combined level is ready, this message is triggered so `tiled-loader` will handle it.
  - @param message.persistentData (obj) - Data received from the initiating "scene-loaded" call is passed on here.
  - @param message.level (obj) - This is a JSON structure representing the combined map.

## JSON Definition
    {
      "type": "level-scrambler"
      
      "levelPieces": {
      // Required. This is a list of key/value pairs listing the pieces the level template (below) will use to compose a larger map.
        
        "start"  : "start-map",
        "end" 	 : "end-map",
        // Labels include map sections by their map names
        
        "forest" : ["forest-1", "forest-2", "forest-3"]
        // If one section should be chosen from many sections, maps can be listed in an array.
      },

      "levelTemplate": [ ["start", "forest"], ["forest", "end"] ]
      // Required. This is a 2d array, laying out the map structure using the labels above to compose the larger map.

      "useUniques": true
      // Optional. If set, no single map is used twice in the creation of the combined map.
    }
*/
(function(){
	return platformer.createComponentClass({
		id: 'level-scrambler',
		constructor: function(definition){
			this.levelTemplate = this.owner.levelTemplate || definition.levelTemplate;
			this.useUniques = this.owner.useUniques || definition.useUniques || true;
			
			this.levelPieces = {};
			var piecesToCopy = this.owner.levelPieces || definition.levelPieces;
			if (piecesToCopy) {
				for (var x in piecesToCopy) {
					if (typeof piecesToCopy[x] == "string") {
						this.levelPieces[x] = piecesToCopy[x];
					} else if (piecesToCopy[x].length) {
						this.levelPieces[x] = [];
						for (var y = 0; y < piecesToCopy[x].length; y++) {
							this.levelPieces[x].push(piecesToCopy[x][y]); 
						}
					} else {
						console.warn('Level Scrambler: Level pieces of incorrect type: ' + piecesToCopy[x]);
					}
				}
			}
			this.levelMessage = {level: null, persistentData: null};
		},

		events: {// These are messages that this component listens for
			"scene-loaded": function(persistentData) {
				var templateRow = null;
				
				this.levelMessage.persistentData = persistentData;
				if (this.levelTemplate) {
					if(typeof this.levelTemplate == "string") {
						this.levelMessage.level = [this.getLevelPiece(this.levelTemplate)];
					} else if (this.levelTemplate.length) {
						this.levelMessage.level = [];
						for (var x = 0; x < this.levelTemplate.length; x++){
							templateRow = this.levelTemplate[x];
							if (typeof templateRow == "string") {
								this.levelMessage.level[x] = this.getLevelPiece(templateRow);
							} else if (templateRow.length) {
								this.levelMessage.level[x] = [];
								for (var y = 0; y < templateRow.length; y++){
									this.levelMessage.level[x][y] = this.getLevelPiece(templateRow[y]);
								}
							} else {
								console.warn('Level Scrambler: Template row is neither a string or array. What is it?');
							}
						}
					} else {
						console.warn('Level Scrambler: Template is neither a string or array. What is it?');
					}
				} else {
					console.warn('Level Scrambler: There is no level template.');
				}
				
				this.owner.triggerEvent('load-level', this.levelMessage);
			}
		},
		
		methods: {// These are methods that are called by this component.
			getLevelPiece: function (type) {
				var pieces = this.levelPieces[type];
				var temp = null;
				var random = 0;
				if(pieces){
					if(typeof pieces == "string"){
						if (this.useUniques) {
							temp = pieces;
							this.levelPieces[type] = null;
							return temp;
						} else {
							return pieces;
						}
					} else if (pieces.length) {
						random = Math.floor(Math.random() * pieces.length);
						if (this.useUniques) {
							return (this.levelPieces[type].splice(random, 1))[0];
						} else {
							return pieces[random];
						}
					} else {
						console.warn('Level Scrambler: There are no MORE level pieces of type: ' + type);
					}
					
				} else {
					console.warn('Level Scrambler: There are no level pieces of type: ' + type);
				}
				
				return null;
			},
			destroy: function () {
				this.levelMessage.level = null;
				this.levelMessage.persistentData = null;
				this.levelMessage = null;
			}
		}
	});
})();
