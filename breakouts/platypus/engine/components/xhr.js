/**
# COMPONENT **xhr**
This component enables XHR communication with a server.

## Messages

### Listens for:
- **request** - On receiving this message, this component makes a request from the server using the provided information. Note that properties set here will reset the properties set by this component's JSON definition.
  - @param message.method (string) - XHR method to use: must be "GET" or "POST".
  - @param message.path (string) - The path to the server resource.
  - @param message.responseType (string) - Response type expected: this defaults to "text".
  - @param message.data (object) - An object of string key/value pairs to be transmitted to the server.
  - @param message.onload (function) - A function that should be run on receiving a response from the server. This defaults to triggering a "response" message containing the responseText value.
  
### Local Broadcasts:
- **response** - This message is triggered on receiving a response from the server (if "onload" is not set by the original "request" message).
  - @param message (string) - The message contains the responseText returned by the server.

## JSON Definition
    {
      "type": "xhr",
      
      "method": "POST",
      // Optional. Sets the XHR method to use. Default is "GET".
      
      "path": "http://server.com/engine",
      // Optional. Sets the path to connect to the server.
      
      "responseType": "text",
      // Optional. Sets the XHR response type. Defaults to "text"
    }
*/
(function(){
	return platformer.createComponentClass({
		id: 'xhr',
		
		constructor: function(definition){
			this.setProperties(definition);
		},

		events: {// These are messages that this component listens for
			"request": function(resp){
				this.setProperties(resp);
				
				if(this.method === "GET"){
					this.get();
				} else if (this.method === "POST") {
					this.post();
				} else {
					throw "Method must be GET or POST";
				}
			}
		},
		
		methods: {// These are methods that are called on the component
			setProperties: function(properties){
				var key = null,
				divider = '',
				self    = this,
				props   = properties || this;
				
				this.method       = props.method       || this.method       || "GET";
				this.path         = props.path         || this.path         || null;
				this.responseType = props.responseType || this.responseType || "text";
				
				if((props !== this) && props.data){
					this.data = '';
					for (key in props.data) {
						this.data += divider + key + '=' + props.data[key];
						divider = '&';
					}
				} else {
					this.data = '';
				}
				
				this.onload = props.onload || this.onload || function(e) {
				    if (this.status === 200) {
				    	self.owner.trigger('response', this.responseText);
				    }
				};
			},
			get: function(){
				var xhr = new XMLHttpRequest(),
				path    = this.path;
				
				if(this.data){
					path += '?' + this.data;
				}
				
				xhr.open(this.method, path, true);
				xhr.responseType = this.responseType;
				xhr.onload = this.onload;
				xhr.send();
			},
			post: function(){
				var xhr = new XMLHttpRequest();
				
				xhr.open(this.method, this.path, true);
				xhr.responseType = this.responseType;
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhr.onload = this.onload;
				xhr.send(this.data);
			}
		}
	});
})();
