/**
# COMPONENT **logic-timer**
A timer that can used to trigger events. The timer can increment and decrement. It can be an interval timer, going off over and over. Has a max time which it will not exceed by default this is 1 hour.

## Dependencies
- [[Handler-Logic]] (on entity's parent) - This component listens for a "handle-logic" message to update the timer.

## Messages

### Listens for:
- **handle-logic** - Handles the update for the timer. Increments or decrements the current time. If it's hit the max it stops the timer at the max. If it hits the alarm it sets it off. Sends an update message indicating the timer's current time for other components to use.
  - @param data.deltaT (number) - The time passed since the last tick.
- **set** - Set the time.
  - @param data.time (number) - The new value for the time.
- **start** - Start the timer counting.
- **stop** - Stop the timer counting.

### Local Broadcasts:
- **[alarm message from definition]** - The definition.alarm value from the JSON definition is used as the message id. It's sent when the alarm goes off.
- **[update message from definition]** - The definition.update value from the JSON definition is used as the message id. It's sent every 'handle-logic' tick. 
  - @param message.time (number) - The current time value for the timer.

## JSON Definition
    {
      "type": "logic-timer",
      "time" : 0,
      //Optional - The starting time for the timer. Defaults to 0.
	  "alarmTime" : 10000,
	  //Optional - The time when the alarm will trigger the alarm message. Defaults to undefined, which never triggers the alarm.
	  "isInterval" : false,
	  //Optional - Whether or not the alarm fires at intervals of the alarmTime. Defaults to false.
	  "alarmMessage" : 'ding',
	  //Optional - The message sent when the alarm goes off. Defaults to ''.
	  "updateMessage" : '',
	  //Optional - The message sent when the timer updates. Defaults to ''.
	  "on" : true,
	  //Optional - Whether the alarm starts on. Defaults to true.
	  "isIncrementing" : true,
	  //Optional - Whether the timer is incrementing or decrementing. If the value is false it is decrementing. Defaults to true.
	  "maxTime" : 3600000
	  //Optional - The max value, positive or negative, that the timer will count to. At which it stops counting. Default to 3600000 which equals an hour.
    }
*/
platformer.components['logic-timer'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-logic', 'set-timer', 'start-timer', 'stop-timer']);
		this.time = this.owner.time || definition.time ||  0;
		this.prevTime = this.time;
		this.alarmTime = this.owner.alarmTime || definition.alarmTime || undefined;
		this.isInterval = this.owner.isInterval || definition.isInterval || false;
		this.alarmMessage =  this.owner.alarmMessage || definition.alarmMessage || '';
		this.updateMessage = this.owner.updateMessage || definition.updateMessage || '';
		this.isOn = this.owner.on || definition.on || true;
		this.isIncrementing = this.owner.isIncrementing || definition.isIncrementing || true;
		this.maxTime = this.owner.maxTime || definition.maxTime || 3600000; //Max time is 1hr by default.
	};
	var proto = component.prototype;
	
	proto['handle-logic'] = function(data){
		if (this.isOn)
		{
			this.prevTime = this.time;
			this.isIncrementing ? this.time += data.deltaT : this.time -= data.deltaT;
			if (Math.abs(this.time) > this.maxTime)
			{
				//If the timer hits the max time we turn it off so we don't overflow anything.
				if (this.time > 0)
				{
					this.time = this.maxTime;
				} else if (this.time < 0) {
					this.time = -this.maxTime;
				}
				this['stop-timer']();
			}
			
			if (typeof this.alarmTime !== 'undefined')
			{
				if (this.isInterval)
				{
					if (this.isIncrementing)
					{
						if ( Math.floor(this.time / this.alarmTime) > Math.floor(this.prevTime / this.alarmTime))
						{
							this.owner.trigger(this.alarmMessage);
						}
					} else {
						if ( Math.floor(this.time / this.alarmTime) < Math.floor(this.prevTime / this.alarmTime))
						{
							this.owner.trigger(this.alarmMessage);
						}
					}
				} else {
					if (this.isIncrementing)
					{
						if (this.time > this.alarmTime && this.prevTime < this.alarmTime)
						{
							this.owner.trigger(this.alarmMessage);
						}
					} else {
						if (this.time < this.alarmTime && this.prevTime > this.alarmTime)
						{
							this.owner.trigger(this.alarmMessage);
						}
					}
	 			}
			}
		}
		this.owner.trigger(this.updateMessage, {time: this.time});
	};
	
	proto['set-timer'] = function(data){
		this.time = data.time;
	};
	
	proto['start-timer'] = function(){
		this.isOn = true;
	};
	
	proto['stop-timer'] = function(){
		this.isOn = false;
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
