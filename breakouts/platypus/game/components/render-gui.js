platformer.components['render-gui'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render', 'handle-render-load']);
		
		this.background = undefined;
		this.stage = undefined;
		
		var spriteSheetSpec = {
			images: definition.spriteSheet.images.slice(),
			frames: definition.spriteSheet.frames,
			animations: definition.spriteSheet.animations
		};
		for (var x = 0; x < spriteSheetSpec.images.length; x++)
		{
			spriteSheetSpec.images[x] = platformer.assets[spriteSheetSpec.images[x]];
		}
		var spriteSheet = new createjs.SpriteSheet(spriteSheetSpec);
		this.background = new createjs.BitmapAnimation(spriteSheet);
		this.currentAnimation = 'default';
		this.background.scaleX = this.owner.scaleX || 1;
		this.background.scaleY = this.owner.scaleY || 1;
		if(this.currentAnimation){
			this.background.gotoAndPlay(this.currentAnimation);
		}
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		this.stage = resp.stage;
		this.stage.addChild(this.background);
		this.background.x = 200;
		this.background.y = 200;
		this.background.z = this.owner.z;
	};
	
	proto['handle-render'] = function(resp){
		
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value, debug){
			self[messageId](value, debug);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
