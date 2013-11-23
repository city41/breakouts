/**
# COMPONENT **voice-over**
This component uses its definition to load two other components (audio and render-animation) who work in an interconnected way to render animations corresponding to one or more audio tracks.

## Dependencies
- [[render-animation]] - This component creates a `render-animation` component to handle facial movements corresponding to an audio track.
- [[audio]] - This component creates an `audio` component to handle playing a voice-over track and trigger events to update the facial rendering.

## Messages

### Listens for:
- **load** - On receiving this message, this component removes itself from the entity. (It creates the [[render-animation]] and [[audio]] components in its constructor.)

## JSON Definition
    {
      "type": "voice-over"
      
      "frameLength": 200,
      // Optional. Specifies how long a described voice-over frame should last. Default is 100 milliseconds.
      
      "messagePrefix": "i-say",
      // Optional. Specifies the prefix that messages between the render and audio components should use. This will cause the audio to trigger events like "i-say-w" and "i-say-a" (characters listed in the animationMap), that the render-animation uses to show the proper frame. Defaults to "voice-over".
      
      "animationMap": {
        "default": "mouth-closed"
        // Required. Specifies animation of default position.
        
        "w": "mouth-o",
        "a": "mouth-aah",
        "t": "mouth-t"
        // Optional. Also list single characters that should map to a given voice-over animation frame.
      }
      
      "voiceoverMap": {
        "message-triggered": [{
          "sound": "audio-id",
          // Required. This is the audio clip to play when "message-triggered" is triggered. It may be a string as shown or an object of key/value pairs as described in an [[audio]] component definition.
          
          "voice": "waat"
          // Optional. This string defines the voice-over sequence according to the frames defined above. Each character lasts the length specified by "frameLength" above. If not specified, voice will be the default frame.
        }]
      }
      
      "spriteSheet": {
      //Required. Defines an EaselJS sprite sheet to use for rendering. See http://www.createjs.com/Docs/EaselJS/SpriteSheet.html for the full specification.

	      "images": ["example0", "example1"],
	      //Required: An array of ids of the images from the asset list in config.js.
	      
	      "frames": {
	      //Required: The dimensions of the frames on the image and how to offset them around the entity position. The image is automatically cut up into pieces based on the dimensions. 
	      	"width":  100,
			"height": 100,
			"regY":   100,
			"regX":   50
	      },
	      
	      "animations":{
	      //Required: The list of animation ids and the frames that make up that animation. The frequency determines how long each frame plays. There are other possible parameters. Additional parameters and formatting info can be found in createJS.
			"mouth-o":   0,
			"mouth-aah": 1,
			"mouth-t":   2,
			"mouth-closed": {"frames": [3, 4, 5], "frequency": 4}
		  }
      }
      
      //This component also accepts all parameters accepted by either [[render-animation]] or [[audio]] and passes them along when it creates those components.
    }
*/
(function(){
	var getEventName = function(msg, VO){
		if(VO === ' '){
			return msg + 'default';
		} else {
			return msg + VO;
		}
	},
	createVO = function(sound, events, message, frameLength){
		var i = '',
		definitions = [],
		definition = null;
		
		if(!events[' ']){
			events[' '] = events['default'];
		}
		
		if (sound.length){
			for (i in sound){
				definitions.push(createAudioDefinition(sound[i], events, message, frameLength));
			}
			definition = definitions.splice(0, 1)[0];
			definition.next = definitions;
			return definition;
		} else {
			return createAudioDefinition(sound, events, message, frameLength);
		}
	},
	createAudioDefinition = function(sound, events, message, frameLength){
		var i      = 0,
		definition = {},
		time       = 0,
		lastFrame  = '',
		thisFrame  = '',
		voice = sound.voice;
		
		if (typeof sound.sound === 'string'){
			definition.sound = sound.sound;
			definition.events = [];
		} else {
			for(i in sound.sound){
				definition[i] = sound.sound[i];
			}
			
			if(definition.events){
				definition.events = definition.events.slice();
			} else {
				definition.events = [];
			}
		}
		
		if(voice){
			voice += ' ';
			
			for (i = 0; i < voice.length; i++) {
				thisFrame = voice[i];
				if(thisFrame !== lastFrame){
					lastFrame = thisFrame;
					definition.events.push({
						"time": time,
						"event": getEventName(message, thisFrame)
					});
				}
				time += frameLength;
			}
		}
		
		return definition;
	};

	return platformer.createComponentClass({
		id: 'voice-over',
		
		constructor: function(definition){
			var i               = '',
			audioDefinition     = {
				audioMap: {},
				aliases:  definition.aliases
			},
			animationDefinition = {
				spriteSheet:   definition.spriteSheet,
				acceptInput:   definition.acceptInput,
				scaleX:        definition.scaleX,
				scaleY:        definition.scaleY,
				rotate:        definition.rotate,
				mirror:        definition.mirror,
				flip:          definition.flip,
				hidden:        definition.hidden,
				animationMap:  {},
				pins:          definition.pins,
				pinTo:         definition.pinTo,
				aliases:       definition.aliases
			};
			
			this.message = (definition.messagePrefix || 'voice-over') + '-';
			
			for (i in definition.animationMap){
				animationDefinition.animationMap[getEventName(this.message, i)] = definition.animationMap[i];
			}
			animationDefinition.animationMap['default'] = definition.animationMap['default'];
			console.log(animationDefinition);
			this.owner.addComponent(new platformer.components['render-animation'](this.owner, animationDefinition));

			for (i in definition.voiceoverMap){
				audioDefinition.audioMap[i] = createVO(definition.voiceoverMap[i], definition.animationMap, this.message, definition.frameLength || 100);
			}
			console.log(audioDefinition);
			this.owner.addComponent(new platformer.components['audio'](this.owner, audioDefinition));
		},

		events: {// These are messages that this component listens for
		    "load": function(resp){
		        this.owner.removeComponent(this);
	 	    }
		}
	});
})();
