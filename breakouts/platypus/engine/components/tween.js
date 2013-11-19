/**
# COMPONENT **tween**
Tween takes a list of tween definitions and plays them as needed.

## Dependencies
- [[TweenJS]] - This component requires the CreateJS TweenJS module.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for messages and on receiving them, begins playing the corresponding tween.

### Local Broadcasts:
- **[Messages specified in definition]** - Broadcasts messages from a given tween definition.

## JSON Definition
    {
      "type": "tween",

	  "events": {
	  // Required. A key/value list of events and an array representing the tween they should trigger.

	        "begin-flying": [
	        // When "begin-flying" is triggered on this entity, the following tween begins. Tween definitions adhere to a similar structure outlined by the TweenJS documentation. Each milestone on the tween is an item in this array.

                ["to", {
                    "scaleY": 1,
                    "y": 400
                }, 500],
				// If the definition is an array, the first parameter is the type of milestone, in this case "to", with all following parameters passed directly to the equivalent Tween function.
                
                ["call", "fly"],
                // "call" milestones can take a function or a string. If it's a string, the string will be triggered as an event on the entity. In this case, the component will trigger "fly".
	        ]
	    }
    }
*/
(function(){
	var createTrigger = function(entity, event, message, debug){
		return function(){
			entity.trigger(event, message, debug);
		};
	},
	createTween = function(definition){
		return function(values){
			var i  = 0,
			tweens = definition,
			tweenDef = null,
			arr = null,
			tween = createjs.Tween.get(this.owner);
			
			if(values && (typeof values !== 'string') && (values.length)){
				tweens = values;
			} else if(typeof tweens === 'string' || !tweens.length){
				return;
			}
			
			for (; i < tweens.length; i++){
				tweenDef = tweens[i];
				if(typeof tweenDef === 'string'){
					tween.call(createTrigger(this.owner, tweenDef));
				} else if (tweenDef.length) {
					if(tweenDef[0] === 'call' && typeof tweenDef[1] === 'string'){
						tween.call(createTrigger(this.owner, tweenDef[1]));
					} else {
						arr = tweenDef.slice();
						arr.splice(0,1);
						tween[tweenDef[0]].apply(tween, arr);
					}
				} else {
					if(tweenDef.method === 'call' && typeof tweenDef.arguments === 'string'){
						tween.call(createTrigger(this.owner, tweenDef.arguments));
					} else {
						tween[tweenDef.method].apply(tween, tweenDef.arguments);
					}
				}
			}
		};
	};

	return platformer.createComponentClass({
		id: 'tween',
		
		constructor: function(definition){
			if(definition.events){
				for(var event in definition.events){
					this[event] = createTween(definition.events[event]);
					this.addListener(event);
				}
			}
		}
	});
})();
