/**
# COMPONENT **change-scene**
This component allows the entity to initiate a change from the current scene to another scene.

## Messages

### Listens for:
- **new-scene** - On receiving this message, a new scene is loaded according to provided parameters or previously determined component settings.
  - @param message.scene (string) - This is a label corresponding with a predefined scene.
  - @param message.transition (string) - This can be "instant" or "fade-to-black". Defaults to an instant transition.
  - @param message.persistentData (object) - Any JavaScript value(s) that should be passed to the next scene via the "scene-loaded" call.
- **set-scene** - On receiving this message, a scene value is stored, waiting for a `new-scene` to make the transition.
  - @param scene (string) - This is a label corresponding with a predefined scene.
- **set-persistent-scene-data** - On receiving this message, persistent data is stored, waiting for a `new-scene` to make the transition.
  - @param persistentData (object) - Any JavaScript value(s) that should be passed to the next scene via the "scene-loaded" call.

## JSON Definition:
    {
      "type": "change-scene",
      
      "scene": "scene-menu",
      // Optional (but must be provided by a "change-scene" parameter if not defined here). This causes the "new-scene" trigger to load this scene.
      
      "transition": "fade-to-black",
      // Optional. This can be "instant" or "fade-to-black". Defaults to an "instant" transition.
      
      "preload": true,
      // Optional. Whether the scene should already be loaded in the background.
      
      "persistentData": {"runningScore": 1400}
      // Optional. An object containing key/value pairs of information that should be passed into the new scene on the new scenes "scene-loaded" call.
    }
*/
(function(){
	return platformer.createComponentClass({
		id: 'change-scene',
		
		constructor: function(definition){
			this.scene = this.owner.scene || definition.scene;
			this.transition = this.owner.transition || definition.transition || 'instant';
			this.persistentData = definition.persistentData || {};
			
			if(definition.message){
				this.addListener(definition.message);
				this[definition.message] = this['new-scene'];
			}
			
			this.preload = definition.preload || false;
		},

		events: {
			"scene-live": function(){
				//Makes sure we're in the current scene before preloading the next one.
				if(this.preload){
					platformer.game.loadScene(this.scene, this.transition, this.persistentData, true);
				}
			},
			"new-scene": function(response){
				var resp   = response || this,
				scene      = resp.scene || this.scene,
				transition = resp.transition || this.transition;
				data 	   = resp.persistentData || this.persistentData;
			
				platformer.game.loadScene(scene, transition, data);
			},
			"set-scene": function(scene){
				this.scene = scene;
			},
			"set-persistent-scene-data": function(dataObj){
				for (var x in dataObj)
				{
					this.persistentData[x] = dataObj[x];    
				}
			}
		}
	});
})();
