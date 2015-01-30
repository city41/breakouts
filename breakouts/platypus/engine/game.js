/**
# CLASS game
This class is used to create the `platformer.game` object. The `game` object handles loading [[Scene]]s and transitions between scenes. It also accepts external events and passes them on to the current scene.

## Methods
- **constructor** - Creates an object from the game class.
  - @param definition (object) - Collection of settings from config.json.
  - @param onFinishedLoading (function) - An optional function to run once the game has begun.
- **tick** - Called by the CreateJS ticker. This calls tick on the scene.
  - @param deltaT (number) - The time passed since the last tick.
- **loadScene** - Loads a scene. If there's a transition, performs the transition.
  - @param sceneId (string) - The scene to load.
  - @param transition (string) - What type of transition to make. Currently there are: 'fade-to-black' and 'instant'
- **loadNextScene** - Sets the currentScene to the specified scene. Called by loadScene, shouldn't be called on its own.
  - @param sceneId (string) - The scene to load.
- **completeSceneTransition** - Ends the transition and destroys the old scene. Called when the scene effect is finished.
- **addEventListener** - Adding event listeners to the specified element and assigning callback functions.
  - @param element (DOM element) - The element to add the eventListener to.
  - @param event (DOM events) - The event to listen for.
  - @param callback (function) - The function to call when the event occurs.
- **destroy** - Destroys the object so that it's ready to garbage collect.

## Helper Function
- **bindEvent** - Returns a function which takes in an event and calls the callback function passing it the eventId and the event.
  - @param eventId (string) - The id of the event we're binding to.
  - @param callback (function) - The function to call.
*/

platformer.classes.game = (function(){
	var bindEvent = function(eventId, callback){return function(event){callback(eventId, event);};};
	var game      = function (definition, onFinishedLoading){
		var innerRootElement = document.createElement('div'),
		outerRootElement = null;

		this.currentScene = undefined;
		this.loaded    = null;
		this.tickContent = {
			deltaT: 0,
			count: 0
		};
		this.settings = definition;
		
		if(document.getElementById(definition.global.rootElement || "root")){
			outerRootElement = document.getElementById(definition.global.rootElement || "root");
		} else {
			outerRootElement = document.createElement('div');
			outerRootElement.id = definition.global.rootElement || "root";
			document.getElementsByTagName('body')[0].appendChild(outerRootElement);
		}
		for (var i in definition.supports){
			if(definition.supports[i]){
				outerRootElement.className += ' supports-' + i;
			}
		}
		
		innerRootElement.id = 'inner-' + outerRootElement.id;
		outerRootElement.appendChild(innerRootElement);
		this.rootElement = innerRootElement;
		this.containerElement = outerRootElement;
		
		this.loadScene(definition.global.initialScene);

		// Send the following events along to the scene to handle as necessary:
		var self = this,
		callback = null;
		
		if(definition.debug){ //If this is a test build, leave in the browser key combinations so debug tools can be opened as expected.
			callback = function(eventId, event){
				self.currentScene.trigger(eventId, event);
			};
		} else { // Otherwise remove default browser behavior for key inputs so that they do not interfere with game-play.
			callback = function(eventId, event){
				self.currentScene.trigger(eventId, event);
				event.preventDefault(); // this may be too aggressive - if problems arise, we may need to limit this to certain key combos that get in the way of game-play. Example: (event.metaKey && event.keyCode == 37) causes an accidental cmd key press to send the browser back a page while playing and hitting the left arrow button.
			};
		}
		
		this.bindings = [];
		this.addEventListener(window, 'keydown', callback);
		this.addEventListener(window, 'keyup',   callback);

		// If aspect ratio of game area should be maintained on resizing, create new callback to handle it
		if(definition.global.aspectRatio){
			callback = function(eventId, event){
				var element = innerRootElement;
				var ratio   = definition.global.aspectRatio;
				var newW    = outerRootElement.offsetWidth;
				var newH    = outerRootElement.offsetHeight;
				if(definition.global.maxWidth && (definition.global.maxWidth < newW)){
					newW = definition.global.maxWidth;
				}
				var bodyRatio = newW / newH;
				if (bodyRatio > ratio)
				{  //Width is too wide
					element.style.height = newH + 'px';
				    newW = newH * ratio;
				    element.style.width = newW + 'px';
				} else {  //Height is too tall
					element.style.width = newW + 'px';
				    newH = newW / ratio;
				    element.style.height = newH + 'px';
				}
				if(definition.global.resizeFont){
					outerRootElement.style.fontSize = Math.round(newW / 100) + 'px';
				}
				element.style.marginTop = '-' + Math.round(newH / 2) + 'px';
				element.style.marginLeft = '-' + Math.round(newW / 2) + 'px';
				element.style.top = '50%';
				element.style.left = '50%';
				self.currentScene.trigger(eventId, event);
			};
			callback('resize');
		} else if(definition.global.resizeFont) {
			callback = function(eventId, event){
				outerRootElement.style.fontSize = parseInt(self.rootElement.offsetWidth / 100) + 'px';
				self.currentScene.trigger(eventId, event);
			};
			callback('resize');
		}
		this.addEventListener(window, 'orientationchange', callback);
		this.addEventListener(window, 'resize',            callback);
		
		if(onFinishedLoading){
			onFinishedLoading(this);
		}
	};
	var proto = game.prototype;
	
	proto.tick = function(deltaT){
		this.tickContent.deltaT = deltaT;
		this.tickContent.count += 1;
		
		if(this.loadedScene){
			this.loadedScene.trigger('tick', this.tickContent);
		}
		if(this.currentScene){
			this.currentScene.trigger('tick', this.tickContent);
		}
	};
	
	proto.loadScene = function(sceneId, transition, persistantData, preloading){
		var self = this;
		this.inTransition = true;
		this.leavingScene = this.currentScene;
		
		if(preloading){
			this.loadNextScene(sceneId);
			return;
		}
		
		switch(transition){
		case 'fade-to-black':
			var element = document.createElement('div');
			this.rootElement.appendChild(element);
			element.style.width = '100%';
			element.style.height = '100%';
			element.style.position = 'absolute';
			element.style.zIndex = '12';
			element.style.opacity = '0';
			element.style.background = '#000';
			new createjs.Tween(element.style).to({opacity:0}, 500).to({opacity:1}, 500).call(function(t){
				if(!this.loaded) {
					self.loadNextScene(sceneId, persistantData);
				}
				self.completeSceneTransition(persistantData);
			}).wait(500).to({opacity:0}, 500).call(function(t){
				self.rootElement.removeChild(element);
				element = undefined;
			});
			break;
		case 'instant':
		default:
			if(!this.loaded){
				self.loadNextScene(sceneId, persistantData);
			}
			this.completeSceneTransition(persistantData);
		}
	};
	
	proto.loadNextScene = function(sceneId, persistantData){
		var scene = null;
		
		if(typeof sceneId === 'string'){
			scene = this.settings.scenes[sceneId];
		} else {
			scene = sceneId;
		}
		
		this.loaded = sceneId;
		this.loadedScene = new platformer.classes.scene(scene, this.rootElement);

		console.log('Scene loaded: ' + sceneId); //putting a console log here, because Android seems to hang if I do not. Need to test more Android devices.
		this.loadedScene.trigger('scene-loaded', persistantData);
	};
	
	proto.completeSceneTransition = function(persistantData){
		var sceneId = this.loaded;
		
		this.currentScene = this.loadedScene;
		this.loadedScene  = null;
		
		this.loaded = false;
		this.inTransition = false;
		if(this.leavingScene){
			this.leavingScene.destroy();
			this.leavingScene = false;
		}

		console.log('Scene live: ' + sceneId); //putting a console log here, because Android seems to hang if I do not. Need to test more Android devices.
		this.currentScene.trigger('scene-live', persistantData);
	};
	
	proto.addEventListener = function(element, event, callback){
		this.bindings[event] = {element: element, callback: bindEvent(event, callback)};
		element.addEventListener(event, this.bindings[event].callback, true);
	};
	
	proto.destroy = function ()
	{
		for (var binding in this.bindings){
			element.removeEventListener(this.bindings[binding].element, this.bindings[binding].callback, true);
		}
		this.bindings.length = 0;
	};
	
	return game;
})();