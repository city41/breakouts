/**
# COMPONENT **enable-ios-audio**
This component enables JavaScript-triggered audio play-back on iOS devices by overlaying an invisible `div` across the game area that, when touched, causes the audio track to play, giving it necessary permissions for further programmatic play-back. Once touched, it removes itself as a component from the entity as well as removes the layer `div` DOM element.

## Dependencies:
- [createjs.SoundJS] [link1] - This component requires the SoundJS library to be included for audio functionality.
- **rootElement** property (on entity) - This component requires a DOM element which it uses to overlay the touchable audio-instantiation layer `div`.

## JSON Definition:
    {
      "type": "enable-ios-audio",
      
      "audioId": "combined"
      // Required. The SoundJS audio id for the audio clip to be enabled for future play-back.
    }

[link1]: http://www.createjs.com/Docs/SoundJS/module_SoundJS.html
*/
platformer.components['enable-ios-audio'] = (function(){
	var iOSAudioEnabled = false,
//	console = {log:function(txt){document.title += txt;}},
	component = function(owner, definition){
		var self = this;
		this.owner = owner;
		
		if(!iOSAudioEnabled){
			this.touchOverlay = document.createElement('div');
			this.touchOverlay.style.width    = '100%';
			this.touchOverlay.style.height   = '100%';
			this.touchOverlay.style.position = 'absolute';
			this.touchOverlay.style.zIndex   = '20';
			this.owner.rootElement.appendChild(this.touchOverlay);
			enableIOSAudio(this.touchOverlay, definition.audioId, function(){
				self.removeComponent();
			});
		} else {
			this.removeComponent();
		}
	},
	enableIOSAudio  = function(element, audioId, functionCallback){
		var callback = false,
	    click        = false;
		
//		document.title = '';
		iOSAudioEnabled = true;
		click = function(e){
			var audio = createjs.Sound.play(audioId),
			forceStop = function () {
			    audio.removeEventListener('succeeded', forceStop);
			    audio.pause();
//			    console.log('g');
			},
			progress  = function () {
			    audio.removeEventListener('ready', progress);
//			    console.log('h');
			    if (callback) callback();
			};
//		    console.log('a');
			
			if(audio.playState !== 'playFailed'){
//			    console.log('b(' + audio.playState + ')');
				audio.stop();
			} else {
//			    console.log('c(' + audio.playState + ')');
				audio.addEventListener('succeeded', forceStop);
			    audio.addEventListener('ready', progress);

			    try {
					audio.play();
//				    console.log('d(' + audio.playState + ')');
			    } catch (e) {
//				    console.log('e');
			    	callback = function () {
					    console.log('i');
			    		callback = false;
			    		audio.play();
			    	};
			    }
			}
			element.removeEventListener('touchstart', click, false);
			if(functionCallback){
//			    console.log('f');
				functionCallback();
			}
		};
		element.addEventListener('touchstart', click, false);
	},
	proto = component.prototype;
	
	proto.removeComponent = function(){
		this.owner.removeComponent(this);
	};
	
	proto.destroy = function(){
		if(this.touchOverlay){
			this.owner.rootElement.removeChild(this.touchOverlay);
		}
		this.touchOverlay = undefined;
	};
	
	return component;
})();
