platformer.components['render-clock'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render', 'handle-render-load', 'refresh-clock']);
		this.stage = undefined;
		this.currentValue = 0;
		this.targetValue = 0;
		this.txt = new createjs.Text(this.currentValue.toString());
		this.txt.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.txt.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.txt.color = definition.color || '#000';
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		this.stage = resp.stage;
		this.txt.x = this.owner.x;
		this.txt.y = this.owner.y;
		this.txt.z = this.owner.z;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		this.stage.addChild(this.txt);
	};
	
	proto['handle-render'] = function(){
		this.txt.text = Math.floor(this.time / 1000).toString() + 'sec.';
	};
	
	proto['refresh-clock'] = function(data){
		this.time = data.time;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.txt);
		this.stage = undefined;
		this.txt = undefined;
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
