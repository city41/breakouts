/**
# COMPONENT **fullscreen**
This component listens for "toggle-fullscreen" messages to toggle the game's container to full-screen and back.

Note: This component connects to the browser's fullscreen API if available. It also sets a "full-screen" class on the game container that should be styled in CSS for proper behavior.

## Dependencies:
- [[Render-Animation]] (component on entity) - This component listens for the "animation-complete" event triggered by render-animation.

## Messages:

### Listens for:
- **toggle-fullscreen** - On receiving this message, the component will go fullscreen if not already in fullscreen mode, and vice-versa.

## JSON Definition:
    {
      "type": "fullscreen"
    }
*/

//TODO: Ideally this should be set up to work for any given element, not just the game container. - DDD
(function(){
	var enabled = false,
	element = null,
	turnOffFullScreen = function(){
		enabled = false;
		element.className = element.className.replace(/ full-screen/g, '');
		platformer.game.bindings['resize'].callback();
	},
	toggleFullscreen = function(){
		if(enabled){
			if(document.webkitExitFullscreen){
				document.webkitExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.exitFullscreen) {
				document.exitFullscreen();
			}
			turnOffFullScreen();
		} else {
			enabled = true;
			element.className += ' full-screen';
			if(element.webkitRequestFullscreen){
				if(!platformer.settings.supports.safari || platformer.settings.supports.chrome){ //Safari doesn't allow all keyboard input in fullscreen which breaks game input - DDD 5/27/2013
					element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				}
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.requestFullscreen) {
				element.requestFullscreen(); // Opera
			}
			platformer.game.bindings['resize'].callback();
		}
	};
	document.addEventListener('fullscreenchange', function(e){
		if(!document.fullscreenElement){
			turnOffFullScreen();
		}
	});
	document.addEventListener('webkitfullscreenchange', function(e){
		if(!document.webkitFullscreenElement){
			turnOffFullScreen();
		}
	});
	document.addEventListener('mozfullscreenchange', function(e){
		if(!document.mozFullScreenElement){
			turnOffFullScreen();
		}
	});
	
	return platformer.createComponentClass({
		id: 'fullscreen',
		constructor: function(definition){
			if (!element) {
				element = platformer.game.containerElement;
			}
		},
		events:{
			"toggle-fullscreen": toggleFullscreen
		}
	});
	
})();
