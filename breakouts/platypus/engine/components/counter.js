/**
# COMPONENT **counter**
A simple component that keeps count of something and sends messages each time the count changes. Can also have a total. When it does it will display 'count / total'.

## Messages

### Listens for:
- **increment-count** - Increments the count by 1.
- **change-count** - Changes the count to the given value.
  - @param data.count (number) - The new count value.
- **change-total** - Changes the total to the given value.
  - @param data.total (number) - The new total value.
- **[increment-count message from definition]** - If the entity has multiple counters, you can define a message specific to each counter that will be translated into a increment-count call within the object.
- **[change-count message from definition]** - If the entity has multiple counters, you can define a message specific to each counter that will be translated into a change-count call within the object.
  - @param data.count (number) - The new count value.
- **[change-total message from definition]** - If the entity has multiple counters, you can define a message specific to each counter that will be translated into a change-total call within the object.
  - @param data.total (number) - The new total value.

### Local Broadcasts:
- **update-content** - A call used to notify other components that the count or total has changed.
  - @param number - The count.
  
## JSON Definition
    {
      "type": "counter",
      
      "countMessage" : "coin-change-count"
      //Optional - An alternate message to change-count. Used in the case that you have two counters on the same entity and want to talk to a specific one.
      
      "incrementMessage" : "coin-increment"
      //Optional - An alternate message to increment-count. Used in the case that you have two counters on the same entity and want to talk to a specific one.

      "totalMessage" : "coin-change-total"
      //Optional - An alternate message to change-total. Used in the case that you have two counters on the same entity and want to talk to a specific one.
    }
*/

platformer.components['counter'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['increment-count', 'change-count', 'change-total']);
		
		if(definition.incrementMessage)
		{
			this.addListener(definition.incrementMessage);
			this[definition.incrementMessage] = this['increment-count'];
		}
		if(definition.countMessage)
		{
			this.addListener(definition.countMessage);
			this[definition.countMessage] = this['change-count'];
		}
		if(definition.totalMessage)
		{
			this.addListener(definition.totalMessage);
			this[definition.totalMessage] = this['change-total'];
		}
		
		this.count = 0;
		this.total = 0;
		this.showTotal = definition.showTotal || false;
		this.output = {
			    text: ''
			};
	};
	var proto = component.prototype;
	
	proto['change-total'] = function(total){
		this.total = total;
		if(this.total)
		{
			this.output.text = this.count + "/" + this.total;
		} else {
			this.output.text = '' + this.count;
		}
		this.owner.trigger('update-content', this.output);
	};
	
	proto['change-count'] = function(count){
		this.count = count;
		if(this.total)
		{
			this.output.text = this.count + "/" + this.total;
		} else {
			this.output.text = '' + this.count;
		}
		this.owner.trigger('update-content', this.output);
	};
	
	proto['increment-count'] = function(){
		this.count++;
		if(this.total)
		{
			this.output.text = this.count + "/" + this.total;
		} else {
			this.output.text = '' + this.count;
		}
		this.owner.trigger('update-content', this.output);
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.owner = undefined;
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
