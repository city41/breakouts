/**
# COMPONENT **asset-loader**
This component loads a list of assets, wrapping PreloadJS functionality into a game engine component. Settings and files are pulled from the information provided in config.js, with the expectation that this component will exist on the initial loading screen.

## Dependencies
- [createjs.PreloadJS][link1] - Requires the PreloadJS library to load a list of assets.

## Messages

### Listens for:
- **load** - On receiving this event, the asset loader begins downloading the list of assets.
- **fileload** - This message used to update a progress bar if one has been defined by JSON.
  - @param fraction (Number) - Value of (progress / total) is used to set the width of the progress bar element.

### Local Broadcasts:
- **fileload** - This message is broadcast when an asset has been loaded.
  - @param complete (Boolean) - Whether this is the final asset to be loaded.
  - @param total (Number) - The total number of assets being loaded.
  - @param progress (Number) - The number of assets finished loading.
  - @param fraction (Number) - Value of (progress / total) provided for convenience.
- **complete** - This message is triggered when the asset loader is finished loading assets.

## JSON Definition
    {
      "type": "asset-loader",
      
      "assets": [
      // Optional. A list of assets to load; typically the asset list is pulled directly from the config.json file.
        {"id": "item-1",         "src": "images/item-1.png"},
        {"id": "item-2",         "src": "images/item-2.png"},
        {"id": "item-3",         "src": "images/item-3.png"}
      ]
      
      "progressBar": "progress-bar",
      // Optional. A DOM element id for a DIV that should be updated as assets are loaded.
      
      "useXHR": true
      // Whether to use XHR for asset downloading. The default is `true`.
    }

[link1]: http://www.createjs.com/Docs/PreloadJS/modules/PreloadJS.html

*/
(function(){
	return platformer.createComponentClass({
		id: 'asset-loader',
		
		constructor: function(definition){
			this.useXHR = true;
			
			if(definition.useXHR === false){
				this.useXHR = false;
			}
			
			this.assets = definition.assets || platformer.settings.assets;
			
			this.progressBar = definition.progressBar || false;
			
			this.message = {
				complete: false,
				total: 0,
				progress: 0,
				fraction: 0
			};
		},

		events: {// These are messages that this component listens for
		    "load": function(){
		    	var self = this,
		    	checkPush = function(asset, list){
		    		var i = 0,
		    		found = false;
		    		for(i in list){
		    			if(list[i].id === asset.id){
		    				found = true;
		    				break;
		    			}
		    		}
		    		if(!found){
		    			list.push(asset);
		    		}
		    	},
		    	loader     = new createjs.LoadQueue(this.useXHR),
		    	loadAssets = [],
		    	optimizeImages = platformer.settings.global.nativeAssetResolution || 0, //assets designed for this resolution
		    	scale = platformer.settings.scale = optimizeImages?Math.min(1, Math.max(window.screen.width, window.screen.height) * (window.devicePixelRatio || 1) / optimizeImages):1,
//		    	scale = platformer.settings.scale = optimizeImages?Math.min(1, Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio / optimizeImages):1,
		    	scaleImage = function(img, columns, rows){
		    		var r          = rows    || 1,
		    		c              = columns || 1,
		    		imgWidth       = Math.ceil((img.width  / c) * scale) * c,
		    		imgHeight      = Math.ceil((img.height / r) * scale) * r,
		    		element        = document.createElement('canvas'),
		    		ctx            = element.getContext('2d');
		    		element.width  = imgWidth;
		    		element.height = imgHeight;
		    		element.scaleX = imgWidth  / img.width;
		    		element.scaleY = imgHeight / img.height;
		    		ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, imgWidth, imgHeight);
		    		return element;
		    	};
		    	
		    	loader.addEventListener('fileload', function (event) {
		    		var item = event.item,
		    		data     = item.data,
		    		result   = item.tag;
		    		
		    		if(event.item.type == "image"){
		    			if(optimizeImages && (scale !== 1)){
		    				if(data){
		    					result = scaleImage(result, data.columns, data.rows);
		    				} else {
		    					result = scaleImage(result);
		    				}
		    			}
		    		}
		    		
		    		platformer.assets[event.item.id] = result;
		    		
		    		self.message.progress += 1;
		    		self.message.fraction = self.message.progress/self.message.total;
		    		if(self.message.progress === self.message.total){
		    			self.message.complete = true;
		    		}
	    			self.owner.trigger('fileload', self.message);
		    	});
		    	
		    	loader.addEventListener('complete', function (event) {
	    			self.owner.trigger('complete');
		    	});
		    	
		    	for(var i in this.assets){
		    		if(typeof this.assets[i].src === 'string'){
		    			checkPush(this.assets[i], loadAssets);
		    		} else {
		    			for(var j in this.assets[i].src){
		    				if(platformer.settings.aspects[j] && this.assets[i].src[j]){
		    					if(typeof this.assets[i].src[j] === 'string'){
		    						this.assets[i].src  = this.assets[i].src[j];
		    						checkPush(this.assets[i], loadAssets);
		    					} else {
		    						this.assets[i].data    = this.assets[i].src[j].data || this.assets[i].data;
		    						this.assets[i].assetId = this.assets[i].src[j].assetId;
		    						this.assets[i].src     = this.assets[i].src[j].src;
		    						checkPush({
		    							id:  this.assets[i].assetId || this.assets[i].id,
		    							src: this.assets[i].src
		    						}, loadAssets);
		    					}
		    					break;
		    				}
		    			}
		    			if(typeof this.assets[i].src !== 'string'){
		    				if(this.assets[i].src['default']){
		    					if(typeof this.assets[i].src['default'] === 'string'){
		    						this.assets[i].src  = this.assets[i].src['default'];
		    						checkPush(this.assets[i], loadAssets);
		    					} else {
		    						this.assets[i].data    = this.assets[i].src['default'].data || this.assets[i].data;
		    						this.assets[i].assetId = this.assets[i].src['default'].assetId;
		    						this.assets[i].src     = this.assets[i].src['default'].src;
		    						checkPush({
		    							id:  this.assets[i].assetId || this.assets[i].id,
		    							src: this.assets[i].src
		    						}, loadAssets);
		    					}
		    				} else {
		    					console.warn('Asset has no valid source for this browser.', this.assets[i]);
		    				}
		    			}
		    		}
		    	}

		    	// Allow iOS 5- to play HTML5 audio using SoundJS by overriding the isSupported check. (Otherwise there is no audio support for iOS 5-.)
		    	createjs.HTMLAudioPlugin.isSupported = function () {
		    		createjs.HTMLAudioPlugin.generateCapabilities();
		    		var t = createjs.HTMLAudioPlugin.tag;
		    		if (t == null || createjs.HTMLAudioPlugin.capabilities == null) {
		    			return false;
		    		}
		    		return true;
		    	};
//		    	createjs.Sound.initializeDefaultPlugins();
		    	createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);

		    	self.message.total = loadAssets.length;
		    	loader.installPlugin(createjs.Sound);
		    	loader.loadManifest(loadAssets);
		    	platformer.assets = [];
		    },
		
		    "fileload": function(resp) {
		    	var pb = null;
		    	
		    	if(this.progressBar){
		    		pb = document.getElementById(this.progressBar);
		    		if(pb){
		    			pb = pb.style;
		    			
		    			pb.width = (resp.fraction * 100) + '%';
		    			pb.backgroundSize = ((1 / resp.fraction) * 100) + '%';
		    		}
		    	}
		    }
		}
		
	});
})();
