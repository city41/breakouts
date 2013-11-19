/**
# COMPONENT **audio**
This component plays audio. Audio is played in one of two ways, by triggering specific messages defined in the audio component definition or using an audio map which plays sounds when the entity enters specified states (like render-animation).

## Dependencies:
- [createjs.SoundJS] [link1] - This component requires the SoundJS library to be included for audio functionality.
- [[handler-render-createjs]] (on entity's parent) - This component listens for a render "tick" message in order to stop audio clips that have a play length set.

## Messages

### Listens for:
- **handle-render** - On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
  - @param message.deltaT (number) - uses the value of deltaT (time since last `handle-render`) to track progess of the audio clip and stop clip if play length has been reached.
- **audio-mute-toggle** - On receiving this message, the audio will mute if unmuted, and unmute if muted.
  - @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is toggled. Otherwise all audio is toggled from mute to unmute or vice versa.
- **audio-mute** - On receiving this message all audio will mute, or a particular sound instance will mute if an id is specified.
  - @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is muted.
- **audio-unmute** - On receiving this message all audio will unmute, or a particular sound instance will unmute if an id is specified.
  - @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is unmuted.
- **audio-stop** - On receiving this message all audio will stop playing.
- **logical-state** - This component listens for logical state changes and tests the current state of the entity against the audio map. If a match is found, the matching audio clip is played.
  - @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, begins playing corresponding audio clips. Audio play message can optionally include several parameters, many of which correspond with [SoundJS play parameters] [link2].
  - @param message.interrupt (string) - Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
  - @param message.delay (integer) - Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
  - @param message.offset (integer) - Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
  - @param message.length (integer) - Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
  - @param message.loop (integer) - Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
  - @param message.volume (float) - Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
  - @param message.pan (float) - Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
  - @param message.next (string) - Optional. Used to specify the next audio clip to play once this one is complete.

## JSON Definition:
    {
      "type": "audio",
      
      "audioMap":{
      // Required. Use the audioMap property object to map messages triggered with audio clips to play. At least one audio mapping should be included for audio to play.
      
        "message-triggered": "audio-id",
        // This simple form is useful to listen for "message-triggered" and play "audio-id" using default audio properties.
        
        "another-message": {
        // To specify audio properties, instead of mapping the message to an audio id string, map it to an object with one or more of the properties shown below. Many of these properties directly correspond to [SoundJS play parameters] (http://www.createjs.com/Docs/SoundJS/SoundJS.html#method_play).
        
          "sound": "another-audio-id",
          // Required. This is the audio clip to play when "another-message" is triggered.
          
          "interrupt": "none",
          // Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
          
          "delay": 500,
          // Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
          
          "offset": 1500,
          // Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
          
          "length": 2500,
          // Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.

          "loop": 4,
          // Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
          
          "volume": 0.75,
          // Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
          
          "pan": -0.25,
          // Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.

          "next": ["audio-id"]
          // Optional. Used to specify a list of audio clips to play once this one is finished.
        }
      }
    }

[link1]: http://www.createjs.com/Docs/SoundJS/module_SoundJS.html
[link2]: http://www.createjs.com/Docs/SoundJS/SoundJS.html#method_play
*/
(function(){
	var defaultSettings = {
		interrupt: createjs.Sound.INTERRUPT_ANY, //INTERRUPT_ANY, INTERRUPT_EARLY, INTERRUPT_LATE, or INTERRUPT_NONE
		delay:     0,
		offset:    0,
		loop:      0,
		volume:    1,
		pan:       0,
		length:    0,
		next:      false,
		events:    false
	},
	stop = {
		stop: true,
		playthrough: true
	},
	sortByTime = function(a,b){
		return a.time - b.time;
	},
	playSound = function(soundDefinition){
		var sound = '',
		attributes = undefined,
		instance = null;
		if(typeof soundDefinition === 'string'){
			sound      = soundDefinition;
			attributes = {};
		} else if (soundDefinition.length){
			if(typeof soundDefinition[0] === 'string'){
				sound      = soundDefinition[0];
				attributes = {next: []};
			} else {
				sound      = soundDefinition[0].sound;
				attributes = {};
				for (var property in soundDefinition[0]){
					attributes[property] = soundDefinition[0][property];
				}
				if(attributes.next){
					attributes.next = attributes.next.slice();
				} else {
					attributes.next = [];
				}
			}
			for(var i = 1; i < soundDefinition.length; i++){
				attributes.next.push(soundDefinition[i]);
			}
		} else {
			sound      = soundDefinition.sound;
			attributes = soundDefinition;
		}
		if(platformer.settings.assets[sound].data){
			for(var item in platformer.settings.assets[sound].data){
				attributes[item] = attributes[item] || platformer.settings.assets[sound].data[item];
			}
		}
		if(platformer.settings.assets[sound].assetId){
			sound = platformer.settings.assets[sound].assetId;
		}
		return function(value){
			var self = this,
			audio = undefined,
			next = false,
			events = false,
			offset = defaultSettings.offset,
			length    = 0;
			
			value = value || attributes;
			if(value && value.stop){
				if(instance) {
					if(value.playthrough){
						instance.remainingLoops = 0;
					} else {
						instance.stop();
						self.removeClip(instance);
					}
				}
			} else {
				if(value){
					var interrupt = value.interrupt || attributes.interrupt || defaultSettings.interrupt,
					delay         = value.delay     || attributes.delay  || defaultSettings.delay,
					loop          = value.loop      || attributes.loop   || defaultSettings.loop,
					volume        = (typeof value.volume !== 'undefined')? value.volume: ((typeof attributes.volume !== 'undefined')? attributes.volume: defaultSettings.volume),
					pan           = value.pan       || attributes.pan    || defaultSettings.pan,
					length        = value.length    || attributes.length || defaultSettings.length;
					
					offset        = value.offset    || attributes.offset || defaultSettings.offset;
					next          = value.next      || attributes.next   || defaultSettings.next;
					events        = value.events    || attributes.events || defaultSettings.events;
					
					audio = instance = createjs.Sound.play(sound, interrupt, delay, offset, loop, volume, pan);
					
				} else {
					audio = instance = createjs.Sound.play(sound, defaultSettings.interrupt, defaultSettings.delay, defaultSettings.offset, defaultSettings.loop, defaultSettings.volume, defaultSettings.pan);
				}
				
				if(events){
					audio.sequenceEvents = [];
					for(var i = 0; i < events.length; i++){
						audio.sequenceEvents.push({
							event: events[i].event,
							time: +events[i].time + offset,
							message: events[i].message
						});
					}
					audio.sequenceEvents.sort(sortByTime);
				}

				audio.addEventListener('complete', function(){
					self.onComplete(audio, next);
				});

				if(audio.playState === 'playFailed'){
					if(this.owner.debug){
						console.warn('Unable to play "' + sound + '".', audio);
					}
				} else {
					if(length){ // Length is specified so we need to turn off the sound at some point.
						this.timedAudioClips.push({length: length, progress: 0, audio: audio, next: next});
					}
					this.activeAudioClips.push(audio);
				}
			}
		};
	},
	createTest = function(testStates, audio){
		var states = testStates.replace(/ /g, '').split(',');
		if(testStates === 'default'){
			return function(state){
				return testStates;
			};
		} else {
			return function(state){
				for(var i = 0; i < states.length; i++){
					if(!state[states[i]]){
						return false;
					}
				}
				return testStates;
			};
		}
	};
	
	return platformer.createComponentClass({
		id: 'audio',
			
		constructor: function(definition){
			this.timedAudioClips = [];
			this.activeAudioClips = [];		
	
			this.state = {};
			this.stateChange = false;
			this.currentState = false;
	
			this.forcePlaythrough = this.owner.forcePlaythrough || definition.forcePlaythrough;
			if(typeof this.forcePlaythrough !== 'boolean') {
				this.forcePlaythrough = true;
			}
			
			if(definition.audioMap){
				this.checkStates = [];
				for (var key in definition.audioMap){
					this.addListener(key);
					this[key] = playSound(definition.audioMap[key]);
					this.checkStates.push(createTest(key, definition.audioMap[key]));
				}
			}
		},

		events: {// These are messages that this component listens for
		    "handle-render": function(resp){
				var i     = 0,
				audioClip = undefined;
				newArray  = undefined;
				
				for(i = 0; i < this.activeAudioClips.length; i++){
					this.checkTimeEvents(this.activeAudioClips[i]);
				}
				
				if(this.timedAudioClips.length){
					newArray = this.timedAudioClips;
					this.timedAudioClips = [];
					for (i in newArray){
						audioClip = newArray[i];
						audioClip.progress += resp.deltaT;
						if(audioClip.progress >= audioClip.length){
							audioClip.audio.stop();
							this.onComplete(audioClip.audio, audioClip.next);
						} else {
							this.timedAudioClips.push(audioClip);
						}
					}
//						this.timedAudioClips = newArray;
				}

				i = 0;
				if(this.stateChange){
					if(this.checkStates){
						if(this.currentState){
							stop.playthrough = this.forcePlaythrough;
							this[this.currentState](stop);
						}
						this.currentState = false;
						for(; i < this.checkStates.length; i++){
							audioClip = this.checkStates[i](this.state);
							if(audioClip){
								this.currentState = audioClip;
								this[this.currentState]();
								break;
							}
						}
					}
					this.stateChange = false;
				}
	 	    },
	 	    
	 		"logical-state": function(state){
	 			for(var i in state){
	 				if(this.state[i] !== state[i]){
	 					this.stateChange = true;
	 					this.state[i] = state[i];
	 				}
	 			}
	 		},
	 	    
	 		"audio-mute-toggle": function(){
	 			createjs.Sound.setMute(!createjs.Sound.getMute());
	 		},
	 	    
	 		"audio-stop": function(){
	 			for (var i in this.activeAudioClips){
	 				this.activeAudioClips[i].stop();
	 			}
	 			this.activeAudioClips.length = 0;
	 			this.timedAudioClips.length = 0;
	 		},
	 	    
	 		"audio-mute": function(){
	 			createjs.Sound.setMute(true);
	 		},
	 	    
	 		"audio-unmute": function(){
	 			createjs.Sound.setMute(false);
	 		}
		},
		
		methods: {
			checkTimeEvents: function(audioClip, finished){
				var currentTime = 0;
				
				if(audioClip.sequenceEvents){
					currentTime = audioClip.getPosition();
					while(audioClip.sequenceEvents.length && (finished || (audioClip.sequenceEvents[0].time <= currentTime))){
						this.owner.trigger(audioClip.sequenceEvents[0].event, audioClip.sequenceEvents[0].message);
						audioClip.sequenceEvents.splice(0,1);
					}
				}
			},
		
			onComplete: function(audioClip, next){
				//clean up active clips
				this.removeClip(audioClip);
				
				this.checkTimeEvents(audioClip, true);
				
				this.owner.triggerEvent('clip-complete');
				
				if(next && next.length){
					if(typeof next === 'string'){
						(playSound(next)).call(this);
					} else {
						var arr = next.slice();
						arr.splice(0,1);
						if(arr.length > 0){
							(playSound(next[0])).call(this, {'next': arr});
						} else {
							(playSound(next[0])).call(this);
						}
					}
				} else {
					this.owner.triggerEvent('sequence-complete');
				}
			},
			
			removeClip: function(audioClip){
				for (var i in this.activeAudioClips){
					if (this.activeAudioClips[i] === audioClip){
						this.activeAudioClips.splice(i,1);
						break;
					}
				}
			},
			
			destroy: function(){
				this['audio-stop']();
			}
		}
	});
})();	
